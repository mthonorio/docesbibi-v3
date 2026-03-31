# API de Pedidos - Documentação

## Visão Geral

A API de Pedidos fornece um sistema completo para gerenciar pedidos no e-commerce de Páscoa. Utilizando UUIDs como identificadores únicos e PostgreSQL para persistência, oferece funcionalidades robustas de criação, leitura, atualização e deleção de pedidos.

## Base URL

```
/api/orders
```

## Endpoints

### 1. Listar Pedidos

**GET** `/api/orders`

Retorna uma lista de pedidos com suporte a filtros e paginação.

#### Query Parameters

| Parâmetro | Tipo   | Obrigatório | Descrição                                                                        |
| --------- | ------ | ----------- | -------------------------------------------------------------------------------- |
| `status`  | string | Não         | Filtrar por status: `pendente`, `confirmado`, `enviado`, `entregue`, `cancelado` |
| `email`   | string | Não         | Filtrar por email do cliente (busca parcial)                                     |
| `limit`   | number | Não         | Quantidade de resultados (padrão: 50)                                            |
| `offset`  | number | Não         | Deslocamento para paginação (padrão: 0)                                          |

#### Exemplo de Requisição

```bash
curl -X GET "http://localhost:3000/api/orders?status=pendente&limit=10&offset=0"
```

#### Resposta (Success)

Status: **200 OK**

```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "customer_name": "João Silva",
      "customer_email": "joao@example.com",
      "customer_phone": "11999999999",
      "customer_address": "Rua A, 123 - São Paulo, SP",
      "total_price": 103.7,
      "status": "pendente",
      "notes": "Entregar até 15h",
      "items": [
        {
          "id": "650e8400-e29b-41d4-a716-446655440001",
          "order_id": "550e8400-e29b-41d4-a716-446655440000",
          "product_id": 1,
          "product_name": "Ovo de Chocolate Gourmet",
          "price": 57.8,
          "quantity": 2,
          "subtotal": 115.6,
          "created_at": "2026-03-27T10:30:00Z"
        }
      ],
      "created_at": "2026-03-27T10:30:00Z",
      "updated_at": "2026-03-27T10:30:00Z"
    }
  ]
}
```

---

### 2. Buscar Pedido por ID

**GET** `/api/orders/:id`

Retorna os detalhes completos de um pedido específico.

#### Parâmetros

| Parâmetro | Tipo          | Descrição          |
| --------- | ------------- | ------------------ |
| `id`      | string (UUID) | ID único do pedido |

#### Validação

- O `id` deve ser um UUID válido no formato `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`

#### Exemplo de Requisição

```bash
curl -X GET "http://localhost:3000/api/orders/550e8400-e29b-41d4-a716-446655440000"
```

#### Resposta (Success)

Status: **200 OK**

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "customer_name": "João Silva",
    "customer_email": "joao@example.com",
    "customer_phone": "11999999999",
    "customer_address": "Rua A, 123 - São Paulo, SP",
    "total_price": 103.7,
    "status": "pendente",
    "notes": "Entregar até 15h",
    "items": [
      {
        "id": "650e8400-e29b-41d4-a716-446655440001",
        "order_id": "550e8400-e29b-41d4-a716-446655440000",
        "product_id": 1,
        "product_name": "Ovo de Chocolate Gourmet",
        "price": 57.8,
        "quantity": 2,
        "subtotal": 115.6,
        "created_at": "2026-03-27T10:30:00Z"
      }
    ],
    "created_at": "2026-03-27T10:30:00Z",
    "updated_at": "2026-03-27T10:30:00Z"
  }
}
```

#### Resposta (Erro)

Status: **404 Not Found**

```json
{
  "success": false,
  "error": "Pedido não encontrado"
}
```

Status: **400 Bad Request**

```json
{
  "success": false,
  "error": "ID de pedido inválido"
}
```

---

### 3. Criar Novo Pedido

**POST** `/api/orders`

Cria um novo pedido com itens associados.

#### Body (JSON)

```json
{
  "customer_name": "João Silva",
  "customer_email": "joao@example.com",
  "customer_phone": "11999999999",
  "customer_address": "Rua A, 123 - São Paulo, SP",
  "notes": "Entregar até 15h",
  "items": [
    {
      "product_id": 1,
      "quantity": 2
    },
    {
      "product_id": 3,
      "quantity": 1
    }
  ]
}
```

#### Validações

| Campo                | Validação                                           |
| -------------------- | --------------------------------------------------- |
| `customer_name`      | Obrigatório, string não-vazia                       |
| `customer_email`     | Obrigatório, formato email válido                   |
| `customer_phone`     | Opcional, string                                    |
| `customer_address`   | Obrigatório, string não-vazia                       |
| `notes`              | Opcional, string                                    |
| `items`              | Obrigatório, array com pelo menos 1 item            |
| `items[].product_id` | Obrigatório, número positivo (produto deve existir) |
| `items[].quantity`   | Obrigatório, número positivo                        |

#### Exemplo de Requisição

```bash
curl -X POST "http://localhost:3000/api/orders" \
  -H "Content-Type: application/json" \
  -d '{
    "customer_name": "João Silva",
    "customer_email": "joao@example.com",
    "customer_address": "Rua A, 123 - São Paulo, SP",
    "items": [
      { "product_id": 1, "quantity": 2 }
    ]
  }'
```

#### Resposta (Success)

Status: **201 Created**

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "customer_name": "João Silva",
    "customer_email": "joao@example.com",
    "customer_phone": null,
    "customer_address": "Rua A, 123 - São Paulo, SP",
    "total_price": 115.6,
    "status": "pendente",
    "notes": null,
    "items": [
      {
        "id": "650e8400-e29b-41d4-a716-446655440001",
        "order_id": "550e8400-e29b-41d4-a716-446655440000",
        "product_id": 1,
        "product_name": "Ovo de Chocolate Gourmet",
        "price": 57.8,
        "quantity": 2,
        "subtotal": 115.6,
        "created_at": "2026-03-27T10:30:00Z"
      }
    ],
    "created_at": "2026-03-27T10:30:00Z",
    "updated_at": "2026-03-27T10:30:00Z"
  }
}
```

#### Resposta (Erro)

Status: **400 Bad Request**

```json
{
  "success": false,
  "error": "Campo 'customer_name' é obrigatório"
}
```

Status: **500 Internal Server Error**

```json
{
  "success": false,
  "error": "Erro ao criar pedido"
}
```

---

### 4. Atualizar Pedido

**PATCH** `/api/orders/:id`

Atualiza um ou mais campos de um pedido existente.

#### Parâmetros

| Parâmetro | Tipo          | Descrição          |
| --------- | ------------- | ------------------ |
| `id`      | string (UUID) | ID único do pedido |

#### Body (JSON) - Todos os Campos Opcionais

```json
{
  "status": "confirmado",
  "customer_name": "João Silva",
  "customer_email": "joao@example.com",
  "customer_phone": "11999999999",
  "customer_address": "Rua A, 123 - São Paulo, SP",
  "notes": "Entregar até 15h"
}
```

#### Validações

| Campo              | Validação                                                          |
| ------------------ | ------------------------------------------------------------------ |
| `status`           | Enum: `pendente`, `confirmado`, `enviado`, `entregue`, `cancelado` |
| `customer_name`    | String não-vazia (se fornecido)                                    |
| `customer_email`   | Email válido (se fornecido)                                        |
| `customer_phone`   | String (se fornecido)                                              |
| `customer_address` | String não-vazia (se fornecido)                                    |
| `notes`            | String (se fornecido)                                              |

#### Exemplo de Requisição

```bash
curl -X PATCH "http://localhost:3000/api/orders/550e8400-e29b-41d4-a716-446655440000" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "confirmado"
  }'
```

#### Resposta (Success)

Status: **200 OK**

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "customer_name": "João Silva",
    "customer_email": "joao@example.com",
    "customer_phone": "11999999999",
    "customer_address": "Rua A, 123 - São Paulo, SP",
    "total_price": 103.7,
    "status": "confirmado",
    "notes": "Entregar até 15h",
    "items": [
      {
        "id": "650e8400-e29b-41d4-a716-446655440001",
        "order_id": "550e8400-e29b-41d4-a716-446655440000",
        "product_id": 1,
        "product_name": "Ovo de Chocolate Gourmet",
        "price": 57.8,
        "quantity": 2,
        "subtotal": 115.6,
        "created_at": "2026-03-27T10:30:00Z"
      }
    ],
    "created_at": "2026-03-27T10:30:00Z",
    "updated_at": "2026-03-27T10:30:02Z"
  }
}
```

#### Respostas (Erros)

Status: **400 Bad Request**

```json
{
  "success": false,
  "error": "Nenhum campo fornecido para atualização"
}
```

Status: **404 Not Found**

```json
{
  "success": false,
  "error": "Pedido não encontrado"
}
```

---

### 5. Deletar Pedido

**DELETE** `/api/orders/:id`

Deleta um pedido e todos os seus itens associados (cascade delete).

#### Parâmetros

| Parâmetro | Tipo          | Descrição          |
| --------- | ------------- | ------------------ |
| `id`      | string (UUID) | ID único do pedido |

#### Validação

- O `id` deve ser um UUID válido

#### Exemplo de Requisição

```bash
curl -X DELETE "http://localhost:3000/api/orders/550e8400-e29b-41d4-a716-446655440000"
```

#### Resposta (Success)

Status: **200 OK**

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000"
  }
}
```

#### Respostas (Erros)

Status: **404 Not Found**

```json
{
  "success": false,
  "error": "Pedido não encontrado"
}
```

Status: **400 Bad Request**

```json
{
  "success": false,
  "error": "ID de pedido inválido"
}
```

---

## Status do Pedido

Os pedidos podem passar pelos seguintes status:

| Status       | Descrição                            |
| ------------ | ------------------------------------ |
| `pendente`   | Novo pedido, aguardando confirmação  |
| `confirmado` | Pedido confirmado e em processamento |
| `enviado`    | Pedido despachado para entrega       |
| `entregue`   | Pedido entregue ao cliente           |
| `cancelado`  | Pedido cancelado                     |

### Fluxo Recomendado

```
pendente → confirmado → enviado → entregue
         ↘ cancelado
```

---

## UUIDs

### O que é UUID?

UUID (Universally Unique Identifier) é um identificador único de 128 bits representado em formato hexadecimal.

**Formato:**

```
xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

**Exemplo:**

```
550e8400-e29b-41d4-a716-446655440000
```

### Vantagens

- ✅ Globalmente único (colisão praticamente impossível)
- ✅ Pode ser gerado no cliente ou no servidor
- ✅ Melhor privacidade (não revela quantidade de pedidos)
- ✅ Escalável para sistemas distribuídos

### Geração Automática

UUIDs são gerados automaticamente pelo PostgreSQL ao criar novos pedidos.

---

## Tipos TypeScript

### Order

```typescript
interface Order {
  id: string; // UUID
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  customer_address: string;
  total_price: number;
  status: OrderStatus;
  notes?: string;
  items?: OrderItem[];
  created_at: string; // ISO 8601
  updated_at: string; // ISO 8601
}
```

### OrderItem

```typescript
interface OrderItem {
  id: string; // UUID
  order_id: string; // UUID
  product_id: number;
  product_name: string;
  price: number;
  quantity: number;
  subtotal: number;
  created_at: string; // ISO 8601
}
```

### OrderStatus

```typescript
type OrderStatus =
  | "pendente"
  | "confirmado"
  | "enviado"
  | "entregue"
  | "cancelado";
```

### CreateOrderInput

```typescript
interface CreateOrderInput {
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  customer_address: string;
  notes?: string;
  items: Array<{
    product_id: number;
    quantity: number;
  }>;
}
```

### UpdateOrderInput

```typescript
interface UpdateOrderInput {
  status?: OrderStatus;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  customer_address?: string;
  notes?: string;
}
```

---

## Como Usar no Frontend

### 1. Cliente API

```typescript
import orderApi from "@/api/orders";

// Listar pedidos
const orders = await orderApi.getAll({ status: "pendente" });

// Buscar um pedido
const order = await orderApi.getById("550e8400-e29b-41d4-a716-446655440000");

// Criar pedido
const newOrder = await orderApi.create({
  customer_name: "João",
  customer_email: "joao@example.com",
  customer_address: "Rua A, 123",
  items: [{ product_id: 1, quantity: 2 }],
});

// Atualizar status
const updated = await orderApi.updateStatus(newOrder.id, "confirmado");

// Deletar
await orderApi.delete(newOrder.id);
```

### 2. Zustand Store

```typescript
import { useOrderStore } from '@/store/orderStore';

function MyComponent() {
  const { orders, create, updateStatus, delete: deleteOrder } = useOrderStore();

  // Criar pedido
  const handleCreateOrder = async () => {
    const order = await create({
      customer_name: 'João',
      customer_email: 'joao@example.com',
      customer_address: 'Rua A, 123',
      items: [{ product_id: 1, quantity: 2 }]
    });
  };

  // Atualizar status
  const handleStatusChange = async (orderId, newStatus) => {
    await updateStatus(orderId, newStatus);
  };

  return (
    // seu JSX
  );
}
```

### 3. Componentes Prontos

#### CreateOrderForm

```typescript
import { CreateOrderForm } from '@/components/forms/CreateOrderForm';

export default function CheckoutPage() {
  return <CreateOrderForm />;
}
```

#### OrdersManager

```typescript
import { OrdersManager } from '@/components/sections/OrdersManager';

export default function AdminPage() {
  return <OrdersManager />;
}
```

---

## Tratamento de Erros

### Padrão de Erro

Todas as respostas de erro seguem este padrão:

```json
{
  "success": false,
  "error": "Descrição do erro"
}
```

### Códigos HTTP Comuns

| Código | Significado                                    |
| ------ | ---------------------------------------------- |
| `200`  | OK - Requisição bem-sucedida                   |
| `201`  | Created - Recurso criado com sucesso           |
| `400`  | Bad Request - Dados inválidos ou UUID inválido |
| `404`  | Not Found - Pedido não encontrado              |
| `500`  | Internal Server Error - Erro no servidor       |

### Tratamento no Cliente

```typescript
try {
  const order = await orderApi.create(data);
  console.log("Pedido criado:", order);
} catch (error) {
  const message = error instanceof Error ? error.message : "Erro desconhecido";
  console.error("Erro:", message);
  // Mostrar mensagem ao usuário
}
```

---

## Paginação

Para listar muitos pedidos, use paginação:

```bash
curl -X GET "http://localhost:3000/api/orders?limit=20&offset=40"
```

Isto retornará 20 pedidos começando do 41º pedido (0-indexed).

---

## Performance

### Índices Criados

A tabela de pedidos possui índices para otimizar consultas:

- `idx_orders_status` - Filtros por status
- `idx_orders_customer_email` - Busca por email
- `idx_orders_created_at` - Ordenação por data
- `idx_order_items_order_id` - Relacionamento com itens
- `idx_order_items_product_id` - Relacionamento com produtos

---

## Exemplo Completo: Fluxo de Pedido

### 1. Criar Pedido

```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customer_name": "Maria Santos",
    "customer_email": "maria@example.com",
    "customer_phone": "11987654321",
    "customer_address": "Av. Paulista, 1000 - São Paulo, SP",
    "notes": "Levar presente embrulhado",
    "items": [
      { "product_id": 1, "quantity": 1 },
      { "product_id": 2, "quantity": 2 }
    ]
  }'
```

**Resposta:**

```json
{
  "success": true,
  "data": {
    "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    "status": "pendente",
    "total_price": 200.50,
    ...
  }
}
```

### 2. Confirmar Pedido

```bash
curl -X PATCH http://localhost:3000/api/orders/f47ac10b-58cc-4372-a567-0e02b2c3d479 \
  -H "Content-Type: application/json" \
  -d '{ "status": "confirmado" }'
```

### 3. Enviado

```bash
curl -X PATCH http://localhost:3000/api/orders/f47ac10b-58cc-4372-a567-0e02b2c3d479 \
  -H "Content-Type: application/json" \
  -d '{ "status": "enviado" }'
```

### 4. Entregue

```bash
curl -X PATCH http://localhost:3000/api/orders/f47ac10b-58cc-4372-a567-0e02b2c3d479 \
  -H "Content-Type: application/json" \
  -d '{ "status": "entregue" }'
```

---

## Próximas Etapas

- [ ] Adicionar notificações por email
- [ ] Integrar com sistema de pagamento
- [ ] Gerar relatórios de pedidos
- [ ] Exportar pedidos para CSV/PDF
- [ ] Dashboard com gráficos de vendas
- [ ] Sistema de rastreamento
- [ ] App mobile para acompanhamento de pedidos

---

## Suporte

Para dúvidas ou problemas com a API, consulte a documentação do projeto ou abra uma issue.
