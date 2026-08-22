# syntax=docker/dockerfile:1

# Base Debian (glibc) em vez de Alpine para evitar o footgun clássico de
# `sharp` resolver o binário nativo errado (musl) em runtime.
FROM node:22-bookworm-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# ---------- deps: instala dependências (cacheável por lockfile) ----------
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile

# ---------- builder: compila o Next.js ----------
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Variáveis NEXT_PUBLIC_* são inlined no bundle do browser durante o build —
# precisam existir aqui, não só em runtime. O Railway injeta build args via
# "Build Variables" (ficam disponíveis como ARG/ENV automaticamente para
# builds Dockerfile no Railway) — configurar lá com os valores reais de
# produção (ver src/docs/RAILWAY_DEPLOY.md).
ARG NEXT_PUBLIC_BASE_URL
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_R2_PUBLIC_URL
ENV NEXT_PUBLIC_BASE_URL=$NEXT_PUBLIC_BASE_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_R2_PUBLIC_URL=$NEXT_PUBLIC_R2_PUBLIC_URL
ENV NEXT_TELEMETRY_DISABLED=1

# DATABASE_URL/AUTH_SECRET só precisam existir pra `next build` não quebrar
# (route handlers são importados durante a coleta de dados das páginas, o
# que executa `new Pool()` e `NextAuth({...})` no module scope — mas nenhuma
# query/sessão real roda em build time). Nunca os valores reais aqui: eles
# ficariam gravados nas layers da imagem. Os valores reais são injetados só
# em runtime pelo Railway (ENV do serviço, não build arg).
ENV DATABASE_URL="postgresql://build:build@localhost:5432/build"
ENV AUTH_SECRET="build-time-placeholder-unused-at-runtime"

RUN pnpm build

# ---------- runner: imagem final, só o necessário ----------
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN groupadd --system --gid 1001 nodejs \
    && useradd --system --uid 1001 --gid nodejs nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

# O Railway injeta PORT dinamicamente; server.js (saída do output standalone)
# já lê PORT/HOSTNAME do ambiente.
ENV HOSTNAME="0.0.0.0"
EXPOSE 3000

CMD ["node", "server.js"]
