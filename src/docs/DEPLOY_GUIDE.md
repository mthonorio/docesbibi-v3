# Guia de Deploy e Configuração de Produção

> O deploy é feito no **Railway**, não mais na Vercel. Para o passo a passo
> completo (variáveis de ambiente, Dockerfile, checklist) veja
> [RAILWAY_DEPLOY.md](./RAILWAY_DEPLOY.md) — este arquivo cobre só
> troubleshooting.

## Problemas Comuns

### 1. CORS Error no navegador

`src/lib/cors.ts` é a fonte única de verdade dos headers de CORS, aplicada
via [src/proxy.ts](../proxy.ts) (que substituiu `middleware.ts` — ver nota no
topo do `CLAUDE.md` sobre a versão não-padrão do Next.js usada neste repo).
Origens permitidas: `NEXT_PUBLIC_BASE_URL`, `RAILWAY_PUBLIC_DOMAIN`,
`VERCEL_URL` (legado) e `localhost:3000`. **Nunca `*`** — as rotas
`/api/orders` e `/api/create-payment` escrevem dados.

Se CORS estiver falhando em produção, confirme que `NEXT_PUBLIC_BASE_URL`
está setada no Railway com o domínio público real (custom domain ou
`*.up.railway.app`).

### 2. Error 500: "getaddrinfo ENOTFOUND" ou "connection refused"

Indica que `DATABASE_URL` não está configurada no serviço do Railway (ou
está com host/senha errados/apontando pro banco errado). Configurar em
**Railway → Project → Service → Variables** — se o Postgres for um plugin
do mesmo projeto Railway, usar a referência `${{Postgres.DATABASE_URL}}`.

### `DATABASE_URL` é sempre necessária em produção?

Sim, para tudo — não há mais um caminho alternativo de leitura. Todas as
rotas em `src/app/api/**` (produtos, pedidos, pagamentos, auth) passam por
`src/lib/db.ts` (pool `pg`), que lança erro no boot se `DATABASE_URL` não
existir.

## Variáveis de Ambiente Necessárias

Ver a lista completa e comentada em [`.env.example`](../../.env.example) e o
checklist de produção em [RAILWAY_DEPLOY.md](./RAILWAY_DEPLOY.md).

## Verificar Conexão com Banco de Dados

```bash
psql $DATABASE_URL -c "SELECT VERSION();"
```

## Logs

No Railway: **Project → Service → Deployments → [deployment] → View Logs**,
ou via CLI (`railway logs`).

Procure por:

- ✅ `New client connected to database` — conexão OK
- ❌ `getaddrinfo ENOTFOUND` — banco de dados não encontrado (`DATABASE_URL` errada)
- ❌ `FATAL: password authentication failed` — credenciais inválidas

## Troubleshooting

### Erro de SSL ("the server does not support SSL connections" ou o contrário)

O Postgres interno do Railway (host `*.railway.internal`) não fala SSL — o
`ssl` do pool em `src/lib/db.ts` só liga se a `DATABASE_URL` tiver
`sslmode=require`/`verify-*` ou se `DATABASE_SSL=true` estiver setada
manualmente. Se estiver vendo erro de SSL, confira essas duas coisas batem
com o banco que você está usando.

### Timeout de conexão

- Ajustar `connectionTimeoutMillis` em `src/lib/db.ts`.
- Como o Railway roda um processo de vida longa (diferente da Vercel, que é
  serverless), o pool `pg` é criado uma vez e reaproveitado — não deve haver
  storm de conexões por request. Se ainda assim houver, revisar `max: 20` em
  `src/lib/db.ts` contra o limite de conexões do plano do Postgres do Railway.

### CORS ainda retornando erro

- Confirme que `NEXT_PUBLIC_BASE_URL` bate exatamente com a origem usada no
  browser (protocolo + domínio, sem barra final).
- Redeploy é necessário depois de mudar variáveis de ambiente no Railway.
