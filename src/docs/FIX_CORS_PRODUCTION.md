# Fix CORS Error em Produção - Guia Definitivo

> ⚠️ **Histórico — não se aplica mais.** Escrito para a Vercel + Supabase;
> o deploy agora é no Railway (processo Node de vida longa, não serverless)
> e o banco voltou a ser um Postgres próprio. Ver
> [RAILWAY_DEPLOY.md](./RAILWAY_DEPLOY.md) e [DEPLOY_GUIDE.md](./DEPLOY_GUIDE.md).

## ❌ Problema Original

Em produção (Vercel), está ocorrendo:

```
Database error: getaddrinfo ENOTFOUND db.nibzwcpdpqzwigkocgio.supabase.co
```

**Causa:** A variável `DATABASE_URL` não está configurada no Vercel.

## ✅ Solução Implementada

Migramos o carregamento de produtos para usar **Supabase Client** (direto do browser) em vez de usar a API Backend.

### O que mudou:

**Antes (API Backend):**

```
Browser → POST /api/products → Server → PostgreSQL (via DATABASE_URL)
```

**Depois (Supabase Client):**

```
Browser → (via NEXT_PUBLIC_SUPABASE_URL) → Supabase → PostgreSQL
```

## 🚀 Passos para Configurar em Produção

### 1. Ir para Vercel Dashboard

- Acesse: https://vercel.com/dashboard
- Selecione seu projeto `docesbibi-v3`

### 2. Acessar Environment Variables

- Clique em **Settings** (engrenagem 🔧)
- Selecione **Environment Variables**

### 3. Adicionar Variáveis (já estão em .env local)

Você vai ver:

```
DATABASE_URL = postgresql://postgres:pqtnrlKK9g4KHwlP@...
NEXT_PUBLIC_API_URL = https://docesbibi.com.br
```

Verifique se as variáveis Supabase estão lá:

```
NEXT_PUBLIC_SUPABASE_URL = https://nibzwcpdpqzwigkocgio.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY = sb_publishable_IUMloCgj0J6L_miWqz3ITg_NRQjf4Kf
```

**Se não estiverem:**

- Clique em "Add New"
- Nome: `NEXT_PUBLIC_SUPABASE_URL`
- Valor: `https://nibzwcpdpqzwigkocgio.supabase.co`
- Selecione: Production, Preview, Development
- Clique em Save

- Clique em "Add New" novamente
- Nome: `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY`
- Valor: `sb_publishable_IUMloCgj0J6L_miWqz3ITg_NRQjf4Kf`
- Selecione: Production, Preview, Development
- Clique em Save

### 4. Redeploy

**Opção 1 - Git Push (Recomendado)**

```bash
cd docesbibi-v3
git add .
git commit -m "refactor: migrate to supabase client"
git push origin main
```

O Vercel fará deploy automático em ~2 minutos.

**Opção 2 - Dashboard Manual**

- No Vercel Dashboard, clique no seu projeto
- Clique em "Deployments"
- Clique no último deployment (...)
- Selecione "Redeploy"

### 5. Verificar

Quando o deploy terminar:

- 🔴 Se ainda tiver erro: Limpe cache do navegador (Ctrl+Shift+Delete)
- 🟢 Se funcionou: Produtos devem aparecer na página

## 🧪 Testar Localmente Antes de Deploy

```bash
# Terminal 1: Desenvolver
pnpm dev

# Terminal 2: Testes
# Acesse http://localhost:3000
# Verifique DevTools → Network → /api/products (não deve aparecer!)
# Os produtos devem aparecer vindos do Supabase
```

## 📊 Verifiestaque deu certo

No navegador (F12 → DevTools):

**Console (sem erros):**

```
✅ Sem "ENOTFOUND"
✅ Sem "CORS error"
✅ Sem "fetch failed"
```

**Network Tab:**

- Não deve haver GET `/api/products` ❌
- Deve haver requisição para `supabase.co` ✅

## 🆘 Se Ainda Não Funcionar

### Check 1: Variáveis no Vercel

```bash
vercel env list
# Deve mostrar NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY
```

### Check 2: Logs do Vercel

```bash
vercel logs docesbibi-v3.vercel.app --follow
# Procure por erros
```

### Check 3: Rebuild Force

```bash
vercel redeploy --prod
```

### Check 4: Cache do Navegador

```
Ctrl+Shift+Delete → Clear all cookies and cache
Acesse o site novamente
```

## 📝 O que NÃO precisa fazer mais

- ❌ Configurar DATABASE_URL em produção
- ❌ Lidar com CORS manualmente
- ❌ Manter API Backend para produtos
- ❌ Pool de conexões PostgreSQL

## ✅ O que você ganha

- 🚀 Melhor performance
- 🔒 Autenticação nativa do Supabase
- 💾 Storage de arquivos
- ⚡ Realtime subscriptions
- 🌍 Escalabilidade automática
