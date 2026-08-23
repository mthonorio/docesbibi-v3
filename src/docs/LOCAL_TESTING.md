# Ambiente local de testes (Docker)

O Postgres do Supabase usado antes em `.env.local` ficou inacessível
(`ENOTFOUND`) e de qualquer forma sai de uso quando o Railway estiver no ar
(ver [RAILWAY_DEPLOY.md](./RAILWAY_DEPLOY.md)). `docker-compose.yml` sobe um
Postgres local com o schema e a usuária de teste já prontos, pra testar a
aplicação de ponta a ponta sem depender de nenhum serviço externo.

## Uso

```bash
docker compose up -d
pnpm dev
```

Isso sobe:

- **`postgres`** — Postgres 17, aplica `sql/*.sql` automaticamente no
  primeiro start, na ordem de dependência real
  (`docker/postgres-init/01-run-migrations.sh` — não é a ordem alfabética
  que o Postgres usaria se os arquivos estivessem soltos na pasta de init;
  `orders.sql` depende de `products` já existir, por exemplo).
- **`seed-staff-user`** — container de uso único que roda
  `scripts/create-staff-user.mjs` assim que o Postgres fica saudável,
  criando a conta de teste da gestora: **`test@docesbibi.com.br` /
  `teste1234`**. Roda de novo (idempotente) toda vez que você sobe o
  compose — não duplica nem falha se a conta já existir.

`.env.local` já aponta `DATABASE_URL` pra esse Postgres local
(`postgresql://docesbibi:docesbibi@localhost:5432/docesbibi`). O app
(`pnpm dev`) roda no host, não em container — de propósito: rodar `next
dev` dentro de Docker no Windows/Mac tem desempenho ruim de watch de
arquivos (é a própria recomendação do Next.js — ver
`node_modules/next/dist/docs/.../self-hosting.md`, citado no `CLAUDE.md`).

## Testar a imagem de produção também (opcional)

```bash
docker compose --profile full up --build
```

Sobe também o serviço `app`, buildado a partir do `Dockerfile` real (o
mesmo usado no deploy do Railway) — útil pra validar que a imagem builda e
roda antes de fazer deploy, não pra iterar em desenvolvimento (sem hot
reload). Variáveis do Mercado Pago/Resend/R2 são lidas do ambiente do host
se estiverem setadas (`MERCADO_PAGO_ACCESS_TOKEN=... docker compose
--profile full up`), senão ficam vazias — funcionalidades que dependem
delas (pagamento, e-mail, imagens do R2) não funcionam nesse modo, mas o
resto da aplicação sim.

## Resetar o banco

```bash
docker compose down -v   # -v também remove o volume — apaga os dados
docker compose up -d
```

## Portas

Postgres expõe `5432` no host por padrão. Se já tiver um Postgres local
rodando nessa porta, definir `POSTGRES_PORT` antes de subir:

```bash
POSTGRES_PORT=5433 docker compose up -d
# e trocar a porta em DATABASE_URL no .env.local de acordo
```
