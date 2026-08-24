# Deploy em Produção — Railway

## Contexto

O app roda **inteiro no Railway**: frontend Next.js + rotas de API
`/api/**` (mesmo processo — não há backend separado) + banco de dados
Postgres (plugin do próprio Railway). **O Supabase saiu completamente do
projeto** — banco, Auth e Storage. Ver [AUTH_GUIDE.md](./AUTH_GUIDE.md) para
o novo login e a seção "Imagens" abaixo para o Cloudflare R2.

Diferença de infraestrutura que mais importa: a Vercel rodava o app como
funções serverless (processo novo a cada request — daí os problemas de
`ENOTFOUND`/pool de conexões documentados em
[FIX_CORS_PRODUCTION.md](./FIX_CORS_PRODUCTION.md), hoje históricos); o
Railway roda **um processo Node de vida longa** (`node server.js` dentro de
um container), então o pool de conexões `pg` em
[src/lib/db.ts](../lib/db.ts) se comporta como esperado — abre uma vez, é
reaproveitado entre requests.

## O que mudou (SPEC)

| # | Item | Antes | Agora |
|---|------|-------|-------|
| 1 | Banco de dados | Postgres gerenciado pelo Supabase | Postgres do plugin do Railway |
| 2 | Leitura de produtos | Cliente Supabase direto do browser (`useSupabaseData`) | `/api/products` (rota `pg`-backed) via novo hook `useProducts` |
| 3 | Preço autoritativo no checkout | `supabase.from("products")` em `/api/create-payment` | `query()` (`pg`) — mesmo caminho usado pelo resto do app |
| 4 | Auth (`/orders`) | Supabase Auth (`@supabase/ssr`) | NextAuth v5 (Credentials + tabela `users`) — ver [AUTH_GUIDE.md](./AUTH_GUIDE.md) |
| 5 | Imagens de produto | Supabase Storage (`*.supabase.co/storage/...`) | Cloudflare R2, via `NEXT_PUBLIC_R2_PUBLIC_URL` (`src/lib/images.ts`) |
| 6 | Build para produção | Sem `output` configurado, sem Dockerfile | `next.config.ts` com `output: "standalone"`; `Dockerfile` multi-stage |
| 7 | Runtime do Railway | — | `railway.toml` apontando pro Dockerfile + healthcheck |
| 8 | Healthcheck | Inexistente | `GET /api/health` |
| 9 | CORS | Só reconhecia `NEXT_PUBLIC_BASE_URL`/`VERCEL_URL` | `src/lib/cors.ts` também reconhece `RAILWAY_PUBLIC_DOMAIN` |
| 10 | SSL do Postgres | Forçado sempre (exigência do Supabase) | Opt-in (`sslmode` na URL ou `DATABASE_SSL=true`) — o Postgres interno do Railway não fala SSL |

Os dois caminhos de dados que existiam antes (Supabase client vs. `pg` Pool)
**deixaram de existir** — hoje só há um: tudo passa por `src/lib/db.ts`
(`pg.Pool`, `DATABASE_URL`). Se você está lendo isso numa sessão futura e o
`CLAUDE.md` ainda menciona "dois caminhos", ele está desatualizado.

## Banco de dados: provisionar e migrar dados

1. No projeto do Railway: **New → Database → PostgreSQL**. Isso cria um
   serviço Postgres e uma variável `DATABASE_URL` que pode ser referenciada
   por outros serviços do mesmo projeto como `${{Postgres.DATABASE_URL}}`.
2. Rodar o schema (ordem importa — arquivos numerados são migrações
   incrementais):
   ```bash
   psql $DATABASE_URL -f sql/orders.sql
   psql $DATABASE_URL -f sql/init.sql
   psql $DATABASE_URL -f sql/easter_customization.sql
   psql $DATABASE_URL -f sql/002_payment_flow.sql
   psql $DATABASE_URL -f sql/004_auth_users.sql
   psql $DATABASE_URL -f sql/005_payment_events_status_key.sql
   ```
   (`sql/003_rls_policies.sql` é específico do Supabase — não rodar.)
3. **Migrar os dados existentes** (produtos/pedidos reais que hoje estão no
   Postgres do Supabase) — não é só rodar o `init.sql` de exemplo:
   ```bash
   pg_dump --data-only --table=products --table=orders --table=order_items \
     --table=payment_events "$OLD_SUPABASE_DATABASE_URL" > data.sql
   psql "$DATABASE_URL" -f data.sql
   ```
4. Criar o primeiro usuário da gestora — ver [AUTH_GUIDE.md](./AUTH_GUIDE.md).

## Imagens: Cloudflare R2

As credenciais R2 não são mais só pra migração pontual — a tela de produtos
do painel (`/admin/produtos`) sobe novas imagens direto pro R2 via
`POST /api/products/upload-image` ([route.ts](../app/api/products/upload-image/route.ts),
lógica em [src/lib/r2.ts](../lib/r2.ts)), então `R2_ACCOUNT_ID`,
`R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME` e
`NEXT_PUBLIC_R2_PUBLIC_URL` precisam estar configuradas em produção pra esse
botão funcionar, não só localmente pra rodar a migração abaixo.

1. Criar um bucket R2 no Cloudflare Dashboard, habilitar acesso público
   (domínio `pub-<hash>.r2.dev` ou um domínio próprio) e gerar credenciais
   de API (S3-compatible) em **R2 → Manage API Tokens**.
2. Rodar a migração (baixa do Supabase Storage antigo, reenvia pro R2 com a
   mesma chave `images/<arquivo>`):
   ```bash
   R2_ACCOUNT_ID=... R2_ACCESS_KEY_ID=... R2_SECRET_ACCESS_KEY=... \
   R2_BUCKET_NAME=docesbibi \
   SOURCE_SUPABASE_STORAGE_URL=https://<projeto>.supabase.co/storage/v1/object/public/images \
   DATABASE_URL=$DATABASE_URL \
   node scripts/migrate-images-to-r2.mjs
   ```
3. Repontar as URLs já salvas no banco pro novo domínio:
   ```sql
   UPDATE products SET image = REPLACE(
     image,
     'https://<projeto>.supabase.co/storage/v1/object/public/images/',
     '<NEXT_PUBLIC_R2_PUBLIC_URL>/images/'
   );
   ```
4. Setar `NEXT_PUBLIC_R2_PUBLIC_URL` no Railway (variável de build **e**
   runtime — é inlined no bundle do browser). Isso também é o que
   `src/constants/products.ts`/`easter.ts`/`src/app/page.tsx` usam via
   `r2Image()` ([src/lib/images.ts](../lib/images.ts)) para os banners e
   imagens fixas que não vêm do banco.
5. Se o bucket usar um domínio próprio (não `*.r2.dev`), adicionar o
   hostname exato em `images.remotePatterns` no
   [next.config.ts](../../next.config.ts).

## Variáveis de ambiente necessárias no Railway

Configurar em **Railway → Project → Service → Variables**:

```
DATABASE_URL=${{Postgres.DATABASE_URL}}
DATABASE_SSL=false

AUTH_SECRET=...              # npx auth secret

NEXT_PUBLIC_R2_PUBLIC_URL=https://pub-xxxxxxxx.r2.dev
R2_ACCOUNT_ID=...             # obrigatória em runtime — upload de imagem em /admin/produtos usa isso
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET_NAME=docesbibi

MERCADO_PAGO_ACCESS_TOKEN=APP_USR-...
MERCADO_PAGO_PUBLIC_KEY=APP_USR-...
MERCADO_PAGO_WEBHOOK_SECRET=...

RESEND_API_KEY=...           # https://resend.com/api-keys
EMAIL_FROM=Doces Bibi <pedidos@docesbibi.com.br>   # domínio verificado no Resend, ver EMAIL_GUIDE.md
STORE_OWNER_EMAIL=docesbibii@gmail.com

NEXT_PUBLIC_BASE_URL=https://docesbibi.com.br
NEXT_PUBLIC_API_URL=https://docesbibi.com.br

NODE_ENV=production
```

`PORT` e `RAILWAY_PUBLIC_DOMAIN` são injetadas automaticamente pelo Railway.

As variáveis `NEXT_PUBLIC_*` (`NEXT_PUBLIC_BASE_URL`, `NEXT_PUBLIC_API_URL`,
`NEXT_PUBLIC_R2_PUBLIC_URL`) são inlined no bundle do browser **durante o
build**, não em runtime — o Railway, ao usar o builder Dockerfile, passa as
variáveis do serviço automaticamente como build args para os `ARG` já
declarados no `Dockerfile`. Se isso não acontecer automaticamente na sua
versão do Railway, defina-as manualmente em **Settings → Build → Build
Variables** também.

> ⚠️ `MERCADO_PAGO_WEBHOOK_SECRET` é obrigatória em produção: sem ela,
> `validateWebhookSignature` (em [src/lib/mercadopago.ts](../lib/mercadopago.ts))
> rejeita todo webhook quando `NODE_ENV=production`.

## Checklist de deploy

1. **Criar o serviço Postgres** no Railway (ver seção acima) e migrar dados.
2. **Migrar as imagens** pro R2 (ver seção acima).
3. **Criar o serviço do app** apontando para este repositório — o
   `railway.toml` já diz pra usar o `Dockerfile`.
4. **Configurar as variáveis de ambiente** listadas acima.
5. **Definir o domínio**: `*.up.railway.app` gerado automaticamente, ou um
   domínio próprio em Settings → Networking → Custom Domain. Depois de
   decidido, `NEXT_PUBLIC_BASE_URL`/`NEXT_PUBLIC_API_URL` precisam apontar
   pra esse domínio final (redeploy necessário se mudar depois).
6. **Atualizar a Notification URL do Mercado Pago** para
   `https://<domínio-final>/api/webhook`.
7. **Criar o primeiro usuário da gestora** (`scripts/create-staff-user.mjs`).
8. **Deploy** e verificar `GET /api/health` retorna 200.
9. **Smoke test end-to-end**: abrir o site, ver se os produtos e imagens
   carregam, adicionar ao carrinho, ir até o checkout, confirmar que
   `POST /api/create-payment` cria o pedido e redireciona pro Mercado Pago,
   que o webhook de retorno atualiza o status do pedido, envia o e-mail de
   confirmação pro cliente e o de aviso pra `STORE_OWNER_EMAIL` (ver
   [EMAIL_GUIDE.md](./EMAIL_GUIDE.md)), e que o login em `/admin/login` dá
   acesso a `/orders`.

## O que não muda

- Autenticação continua protegendo só `/orders` — mesmo escopo de antes,
  mecanismo diferente (ver [AUTH_GUIDE.md](./AUTH_GUIDE.md)).
- `sql/` continua a fonte de verdade do schema (arquivos idempotentes,
  numerados incrementalmente); não há ferramenta de migração.
- O contrato das rotas `/api/**` não mudou (ver `API_DOCS.md`/`API_DOCS_ORDERS.md`).
