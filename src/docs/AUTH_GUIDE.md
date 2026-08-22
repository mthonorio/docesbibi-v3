# Autenticação (login da gestora)

O login em `/admin/login`, que protege `/orders`, usa
[Auth.js/NextAuth v5](https://authjs.dev) com um `Credentials` provider —
substituiu o Supabase Auth quando o projeto saiu do Supabase por completo
(ver [RAILWAY_DEPLOY.md](./RAILWAY_DEPLOY.md)).

## Como funciona

- [src/lib/auth.ts](../lib/auth.ts) — config do NextAuth. Sessão em cookie
  JWT (sem tabela de sessão), `Credentials.authorize()` consulta a tabela
  `users` (`sql/004_auth_users.sql`) via `pg` (`src/lib/db.ts`) e compara a
  senha com `bcryptjs.compare`.
- [src/app/api/auth/[...nextauth]/route.ts](../app/api/auth/[...nextauth]/route.ts)
  — expõe os endpoints padrão do NextAuth (`/api/auth/callback/credentials`,
  `/api/auth/session`, etc).
- [src/proxy.ts](../proxy.ts) — `export const proxy = auth((request) => {...})`.
  `auth()` decodifica o cookie JWT e popula `request.auth`; roda no runtime
  Edge do Proxy sem bater no banco (só verifica a assinatura do token) — a
  consulta em `users` só acontece uma vez, no momento do login
  (`/api/auth/callback/credentials`, que roda em runtime Node normal).
- [src/app/admin/login/page.tsx](../app/admin/login/page.tsx) chama
  `signIn("credentials", { email, password, redirect: false })` de
  `next-auth/react`; [SignOutButton](../components/molecules/SignOutButton/index.tsx)
  chama `signOut()`.

## Variáveis de ambiente

- `AUTH_SECRET` — obrigatória. Gerar com `npx auth secret` ou
  `openssl rand -base64 33`. Uma por ambiente (dev ≠ produção).
- `trustHost: true` já está fixo em `src/lib/auth.ts` — necessário porque,
  fora da Vercel, o NextAuth não confia no header `Host` por padrão. A
  origem pública real já é controlada por `NEXT_PUBLIC_BASE_URL` +
  `src/lib/cors.ts`.

## Criar o primeiro usuário (gestora)

Não existe tela de cadastro — por design, só quem tem acesso ao
`DATABASE_URL` cria contas. Rodar:

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
