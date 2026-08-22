# API de Produtos - Documentação

## Base URL

```
http://localhost:3000/api/products
```

## Autenticação

Não requer autenticação no momento. (Adicione JWT ou API keys conforme necessário)

---

## Endpoints

### 1. GET /api/products

**Listar todos os produtos com filtro opcional por categoria**

#### Query Parameters

- `category` (opcional): Filtrar por categoria (chocolates, bolos, doces, presentes)

#### Exemplo de Requisição

```bash
# Listar todos
curl http://localhost:3000/api/products

# Filtrar por categoria
curl "http://localhost:3000/api/products?category=chocolates"
```

#### Exemplo de Resposta

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Barra de Chocolate Orgânico 70%",
      "category": "chocolates",
      "price": 28.9,
      "image": "https://static.photos/food/400x400/6",
      "description": "Cacau orgânico selecionado",
      "created_at": "2024-03-26T10:00:00Z",
      "updated_at": "2024-03-26T10:00:00Z"
    }
  ]
}
```

---

### 2. POST /api/products

**Criar um novo produto**

#### Body (JSON)

```json
{
  "name": "Novo Produto",
  "category": "chocolates",
  "price": 29.9,
  "image": "https://example.com/image.jpg",
  "description": "Descrição do produto"
}
```

#### Campos Obrigatórios

- `name` (string)
- `category` (string)
- `price` (number)
- `image` (string - URL)
- `description` (string)

#### Exemplo de Requisição

```bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Trufas de Café",
    "category": "chocolates",
    "price": 50.00,
    "image": "https://static.photos/food/400x400/7",
    "description": "Trufas com sabor de café artesanal"
  }'
```

#### Exemplo de Resposta (201 Created)

```json
{
  "success": true,
  "data": {
    "id": 9,
    "name": "Trufas de Café",
    "category": "chocolates",
    "price": 50.0,
    "image": "https://static.photos/food/400x400/7",
    "description": "Trufas com sabor de café artesanal",
    "created_at": "2024-03-26T15:30:00Z",
    "updated_at": "2024-03-26T15:30:00Z"
  }
}
```

---

### 3. PATCH /api/products/:id

**Atualizar um produto existente**

#### URL Parameters

- `id` (number): ID do produto

#### Body (JSON) - Apenas campos a atualizar

```json
{
  "price": 35.0,
  "description": "Descrição atualizada"
}
```

#### Campos Opcionais

- `name` (string)
- `category` (string)
- `price` (number)
- `image` (string - URL)
- `description` (string)

#### Exemplo de Requisição

```bash
curl -X PATCH http://localhost:3000/api/products/1 \
  -H "Content-Type: application/json" \
  -d '{
    "price": 35.00,
    "description": "Nova descrição"
  }'
```

#### Exemplo de Resposta

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Barra de Chocolate Orgânico 70%",
    "category": "chocolates",
    "price": 35.0,
    "image": "https://static.photos/food/400x400/6",
    "description": "Nova descrição",
    "created_at": "2024-03-26T10:00:00Z",
    "updated_at": "2024-03-26T16:00:00Z"
  }
}
```

---

### 4. DELETE /api/products/:id

**Deletar um produto**

#### URL Parameters

- `id` (number): ID do produto

#### Exemplo de Requisição

```bash
curl -X DELETE http://localhost:3000/api/products/9
```

#### Exemplo de Resposta

```json
{
  "success": true,
  "data": {
    "id": 9
  }
}
```

---

## Códigos de Status HTTP

| Código | Descrição                                |
| ------ | ---------------------------------------- |
| 200    | OK - Requisição bem-sucedida             |
| 201    | Created - Recurso criado com sucesso     |
| 400    | Bad Request - Dados inválidos            |
| 404    | Not Found - Recurso não encontrado       |
| 500    | Internal Server Error - Erro no servidor |

---

## Tratamento de Erros

Todos os erros retornam o seguinte formato:

```json
{
  "success": false,
  "error": "Mensagem de erro descritiva"
}
```

### Exemplos de Erro

**Validação inválida:**

```json
{
  "success": false,
  "error": "Todos os campos são obrigatórios"
}
```

**Produto não encontrado:**

```json
{
  "success": false,
  "error": "Produto não encontrado"
}
```

---

## Cliente JavaScript/TypeScript

Use o cliente fornecido em `src/api/products.ts`:

```typescript
import { productApi } from "@/api/products";

// Listar todos os produtos
const products = await productApi.getAll();

// Filtrar por categoria
const chocolates = await productApi.getAll("chocolates");

// Criar novo produto
const newProduct = await productApi.create({
  name: "Novo Doce",
  category: "doces",
  price: 25.0,
  image: "https://...",
  description: "Descrição",
});

// Atualizar produto
const updated = await productApi.update(1, {
  price: 30.0,
});

// Deletar produto
await productApi.delete(1);
```

---

## Setup do Banco de Dados

1. Execute os scripts SQL em `sql/*.sql` (em ordem) no Postgres do Railway:

```bash
psql $DATABASE_URL -f sql/init.sql
psql $DATABASE_URL -f sql/orders.sql
# ... demais arquivos numerados, ver src/docs/RAILWAY_DEPLOY.md
```

---

## Variáveis de Ambiente

```env
NEXT_PUBLIC_CONNECTION_DB_URL=postgresql://user:password@host:port/database
```

---

## Exemplos Completos

### Criar e listar produtos com filtro

```javascript
// Frontend
import { productApi } from "@/api/products";

async function demo() {
  try {
    // Criar novo produto
    const newProduct = await productApi.create({
      name: "Brigadeiro Premium",
      category: "doces",
      price: 48.0,
      image: "https://static.photos/food/400x400/14",
      description: "Brigadeiro com chocolate belga",
    });
    console.log("Produto criado:", newProduct);

    // Listar todos
    const all = await productApi.getAll();
    console.log("Todos:", all);

    // Filtrar doces
    const doces = await productApi.getAll("doces");
    console.log("Doces:", doces);

    // Atualizar
    const updated = await productApi.update(newProduct.id, {
      price: 50.0,
    });
    console.log("Atualizado:", updated);

    // Deletar
    await productApi.delete(newProduct.id);
    console.log("Deletado!");
  } catch (error) {
    console.error("Erro:", error);
  }
}
```
