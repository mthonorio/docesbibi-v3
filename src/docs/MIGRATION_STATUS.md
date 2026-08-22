# Migração para Supabase - Status

> ⚠️ **Histórico — não se aplica mais.** O projeto migrou de volta pra um
> Postgres próprio (Railway) e saiu do Supabase por completo. Ver
> [RAILWAY_DEPLOY.md](./RAILWAY_DEPLOY.md). Mantido só como registro da
> migração original.

## ✅ Migrações Concluídas

### 1. Homepage (src/app/page.tsx)

- ❌ Removido: `import { productApi } from "@/api/products"`
- ❌ Removido: `useEffect` que fazia chamadas de API
- ✅ Adicionado: `import { useSupabaseData } from "@/hooks/useSupabase"`
- ✅ Mudado: `const { data: products, loading, error } = useSupabaseData<Product>("products")`

### 2. Products Page (src/app/(public)/products/page.tsx)

- ❌ Removido: `import { productApi } from "@/api/products"`
- ❌ Removido: `useEffect` que fazia chamadas de API
- ✅ Adicionado: `import { useSupabaseData } from "@/hooks/useSupabase"`
- ✅ Mudado: `const { data: products, loading, error } = useSupabaseData<Product>("products")`

## ⚠️ Próximas Etapas (Opcional - Para Pedidos)

Se quiser migrar pedidos também:

- Criar hook similar: `useSupabaseOrders()`
- Migrar `useOrderStore` para usar Supabase
- Remover `orderApi`

## 🔧 Configurar Supabase em Produção

### Passo 1: Copiar dados de Produção

Se você tem dados no PostgreSQL (Supabase), certifique-se de que as tabelas `products` e `order_items` existem no Supabase.

### Passo 2: Atualizar .env.production no Vercel

```
NEXT_PUBLIC_SUPABASE_URL=https://nibzwcpdpqzwigkocgio.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=sb_publishable_IUMloCgj0J6L_miWqz3ITg_NRQjf4Kf
```

### Passo 3: Remover DATABASE_URL (opcional)

Como estamos usando Supabase no cliente, você pode remover ou deixar `DATABASE_URL` apenas para a API.

### Passo 4: Redeploy

```bash
git push  # Deploy automático no Vercel
```

## 📊 Vantagens da Migração

| Aspecto         | Antes (API)              | Depois (Supabase)     |
| --------------- | ------------------------ | --------------------- |
| Conexão DB      | Servidor                 | Cliente               |
| Error ENOTFOUND | ❌ Ocorria               | ✅ Resolvido          |
| CORS            | ❌ Middleware necessário | ✅ Supabase nativo    |
| Autenticação    | ❌ Customizada           | ✅ Nativa do Supabase |
| Realtime        | ❌ Não                   | ✅ Sim                |
| Performance     | Lenta (2 hops)           | Rápida (direto)       |

## 🧪 Testar Localmente

```bash
cd docesbibi-v3
pnpm dev
# Acesse http://localhost:3000
# Verifique se os produtos aparecem
```

## 🚀 Deploy no Vercel

```bash
git add .
git commit -m "refactor: migrate products to supabase client"
git push origin main
# Vercel fará deploy automático
```

## 📝 Notas

- A API REST em `src/api/products.ts` ainda existe mas não é mais usada
- Você pode deletar `src/api/products.ts` se não precisar mais
- As rotas de API em `src/app/api/products/route.ts` ainda existem para uso futuro
- Supabase fornece autenticação, storage e realtime nativamente
