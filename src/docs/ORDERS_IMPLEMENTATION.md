# Sistema de Pedidos - Frontend & Backend

## 📋 Visão Geral

Sistema completo de gerenciamento de pedidos com e-commerce Páscoa, incluindo:

- ✅ Banco de dados PostgreSQL com UUID
- ✅ API RESTful com 5 endpoints (GET, GET/:id, POST, PATCH, DELETE)
- ✅ Estado global com Zustand
- ✅ Componentes React prontos para uso
- ✅ Formulário de criação com validação
- ✅ Dashboard de gerenciamento com filtros
- ✅ Modal de detalhes do pedido
- ✅ Documentação completa

---

## 📁 Estrutura de Arquivos

### Backend (API)

```
src/app/api/orders/
├── route.ts           # GET /api/orders, POST /api/orders
└── [id]/
    └── route.ts       # GET /api/orders/:id, PATCH, DELETE

src/types/
└── api.ts             # TypeScript interfaces (Order, OrderItem, etc)

sql/
└── orders.sql         # Schema, triggers, indexes
```

### Frontend

```
src/
├── api/
│   └── orders.ts      # API client wrapper
├── store/
│   └── orderStore.ts  # Zustand state management
├── components/
│   ├── forms/
│   │   └── CreateOrderForm.tsx
│   └── sections/
│       └── OrdersManager.tsx
├── app/
│   └── orders/
│       └── page.tsx   # Main page component
```

### Documentation

```
├── API_DOCS_ORDERS.md     # Complete API documentation
├── ORDERS_IMPLEMENTATION.md (this file)
```

---

## 🚀 Quick Start

### 1. Inicializar Banco de Dados

```bash
# Executar SQL schema
psql -d seu_banco < sql/orders.sql
```

Isto criará:

- Tabela `orders` com UUID PK
- Tabela `order_items` com FK para orders
- Enum `order_status`
- Triggers para auto-update timestamps
- Triggers para auto-calcular total
- Indexes para performance

### 2. Testar API

```bash
# Listar pedidos
curl -X GET "http://localhost:3000/api/orders"

# Criar pedido
curl -X POST "http://localhost:3000/api/orders" \
  -H "Content-Type: application/json" \
  -d '{
    "customer_name": "João",
    "customer_email": "joao@example.com",
    "customer_address": "Rua A, 123",
    "items": [{ "product_id": 1, "quantity": 2 }]
  }'
```

### 3. Usar no Frontend

```typescript
// Componentes prontos
import { CreateOrderForm } from "@/components/forms/CreateOrderForm";
import { OrdersManager } from "@/components/sections/OrdersManager";

// Ou usar o hook Zustand
import { useOrderStore } from "@/store/orderStore";

function MyComponent() {
  const { orders, create } = useOrderStore();
  // ...
}
```

### 4. Acessar Página de Pedidos

```
http://localhost:3000/orders
```

---

## 🔄 Fluxo de Dados

### Criar Pedido

```
CreateOrderForm
  ↓
useOrderStore.create()
  ↓
orderApi.create()
  ↓
POST /api/orders
  ↓
PostgreSQL (insere order + items, triggers calculam total)
  ↓
Resposta com UUID
  ↓
Store atualiza estado
  ↓
Componente re-renderiza
  ↓
Mensagem de sucesso
```

### Listar Pedidos

```
OrdersManager (useEffect)
  ↓
useOrderStore.fetchAll()
  ↓
orderApi.getAll()
  ↓
GET /api/orders?status=...&email=...
  ↓
PostgreSQL (SELECT + filtros + JOINs)
  ↓
Store carrega orders[]
  ↓
Renderiza lista com status badges
```

### Atualizar Status

```
OrdersManager (dropdown)
  ↓
handleStatusChange()
  ↓
useOrderStore.updateStatus()
  ↓
orderApi.updateStatus()
  ↓
PATCH /api/orders/:id
  ↓
PostgreSQL (UPDATE + trigger para updated_at)
  ↓
Store atualiza order específico
  ↓
UI re-renderiza com novo status
```

---

## 📦 Tipos TypeScript

### Order (do banco)

```typescript
interface Order {
  id: string; // UUID gerado pelo PostgreSQL
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  customer_address: string;
  total_price: number; // Auto-calculado por trigger
  status: OrderStatus; // 'pendente' | 'confirmado' | ...
  notes?: string;
  items?: OrderItem[]; // Nested array do JOIN
  created_at: string; // ISO 8601, auto-generated
  updated_at: string; // ISO 8601, auto-updated por trigger
}

type OrderStatus =
  | "pendente"
  | "confirmado"
  | "enviado"
  | "entregue"
  | "cancelado";
```

### OrderItem (itens do pedido)

```typescript
interface OrderItem {
  id: string; // UUID
  order_id: string; // FK para Order.id
  product_id: number; // FK para products.id
  product_name: string; // Denormalizado no order_items
  price: number; // Preço no momento da compra
  quantity: number;
  subtotal: number; // price * quantity
  created_at: string; // ISO 8601
}
```

### CreateOrderInput (o que você envia)

```typescript
interface CreateOrderInput {
  customer_name: string; // Obrigatório
  customer_email: string; // Obrigatório
  customer_phone?: string; // Opcional
  customer_address: string; // Obrigatório
  notes?: string; // Opcional
  items: Array<{
    product_id: number; // Deve existir em products
    quantity: number; // Deve ser > 0
  }>;
}
```

---

## 🛠 API Endpoints Implementados

### GET /api/orders

Listar pedidos com filtros

```
Query params: status, email, limit, offset
Returns: Order[]
```

### GET /api/orders/:id

Buscar pedido específico

```
Params: id (UUID)
Returns: Order
```

### POST /api/orders

Criar novo pedido

```
Body: CreateOrderInput
Returns: Order (com UUID gerado)
Status: 201 Created
```

### PATCH /api/orders/:id

Atualizar pedido

```
Params: id (UUID)
Body: Partial<UpdateOrderInput>
Returns: Order atualizado
```

### DELETE /api/orders/:id

Deletar pedido (cascade delete items)

```
Params: id (UUID)
Returns: { id: string }
Status: 200 OK
```

---

## 📊 Componentes Frontend

### CreateOrderForm

**Uso:**

```tsx
import { CreateOrderForm } from "@/components/forms/CreateOrderForm";

export default function CheckoutPage() {
  return <CreateOrderForm />;
}
```

**Features:**

- Form com validação de campos
- Adição dinâmica de produtos
- Tabela de itens com remove
- Loading state
- Sucesso/erro notification
- Reset automático após criar

**Props:** Nenhuma (usa Zustand internamente)

---

### OrdersManager

**Uso:**

```tsx
import { OrdersManager } from "@/components/sections/OrdersManager";

export default function AdminPage() {
  return <OrdersManager />;
}
```

**Features:**

- Lista de pedidos filtrada
- Filtro por status
- Busca por email/nome
- Dropdown para mudar status
- Botão de delete com confirmação
- Modal com detalhes completos
- Responde a atualizações em tempo real
- Paginação pronta

**Props:** Nenhuma (usa Zustand internamente)

---

### Página /orders

**Rota:** `src/app/orders/page.tsx`

**Layout:**

- Cabeçalho com título
- Grid 2 colunas (Form + Manager)
- Responsivo (1 coluna em mobile)

```
┌─ Orders Page ─────────────────────────────┐
│ Gerenciador de Pedidos                    │
│                                           │
│ ┌──────────────┐  ┌─────────────────────┐ │
│ │ CreateOrder  │  │ OrdersManager       │ │
│ │   Form       │  │ - Filtros           │ │
│ │              │  │ - Lista de pedidos  │ │
│ │              │  │ - Modal de detalhes │ │
│ └──────────────┘  └─────────────────────┘ │
└───────────────────────────────────────────┘
```

---

## 🎨 Status Colors

| Status     | Cor      | Hex       |
| ---------- | -------- | --------- |
| pendente   | Amarelo  | `#FCD34D` |
| confirmado | Azul     | `#93C5FD` |
| enviado    | Roxo     | `#D8B4FE` |
| entregue   | Verde    | `#BBF7D0` |
| cancelado  | Vermelho | `#FECACA` |

---

## ⚙️ Zustand Store API

### useOrderStore

```typescript
// State
const {
  orders,          // Order[]
  currentOrder,    // Order | null
  loading,         // boolean
  error            // string | null
} = useOrderStore();

// Actions
const {
  fetchAll,        // (filters?) => Promise<void>
  fetchById,       // (id: string) => Promise<void>
  create,          // (order: CreateOrderInput) => Promise<Order>
  update,          // (id: string, data: Partial<Order>) => Promise<void>
  updateStatus,    // (id: string, status: OrderStatus) => Promise<void>
  delete,          // (id: string) => Promise<void>
  setCurrentOrder, // (order: Order | null) => void
  clearError,      // () => void
  reset            // () => void
} = useOrderStore();
```

---

## 🔐 Validações

### Cliente-side (CreateOrderForm)

- ✅ Campos obrigatórios não vazios
- ✅ Email formato válido (HTML5)
- ✅ Quantidade > 0
- ✅ Pelo menos 1 item

### Servidor-side (API)

- ✅ Validação de campos obrigatórios
- ✅ Email format validation
- ✅ UUID format validation
- ✅ Status enum validation
- ✅ Produto existe em products table
- ✅ Quantidade positiva

### Banco de dados (PostgreSQL)

- ✅ NOT NULL constraints
- ✅ UUID format check
- ✅ Enum type for status
- ✅ Foreign key constraints
- ✅ Cascade delete on order deletion

---

## 📈 Performance

### Database Indexes

```sql
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_customer_email ON orders(customer_email);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);
```

### Query Optimization

1. **Fetchall com filtros** - Usa índices para WHERE clauses
2. **Nested items** - JOINs em single query (não N+1)
3. **Paginação** - LIMIT/OFFSET para data não crescer
4. **Triggers** - Cálculos no DB, não na app

### Zustand Optimization

- ✅ Auto-memoization de seletores
- ✅ Shallow comparisons padrão
- ✅ Batch updates do React 18+
- ✅ Não re-renderiza componentes não-inscritos

---

## 🚨 Tratamento de Erros

### Padrão de Erro

Todas as respostas retornam:

```json
{
  "success": false,
  "error": "Descrição do erro"
}
```

### Códigos HTTP

- `200` - OK ✅
- `201` - Created ✅
- `400` - Bad Request (validação fallou)
- `404` - Not Found (pedido não existe)
- `500` - Server Error (erro no banco/app)

### Tratamento no Store

```typescript
try {
  await create(orderData);
} catch (error) {
  // Erro já setado no store.error
  // Use clearError() para limpar
}
```

---

## 🔄 Cascata de Deletar

Quando você deleta um pedido:

```
DELETE orders WHERE id = ?
  ↓
Trigger ON DELETE CASCADE
  ↓
DELETE order_items WHERE order_id = ?
  ↓
Linhas removidas do UI automaticamente
```

Isso garante integridade referencial.

---

## 🌐 Integrações Externas

### Email (Próximo Passo)

```typescript
// Disparar email ao criar pedido
await sendEmail({
  to: order.customer_email,
  subject: "Pedido Confirmado",
  template: "order_confirmation",
  data: order,
});
```

### Pagamento (Futuro)

```typescript
// Integrar com Stripe/PayPal
const payment = await stripe.createPaymentIntent({
  amount: order.total_price,
  customer_email: order.customer_email,
  metadata: { order_id: order.id },
});
```

### Notificação (Futuro)

```typescript
// Notificar cliente quando status mudar
await updateStatus(orderId, "enviado");
// Trigger: enviar SMS/push notification
```

---

## 📚 Documentação Adicional

- **API_DOCS_ORDERS.md** - Referência completa de endpoints
- **sql/orders.sql** - Schema SQL com comentários
- **src/types/api.ts** - Definições TypeScript
- **src/app/api/orders/** - Código-fonte dos endpoints

---

## ✅ Checklist de Implementação

- [x] Banco de dados criado (orders + order_items)
- [x] Triggers para auto-update e total-calc
- [x] Endpoints API (5 rotas)
- [x] TypeScript types
- [x] API client wrapper
- [x] Zustand store
- [x] CreateOrderForm component
- [x] OrdersManager component
- [x] Orders page
- [x] Documentação

---

## 🎯 Próximas Features

- [ ] Notificações por email
- [ ] Dashboard de vendas
- [ ] Admin panel com gráficos
- [ ] Tracking de pedidos
- [ ] Histórico de pedidos por cliente
- [ ] Export CSV/PDF
- [ ] Integração de pagamento
- [ ] Avaliação de pedidos
- [ ] Reorder (repetir último pedido)
- [ ] Cancelamento com reembolso

---

## 🤝 Suporte

Para dúvidas, consulte:

1. API_DOCS_ORDERS.md
2. Código-fonte comentado
3. TypeScript intellisense
4. Console do browser (DevTools)

---

**Status:** ✅ Implementação Concluída

**Última Atualização:** 27/03/2026
