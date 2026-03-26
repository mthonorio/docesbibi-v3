# Estrutura de Componentes - Doces Bibi

## Organização

```
src/components/
├── molecules/
│   ├── CartSheet/
│   │   ├── index.tsx - Componente principal do carrinho
│   │   └── CartItem.tsx - Item individual do carrinho
│   ├── ProductCard/
│   │   └── index.tsx - Card individual de produto
│   └── ProductsGrid/
│       └── index.tsx - Grid/lista de produtos
├── atoms/
│   ├── Alert/
│   ├── Button/
│   ├── Calendar/
│   └── ... (outros átomos do shadcn)
```

## Componentes Principais

### CartSheet (`molecules/CartSheet/index.tsx`)

Componente responsável por renderizar o drawer do carrinho.

**Props:**

```typescript
interface CartSheetProps {
  isOpen: boolean; // Se o carrinho está aberto
  onClose: () => void; // Callback para fechar
  items: CartItemType[]; // Itens no carrinho
  totalPrice: number; // Preço total
  onUpdateQuantity: (id, change) => void; // Atualizar quantidade
  onRemoveItem: (id) => void; // Remover item
}
```

**Uso:**

```jsx
<CartSheet
  isOpen={cartOpen}
  onClose={() => setCartOpen(false)}
  items={cart}
  totalPrice={totalPrice}
  onUpdateQuantity={updateQuantity}
  onRemoveItem={removeFromCart}
/>
```

### CartItem (`molecules/CartSheet/CartItem.tsx`)

Componente para renderizar um item individual do carrinho.

**Props:**

```typescript
interface CartItemProps {
  item: CartItemType;
  onUpdateQuantity: (id, change) => void;
  onRemove: (id) => void;
}
```

### ProductCard (`molecules/ProductCard/index.tsx`)

Componente individual de card de produto.

**Props:**

```typescript
interface ProductCardProps {
  product: Product;
  onAddToCart: (id) => void;
}
```

### ProductsGrid (`molecules/ProductsGrid/index.tsx`)

Componente para renderizar grid de produtos.

**Props:**

```typescript
interface ProductsGridProps {
  products: Product[];
  onAddToCart: (id) => void;
}
```

**Uso:**

```jsx
<ProductsGrid products={filteredProducts} onAddToCart={addToCart} />
```

## Padrão de Design

- **Molecules**: Componentes compostos de múltiplos átomos (CartSheet, ProductCard, etc)
- **Props drilling**: Passar callbacks do page.tsx para os componentes
- **Separação de responsabilidades**: Cada componente tem uma função clara
- **Reutilização**: Componentes podem ser importados em qualquer lugar

## Fluxo de Dados

```
page.tsx (Estado global)
    ↓
    ├─→ CartSheet (isOpen, items, callbacks)
    │   └─→ CartItem (item, callbacks)
    │
    └─→ ProductsGrid (products, onAddToCart)
        └─→ ProductCard (product, onAddToCart)
```

## Adicionando Novos Componentes

1. Criar pasta em `src/components/molecules/` ou `src/components/atoms/`
2. Criar arquivo `index.tsx` com o componente
3. Exportar com tipagem completa
4. Importar no `page.tsx` ou onde necessário

## Benefícios

✅ Código mais limpo e legível
✅ Componentes reutilizáveis
✅ Fácil manutenção
✅ Testabilidade melhorada
✅ Segue padrões da indústria
✅ Performance otimizada
