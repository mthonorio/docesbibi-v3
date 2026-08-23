# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## ⚠️ Non-standard Next.js version

`next` is pinned to `16.2.1` (not a real/current public release — treat your training-data assumptions about Next.js as unreliable here). Before touching routing, caching, middleware, or config, check `node_modules/next/dist/docs/` for the actual behavior. One confirmed breaking change already reflected in this codebase:

- **Middleware → Proxy**: `middleware.ts` no longer exists. Server-side request interception lives in [src/proxy.ts](src/proxy.ts), exporting a `proxy()` function (not `middleware()`) with the same `config.matcher` convention.

## Commands

```bash
docker compose up -d  # local Postgres + test staff user, see src/docs/LOCAL_TESTING.md
pnpm dev      # start dev server (Turbopack), http://localhost:3000
pnpm build    # production build
pnpm start    # run production build
pnpm lint     # eslint (flat config: eslint.config.mjs)
```

Package manager is **pnpm** (`pnpm-lock.yaml`, `pnpm-workspace.yaml` present) — don't use npm/yarn commands. `docker-compose.yml` is dev/test-only (local Postgres with the real schema applied, plus a seeded staff login) — not what production uses; Railway builds `Dockerfile` directly.

There is no test runner configured in this repo. `test-api.sh` is a manual curl script for exercising the API routes, not an automated test suite.

## Architecture

This is a Next.js App Router storefront ("Doces Bibi") for a candy/confectionery business, with product browsing, cart, checkout via Mercado Pago, and order management.

### Single data-access path: `pg` Pool through route handlers

There is no Supabase anywhere in this project anymore (banco, Auth, and Storage all left — see [src/docs/RAILWAY_DEPLOY.md](src/docs/RAILWAY_DEPLOY.md) for the migration off it). Every read and write, from every surface (client components, route handlers, auth), goes through one path: [src/lib/db.ts](src/lib/db.ts) exports a `pg.Pool`-backed `query()`, used by `src/app/api/**/route.ts` handlers via `DATABASE_URL` (Postgres plugin on Railway). Client components fetch products through `/api/products` (`useProducts` in [src/hooks/useProducts.ts](src/hooks/useProducts.ts), `useEasterProducts`) rather than talking to Postgres directly — there is no browser-side DB client. Order creation is centralized in [src/lib/orders-service.ts](src/lib/orders-service.ts) (`createOrder`, `updateOrderPaymentStatus`, idempotency helpers), used by both `/api/orders` and `/api/create-payment` — don't insert into `orders`/`order_items` directly from a route handler, go through this module.

`DATABASE_SSL` env var / `sslmode` in the connection string controls whether the pool uses SSL — off by default, since the Railway Postgres plugin's internal network doesn't speak SSL (see `src/lib/db.ts`).

[src/docs/MIGRATION_STATUS.md](src/docs/MIGRATION_STATUS.md) and [src/docs/FIX_CORS_PRODUCTION.md](src/docs/FIX_CORS_PRODUCTION.md) are historical records of the earlier Vercel+Supabase setup — flagged deprecated at the top, kept for context on *why* certain decisions (e.g. this app running as one long-lived process rather than serverless functions) look the way they do.

### Request flow: cart → payment → order

1. Client builds a cart in `useCartStore` ([src/store/cart.store.ts](src/store/cart.store.ts), zustand + `persist` to localStorage).
2. Checkout ([src/app/(public)/checkout/page.tsx](<src/app/(public)/checkout/page.tsx>)) posts to `POST /api/create-payment`, which validates input with `zod`, **looks up authoritative prices from Postgres by product UUID** (never accepts client-sent prices), **creates the order first** (status `aguardando_pagamento`, via `orders-service.createOrder`) using the order's own ID as `external_reference`, then creates a Mercado Pago `Preference` and returns `init_point` for redirect. If the MP call fails, the order is marked `cancelado` rather than left orphaned.
3. Mercado Pago redirects back to `/checkout/{success,failure,pending}` (all three are client components using `useSearchParams` and therefore need a `Suspense` wrapper around the part that reads it — see the `*PageContent` + default-export-wrapper pattern already used in those three files and in `src/app/admin/login/page.tsx`; a static page using `useSearchParams` without it fails `next build`).
4. `POST /api/webhook` receives async payment notifications from Mercado Pago. [src/lib/mercadopago.ts](src/lib/mercadopago.ts) validates the `x-signature` HMAC (rejects with 401 if invalid; requires `MERCADO_PAGO_WEBHOOK_SECRET`), looks up payment status, and `mapPaymentStatusToOrderStatus` maps it to the internal `OrderStatus` enum. Idempotency (`payment_events`, checked before applying any change since Mercado Pago retries notifications) is keyed on **`(mp_payment_id, status)`**, not just `mp_payment_id` — a single payment gets one notification per status transition (e.g. `pending` then later `approved` for Pix/boleto/3DS), so keying on the payment id alone would silently drop the transition that actually matters. When a webhook moves an order to `pago`, it also fires the two transactional emails (see below).
5. Orders are managed through `useOrderStore` ([src/store/order.store.ts](src/store/order.store.ts)) → `src/lib/api-clients/orders.ts` → `/api/orders*` route handlers → `orders-service.ts` → Postgres.

### Transactional email

[src/lib/email.ts](src/lib/email.ts) (Resend) sends two emails — a confirmation to the customer, and an order-details notification to `STORE_OWNER_EMAIL` (never an address supplied by the client) — never thrown from, so a delivery failure can't break the order/payment flow that triggered it; a missing `RESEND_API_KEY` makes both a silent no-op (logged), which is the expected local-dev state. They fire from exactly two places, both *after* a purchase is confirmed, not at order creation: `/api/webhook` when a payment transitions to `pago`, and `/api/orders` `POST` (the manual, non-online-payment path, which has no payment event to wait for). See [src/docs/EMAIL_GUIDE.md](src/docs/EMAIL_GUIDE.md).

`OrderStatus` (see [src/types/api.ts](src/types/api.ts)) is the 8-state production flow: `novo_pedido → aguardando_pagamento → pago → em_producao → pronto_retirada → saiu_entrega → finalizado`, plus `cancelado`. This replaced an earlier 5-value enum — `sql/002_payment_flow.sql` has the migration and the old→new value mapping.

### Admin panel (`/admin`)

The staff surface — previously a single page at `/orders` — is now a real panel under `src/app/admin/(dashboard)/` (`dashboard`, `vendas`, `vendas/[id]`, `produtos`), sharing `AdminSidebar` via `src/app/admin/(dashboard)/layout.tsx`. It intentionally does **not** get the storefront chrome: `LayoutClient` (Header/CartSheet/Footer/BottomNav) is mounted in [src/app/(public)/layout.tsx](<src/app/(public)/layout.tsx>), not the root layout, so admin routes render under their own shell. `admin/login` sits outside the `(dashboard)` group (no sidebar — it's the page an unauthenticated request lands on).

Requires a logged-in session via NextAuth v5 (Auth.js) — [src/lib/auth.ts](src/lib/auth.ts) defines **two** `Credentials` providers on the same config, distinguished by a `role` field (`"staff" | "customer"`) propagated through `callbacks.jwt`/`callbacks.session` (see the module augmentation in `src/types/next-auth.d.ts`): provider id `"credentials"` checks the `users` table (`sql/004_auth_users.sql`) and returns `role: "staff"`; provider id `"customer"` checks the new `customers` table (`sql/006_customers.sql`) and returns `role: "customer"`. Both use `bcryptjs`, JWT session strategy (no session table). [src/proxy.ts](src/proxy.ts) wraps its exported `proxy` function in `auth(...)`, which decodes the session cookie (Edge-safe, no DB hit) and populates `request.auth`; `STAFF_PATHS` (`/admin/dashboard`, `/admin/vendas`, `/admin/produtos`) redirect to `/admin/login` when `role !== "staff"`, `CUSTOMER_PATHS` (`/pedidos`) redirect to `/entrar` when `role !== "customer"` — `/admin/login`, `/entrar`, `/cadastro` are deliberately excluded to avoid redirect loops. Staff accounts are still created manually with `node scripts/create-staff-user.mjs <email> <password>` (see [src/docs/AUTH_GUIDE.md](src/docs/AUTH_GUIDE.md)); customers self-register via `POST /api/auth/register` ([src/app/(public)/cadastro/page.tsx](<src/app/(public)/cadastro/page.tsx>)), which also "claims" any guest orders with a matching `customer_email` (`orders.customer_id IS NULL`) onto the new account.

**The proxy only protects page navigation, not `/api/*` calls** (its `/api/` branch just adds CORS headers and returns early) — every mutating or PII-returning API route must gate itself explicitly with the helpers in [src/lib/auth-guards.ts](src/lib/auth-guards.ts): `requireStaff()` on `GET/POST /api/orders`, `PATCH/DELETE /api/orders/:id`, and `POST/PATCH/DELETE /api/products*`; `requireCustomer()` on `GET /api/orders/mine`. `GET /api/orders/:id` checks ownership inline (staff always; a customer only if `order.customer_id` matches their session) and returns 404 (not 403) to anyone else, to avoid confirming an order's existence. `GET /api/products` stays public but only returns `active = true` unless `?includeInactive=true` (used by the admin panel).

The Dashboard's KPIs (revenue, order count, average ticket, 7-day chart) are computed client-side from `GET /api/orders` — no aggregation endpoint exists; see the comment in `src/app/admin/(dashboard)/dashboard/page.tsx` for when that stops being good enough.

Customers get their own order lookup at `/pedidos` (`GET /api/orders/mine`, scoped to `session.user.id` — no email parameter involved) and `/pedidos/[id]`, both behind `CUSTOMER_PATHS`. `OrderStatusTimeline` ([src/components/molecules/OrderStatusTimeline](src/components/molecules/OrderStatusTimeline/index.tsx)) renders the real 7-step flow and is shared between this page and the admin order detail page. Checkout (`/api/create-payment`) still allows guest purchase (no login required) — if a customer session exists, the resulting order is linked via `customer_id` immediately; otherwise it's linked only if/when the buyer later registers with the same email (the claim step above).

### CORS

[src/lib/cors.ts](src/lib/cors.ts) is the single source of truth, consumed by [src/proxy.ts](src/proxy.ts). Allowed origins are `NEXT_PUBLIC_BASE_URL`, `RAILWAY_PUBLIC_DOMAIN`, `VERCEL_URL` (legacy fallback), and `http://localhost:3000` — never `*`. If you add a new trusted origin, do it there, not by re-adding headers in an individual route handler.

### Component structure (atomic design)

`src/components/` is organized as `atoms/` (shadcn primitives, radix-based — see [components.json](components.json), style `radix-vega` — plus small standalone atoms like `StatusBadge`), `molecules/` (composed, e.g. `CartSheet`, `ProductCard`, `ProductsGrid`, `BottomNav`, `OrderStatusTimeline`), `organisms/` (larger composed features, e.g. `CustomEasterEgg`, `AdminSidebar`), and `forms/` (e.g. `CreateOrderForm`, used both from the old flow and now as a dialog on `/admin/vendas` for manual orders). State and callbacks are passed down from page components (props drilling), not context. See [src/components/README.md](src/components/README.md) for the existing (partial) documentation of this pattern — it predates some newer components so isn't exhaustive.

Path alias `@/*` → `src/*` (see [tsconfig.json](tsconfig.json)).

### Domain-specific feature: Easter egg customization

`easter` is a product category with its own customization flow: [src/constants/easter.ts](src/constants/easter.ts) defines egg models/sizes, [src/hooks/useCustomEasterEgg.ts](src/hooks/useCustomEasterEgg.ts) + [src/components/organisms/CustomEasterEgg.tsx](src/components/organisms/CustomEasterEgg.tsx) handle flavor selection (1–3 flavors depending on model), and `EasterFlavor`/`CustomEasterEgg`/`OrderItemEaster` types in [src/types/api.ts](src/types/api.ts) extend the base `Product`/`OrderItem` model. See [src/docs/EASTER_CUSTOMIZATION.md](src/docs/EASTER_CUSTOMIZATION.md).

### Reference docs

`src/docs/` contains implementation notes written during development (Portuguese) — check these before re-deriving context that's already documented:
- [API_DOCS.md](src/docs/API_DOCS.md) / [API_DOCS_ORDERS.md](src/docs/API_DOCS_ORDERS.md) — REST route contracts
- [AUTH_GUIDE.md](src/docs/AUTH_GUIDE.md) — NextAuth setup, creating staff users
- [EMAIL_GUIDE.md](src/docs/EMAIL_GUIDE.md) — Resend setup, when/why each transactional email fires
- [MERCADO_PAGO_GUIDE.md](src/docs/MERCADO_PAGO_GUIDE.md) — payment integration
- [ORDERS_IMPLEMENTATION.md](src/docs/ORDERS_IMPLEMENTATION.md) — order lifecycle
- [DEPLOY_GUIDE.md](src/docs/DEPLOY_GUIDE.md) — Railway deploy troubleshooting
- [LOCAL_TESTING.md](src/docs/LOCAL_TESTING.md) — `docker-compose.yml` for a local Postgres + seeded staff login, dev/test only
- [RAILWAY_DEPLOY.md](src/docs/RAILWAY_DEPLOY.md) — full deploy spec: Postgres provisioning, image migration to R2, env vars, checklist
- [SUPABASE_GUIDE.md](src/docs/SUPABASE_GUIDE.md), [MIGRATION_STATUS.md](src/docs/MIGRATION_STATUS.md), [FIX_CORS_PRODUCTION.md](src/docs/FIX_CORS_PRODUCTION.md) — historical only, flagged deprecated at the top of each; the Supabase/Vercel setup they describe no longer exists

`sql/` holds the schema/seed SQL (`init.sql`, `orders.sql`, `easter_customization.sql`, `002_payment_flow.sql`, `004_auth_users.sql`, `005_payment_events_status_key.sql`, `006_customers.sql`, `007_delivery_and_stock.sql`; `003_rls_policies.sql` is Supabase-only and no longer applicable) run directly against Postgres — there is no migration tool. Files are numbered from `002_` onward and are written to be idempotent (safe to re-run); apply new ones by running the file's contents against `DATABASE_URL` (`psql`) and keep this directory as the record of schema history since there's no other migration log.
