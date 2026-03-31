# Supabase Integration Guide

## Environment Variables

Suas variáveis de ambiente já foram configuradas em `.env`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://nibzwcpdpqzwigkocgio.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=sb_publishable_IUMloCgj0J6L_miWqz3ITg_NRQjf4Kf
```

## Iniciando o Cliente Supabase

O client foi inicializado em `src/lib/supabase-client.ts`:

```typescript
import { supabase } from "@/lib/supabase-client";
```

## Exemplos de Uso

### 1. Autenticação (Sign Up)

```typescript
const { data, error } = await supabase.auth.signUp({
  email: "example@email.com",
  password: "example-password",
});
```

### 2. Autenticação (Sign In)

```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email: "example@email.com",
  password: "example-password",
});
```

### 3. Acessar Dados (SELECT)

```typescript
const { data, error } = await supabase
  .from("products")
  .select("*")
  .eq("category", "pascoa");
```

### 4. Inserir Dados (INSERT)

```typescript
const { data, error } = await supabase
  .from("products")
  .insert([{ name: "Ovo de Páscoa", price: 50, category: "pascoa" }])
  .select();
```

### 5. Atualizar Dados (UPDATE)

```typescript
const { data, error } = await supabase
  .from("products")
  .update({ price: 60 })
  .eq("id", 1)
  .select();
```

### 6. Deletar Dados (DELETE)

```typescript
const { error } = await supabase.from("products").delete().eq("id", 1);
```

### 7. Upload de Imagens (Storage)

```typescript
const { data, error } = await supabase.storage
  .from("images")
  .upload("products/banner.png", file);

if (data) {
  const { data: urlData } = supabase.storage
    .from("images")
    .getPublicUrl(data.path);

  const publicUrl = urlData.publicUrl;
}
```

### 8. Realtime (Listen to Changes)

```typescript
supabase
  .channel("public:products")
  .on(
    "postgres_changes",
    { event: "*", schema: "public", table: "products" },
    (payload) => {
      console.log("Change received!", payload);
    },
  )
  .subscribe();
```

## Recursos Adicionais

- 📚 [Documentação Supabase](https://supabase.com/docs)
- 🎨 [Componentes UI Supabase](https://supabase.com/ui)
- 🔐 [Autenticação](https://supabase.com/docs/guides/auth)
- 💾 [Storage](https://supabase.com/docs/guides/storage)
- ⚡ [Realtime](https://supabase.com/docs/guides/realtime)

## Próximos Passos

1. Criar componentes de autenticação
2. Integrar upload de imagens ao dashboard de produtos
3. Implementar realtime para atualizações de pedidos
4. Configurar policies de segurança (RLS)
