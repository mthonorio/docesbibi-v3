# Guia de Deploy e Configuração de Produção

## Problemas Comuns

### 1. CORS Error no navegador

Este erro ocorre quando o frontend não consegue fazer requisições para a API.

**Solução:** Um middleware de CORS foi adicionado em `src/middleware.ts` que:

- Permite requisições de qualquer origem (`*`)
- Suporta métodos: GET, POST, PATCH, DELETE, OPTIONS
- Trata preflight requests automaticamente

### 2. Error 500: "ENOTFOUND db.nibzwcpdpqzwigkocgio.supabase.co"

Este erro indica que a variável de ambiente `DATABASE_URL` não está configurada na produção.

**Solução Vercel:**

1. Acesse seu projeto no [Vercel Dashboard](https://vercel.com/dashboard)
2. Vá para **Settings → Environment Variables**
3. Adicione a seguinte variável:

```
DATABASE_URL=postgresql://[user]:[password]@db.nibzwcpdpqzwigkocgio.supabase.co:5432/postgres?sslmode=require
```

4. Selecione os ambientes: **Production, Preview, Development**
5. Clique em **Save**
6. Redeploy seu projeto

**Ou use a CLI do Vercel:**

```bash
vercel env add DATABASE_URL
# Cole sua DATABASE_URL
vercel redeploy --prod
```

## Variáveis de Ambiente Necessárias

### Production (Vercel)

- `DATABASE_URL` - URL de conexão do PostgreSQL (com SSL em produção)
- `NEXT_PUBLIC_API_URL` - URL base da API (deixe vazio para usar mesma origem)

### Development (Local)

Crie um arquivo `.env.local`:

```
DATABASE_URL=postgresql://[user]:[password]@localhost:5432/docesbibi
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## Verificar Conexão com Banco de Dados

Para testar se a conexão está funcionando:

```bash
# Instale psql (ferramenta de linha de comando do PostgreSQL)
# No Ubuntu/Debian:
sudo apt-get install postgresql-client

# Teste a conexão:
psql $DATABASE_URL -c "SELECT VERSION();"
```

## Logs Úteis

Verifique os logs do Vercel para diagnosticar problemas:

```bash
vercel logs [project-url] --follow
```

Procure por mensagens como:

- ✅ `New client connected to database` - Conexão OK
- ❌ `getaddrinfo ENOTFOUND` - Banco de dados não encontrado
- ❌ `FATAL: password authentication failed` - Credenciais inválidas

## Troubleshooting

### O Supabase está bloqueando minha conexão de produção

- Verifique se o IP da Vercel está na whitelist do Supabase
- Em Supabase: Project Settings → Database → Restrict connections to specific IPs
- Para Vercel, use "Allow all" ou adicione IPs de Vercel

### Timeout de conexão

- Aumentar `connectionTimeoutMillis` em `src/lib/db.ts`
- Verifique a latência entre Vercel e Supabase
- Considere usar pool de conexões mais eficiente

### CORS ainda retornando erro

- Limpe o cache do navegador (Ctrl+Shift+Del)
- Verifique se `src/middleware.ts` está sendo executado
- Verifique o console do navegador (DevTools → Network)
