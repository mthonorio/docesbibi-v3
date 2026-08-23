# Autenticação (gestora e comprador)

Duas contas separadas compartilham a mesma configuração do
[Auth.js/NextAuth v5](https://authjs.dev): a gestora (`/admin/login`,
protege `/admin/dashboard`, `/admin/vendas`, `/admin/produtos`) e o
comprador (`/entrar`/`/cadastro`, protege `/pedidos`). Isso substituiu o
Supabase Auth quando o projeto saiu do Supabase por completo (ver
[RAILWAY_DEPLOY.md](./RAILWAY_DEPLOY.md)).

## Como funciona

- [src/lib/auth.ts](../lib/auth.ts) — config do NextAuth com **dois**
  providers `Credentials`: `id: "credentials"` (gestora, consulta `users` —
  `sql/004_auth_users.sql`) e `id: "customer"` (comprador, consulta
  `customers` — `sql/006_customers.sql`), ambos via `bcryptjs.compare`.
  Cada `authorize()` devolve um `role` (`"staff"` ou `"customer"`),
  propagado pro token/sessão em `callbacks.jwt`/`callbacks.session`. Sessão
  em cookie JWT, sem tabela de sessão. O module augmentation que declara
  `session.user.role`/`.id` fica em
  [src/types/next-auth.d.ts](../types/next-auth.d.ts).
- [src/app/api/auth/[...nextauth]/route.ts](../app/api/auth/[...nextauth]/route.ts)
  — expõe os endpoints padrão do NextAuth (`/api/auth/callback/credentials`,
  `/api/auth/callback/customer`, `/api/auth/session`, etc).
- [src/proxy.ts](../proxy.ts) — `export const proxy = auth((request) => {...})`.
  `auth()` decodifica o cookie JWT e popula `request.auth`; roda no runtime
  Edge do Proxy sem bater no banco (só verifica a assinatura do token) — a
  consulta em `users`/`customers` só acontece uma vez, no momento do login.
  `STAFF_PATHS` exige `role === "staff"` (redireciona pra `/admin/login`);
  `CUSTOMER_PATHS` exige `role === "customer"` (redireciona pra `/entrar`).
- [src/lib/auth-guards.ts](../lib/auth-guards.ts) — `requireStaff()` e
  `requireCustomer()`, usados dentro das próprias rotas de API (não no
  proxy, que só protege navegação de página — ver nota em
  `CLAUDE.md` § Admin panel).
- `signIn("credentials", {...})` (gestora, em
  [admin/login/page.tsx](../app/admin/login/page.tsx)) e
  `signIn("customer", {...})` (comprador, em
  [entrar/page.tsx](<../app/(public)/entrar/page.tsx>) e
  [cadastro/page.tsx](<../app/(public)/cadastro/page.tsx>)) — ambos de
  `next-auth/react`, com `redirect: false`.

## Variáveis de ambiente

- `AUTH_SECRET` — obrigatória. Gerar com `npx auth secret` ou
  `openssl rand -base64 33`. Uma por ambiente (dev ≠ produção).
- `trustHost: true` já está fixo em `src/lib/auth.ts` — necessário porque,
  fora da Vercel, o NextAuth não confia no header `Host` por padrão. A
  origem pública real já é controlada por `NEXT_PUBLIC_BASE_URL` +
  `src/lib/cors.ts`.

## Criar o primeiro usuário (gestora)

Não existe tela de cadastro pra gestora — por design, só quem tem acesso ao
`DATABASE_URL` cria contas de staff. Rodar:

```bash
node scripts/create-staff-user.mjs "voce@docesbibi.com.br" "senha-forte"
```

Com `DATABASE_URL` no ambiente (`.env.local` localmente, ou exportada na
sessão do terminal para produção), o script cria/atualiza o usuário direto
no banco. Sem `DATABASE_URL`, ele só imprime o `INSERT` SQL para rodar
manualmente (`psql $DATABASE_URL -c "..."`).

Rodar de novo com o mesmo e-mail atualiza a senha (`ON CONFLICT (email) DO
UPDATE`) — é assim que se troca a senha de um usuário existente, não tem
fluxo de "esqueci minha senha".

## Conta do comprador

Ao contrário da gestora, o comprador se cadastra sozinho em `/cadastro` →
`POST /api/auth/register` ([route.ts](../app/api/auth/register/route.ts)):
valida os dados com `zod`, faz hash da senha com `bcryptjs` e insere em
`customers`. Sem fluxo de verificação de e-mail (mesmo nível de confiança
que o cadastro de staff — não há verificação em nenhum dos dois).

**Reivindicação de pedidos antigos**: pedidos feitos como visitante (sem
login) ficam com `orders.customer_id = NULL`. No momento do cadastro, o
`POST /api/auth/register` roda
`UPDATE orders SET customer_id = $1 WHERE customer_email = $2 AND customer_id IS NULL`
— então pedidos anteriores feitos com o mesmo e-mail passam a aparecer em
`/pedidos` automaticamente, sem precisar de nenhuma ação extra da pessoa.
Isso não é uma prova criptográfica de posse do e-mail (o cadastro em si
também não verifica o e-mail) — é uma migração pragmática do estado atual
(busca aberta por e-mail) pra um vínculo real de conta, consistente com o
resto do sistema.

Checkout continua permitindo compra como visitante (`/api/create-payment`
não exige login) — se a pessoa estiver logada, o pedido já nasce vinculado
via `customer_id`; se não, o vínculo só acontece se/quando ela se cadastrar
depois com o mesmo e-mail.
