# Monte seu Ovo de Páscoa Gourmet - Sistema de Customização

## 📋 Visão Geral

Sistema completo de personalização de ovos de Páscoa com:

- ✅ 4 modelos diferentes (150g, Duo 150g, Trio 50g, 400g)
- ✅ 8 sabores customizáveis
- ✅ Fluxo intuitivo de seleção
- ✅ Integração com carrinho de compras
- ✅ Suporte a database para armazenar customizações

---

## 🏗️ Arquitetura

### Componentes Frontend

```
EasterPage (/easter)
├── Hero Section (Design)
├── CustomEasterEgg (Orquestrador)
│   ├── ModelSelector
│   │   └── Escolhar tamanho/modelo
│   ├── FlavorPicker
│   │   └── Escolher 1-3 sabores
│   └── Summary & Add to Cart
├── Info Sections (Features)
└── CTA Sections (Call-to-action)
```

### Estrutura de Dados

**Tipos TypeScript** (`src/types/api.ts`):

```typescript
type EasterModelType = "150g" | "duo_150g" | "trio_50g" | "400g";

interface EasterModel {
  type: EasterModelType;
  label: string;
  price: number;
  flavorCount: number; // 1, 2, 3, 1
  description: string;
  image: string;
}

interface EasterFlavor {
  id: number;
  name: string;
  description: string;
  color_hex: string;
}

interface CustomEasterEgg {
  model: EasterModelType;
  flavors: string[]; // Array de nomes
  price: number;
  quantity: number;
}
```

**Constantes** (`src/constants/easter.ts`):

- `EASTER_MODELS`: 4 modelos com preços e configs
- `EASTER_FLAVORS`: 8 sabores com cores

---

## 📁 Arquivos Criados

### Backend

1. **sql/easter_customization.sql**
   - Adiciona coluna `flavors` (JSONB) ao `order_items`
   - Adiciona coluna `model_type` ao `order_items`
   - Cria tipos enum para validação
   - Tabela `available_flavors` para referência
   - Índices para performance

### Frontend

1. **src/constants/easter.ts**
   - Definição de 4 modelos
   - Definição de 8 sabores
   - Cores hex para cada sabor

2. **src/hooks/useCustomEasterEgg.ts**
   - Hook customizado para gerenciar estado
   - Métodos: `selectModel()`, `toggleFlavor()`, `removeFlavor()`
   - Validação de máximo de sabores
   - Cálculo de preços

3. **src/components/molecules/ModelSelector.tsx**
   - Mostra 4 cards de modelos
   - Seleção visual com checkmark
   - Badges de quantidade de sabores
   - Preços exibidos

4. **src/components/molecules/FlavorPicker.tsx**
   - Grid de 8 sabores
   - Seleção com cores visuais
   - Lista de sabores escolhidos
   - Botão remover por sabor
   - Validação de máximo

5. **src/components/organisms/CustomEasterEgg.tsx**
   - Orquestrador principal
   - Passo 1: ModelSelector
   - Passo 2: FlavorPicker
   - Resumo do pedido
   - Integração com cart store

6. **src/app/(public)/easter/page.tsx**
   - Página completa de Páscoa
   - Hero section similar a products
   - Componente CustomEasterEgg
   - Info cards explicativos
   - Showcase dos 8 sabores
   - CTA section

---

## 🚀 Como Usar

### 1. Adicionar ao Banco de Dados

```bash
# Executar SQL de customização
psql -d seu_banco < sql/easter_customization.sql
```

Isso adiciona:

- Coluna `flavors` (JSONB) ao `order_items`
- Coluna `model_type` ao `order_items`
- Tabela `available_flavors` com os 8 sabores
- Índices para otimização

### 2. Acessar a Página

```
http://localhost:3000/easter
```

### 3. Fluxo de Uso

```
Usuário acessa /easter
  ↓
Vê 4 modelos de ovos
  ↓
Clica no modelo desejado
  ↓
Vê grid de 8 sabores
  ↓
Seleciona 1-3 sabores (conforme modelo)
  ↓
Vê resumo com preço total
  ↓
Clica "Adicionar ao Carrinho"
  ↓
Produto customizado adicionado ao carrinho
```

---

## 🛠️ Componentes Detalhados

### ModelSelector

**Props:**

```typescript
interface ModelSelectorProps {
  models: EasterModel[];
  selectedModel: EasterModelType | null;
  onSelectModel: (model: EasterModelType) => void;
}
```

**Features:**

- Display de 4 cards em grid
- Imagem do ovo
- Preço destacado
- Badge de "X sabores"
- Check mark quando selecionado
- Hover effect com scale

**Modelos:**
| Modelo | Preço | Sabores | Desc |
|--------|-------|---------|------|
| 150g | R$ 45,00 | 1 | Um sabor único |
| Duo 150g | R$ 80,00 | 2 | Dois sabores iguais ou diferentes |
| Trio 50g | R$ 35,00 | 3 | Três sabores (pode repetir) |
| 400g Grande | R$ 80,00 | 1 | Ovo grande e impressionante |

### FlavorPicker

**Props:**

```typescript
interface FlavorPickerProps {
  flavors: EasterFlavor[];
  selectedFlavors: string[];
  maxFlavors: number;
  onToggleFlavor: (flavor: string) => void;
  onRemoveFlavor: (index: number) => void;
}
```

**Features:**

- Display de 8 sabores em grid
- Cores visuais de cada sabor
- Lista de selecionados com posição
- Botão remover por item
- Validação de máximo
- Mostra 1/3, 2/3 etc progressão

**Sabores (8):**

1. **Dois Amores** - Chocolate branco + leite (#A0522D)
2. **Oreo** - Chocolate + biscoito (#1C1C1C)
3. **Ninho com Nutella** - Leite + avelã (#D4A574)
4. **Brigadeirão** - Chocolate denso (#3D2817)
5. **Ferreiro Rocher** - Luxo + ouro (#D4AF37)
6. **Fini Kids** - Frutas coloridas (#FF69B4)
7. **Surpresa de Uva** - Frutas vermelhas (#8B0000)
8. **Laka Oreo** - Crocante + Oreo (#000000)

### CustomEasterEgg

**Orquestrador principal** que:

1. Usa hook `useCustomEasterEgg()` para estado
2. Renderiza `ModelSelector` (sempre visível)
3. Renderiza `FlavorPicker` (quando modelo selecionado)
4. Mostra resumo com totais
5. Botões "Recomeçar" e "Adicionar ao Carrinho"
6. Integra com `useCartStore` para adicionar

**Produto adicionado ao carrinho:**

```javascript
{
  id: "easter-duo_150g-1234567890",
  name: "Ovo de Páscoa Duo 150g (Oreo + Ninho com Nutella)",
  category: "pascoa",
  price: 80.00,
  image: "https://static.photos/food/400x400/25",
  description: "Ovo customizado com sabores: Oreo, Ninho com Nutella",
  customized: true,
  flavors: ["Oreo", "Ninho com Nutella"],
  model_type: "duo_150g"
}
```

---

## 🔌 Integração com API de Pedidos

Quando o usuário finaliza a compra, o produto customizado é salvo com:

```javascript
order_items: {
  product_id: /* ID do ovo genérico */,
  product_name: "Ovo de Páscoa Gourmet",
  flavors: ["Oreo", "Ninho com Nutella"], // JSON array
  model_type: "duo_150g",
  price: 80.00,
  quantity: 1,
  subtotal: 80.00
}
```

**No banco (JSONB):**

```json
{
  "flavors": ["Oreo", "Ninho com Nutella"],
  "model_type": "duo_150g"
}
```

---

## 🎨 Design & UX

### Cores Usadas

- **Rosa 800** (#A1334B) - Principal
- **Marrom 800** (#5C3D2E) - Textos
- **Rosa 50** (#FDF4F6) - Background
- **Ouro** (#D4AF37) - Ferreiro

### Animações

- Hover scale (1.05x)
- Pulse em blob background
- Bounce em toast notification
- Smooth scroll to top

### Responsive

- 1 coluna em mobile
- 2 colunas em tablet
- 4 colunas em desktop

---

## 📊 Estado do Componente

```typescript
interface CustomEggState {
  selectedModel: EasterModelType | null;
  selectedFlavors: string[];
  isComplete: boolean;
}

// Actions
selectModel(model) → zera flavors
toggleFlavor(flavor) → add/remove
removeFlavor(index) → remove por índice
resetSelection() → zera tudo
getCustomEgg() → objeto para carrinho
getPrice() → calcula preço
```

---

## 🧪 Fluxos de Teste

### Teste 1: 150g Simples

```
1. Clica em "150g"
2. Vê flavorpicker com máx 1 sabor
3. Clica em "Dois Amores"
4. Vê resumo: 150g + Dois Amores = R$ 45,00
5. Clica "Adicionar ao Carrinho"
6. ✅ Produto no carrinho
```

### Teste 2: Duo com 2 Sabores

```
1. Clica em "Duo 150g"
2. Vê progressão 1/2
3. Clica "Oreo" → progressão 1/2
4. Clica "Ninho com Nutella" → progressão 2/2
5. Vê resumo: Duo + 2 sabores = R$ 80,00
6. Clica "Adicionar ao Carrinho"
7. ✅ Produto no carrinho
```

### Teste 3: Trio com Sabores Iguais

```
1. Clica em "Trio 50g"
2. Vê progressão 1/3 e 2/3 e 3/3
3. Clica 3x em "Brigadeirão"
4. Vê lista: 1️⃣ Brigadeirão, 2️⃣ Brigadeirão, 3️⃣ Brigadeirão
5. Total = R$ 35,00
6. Clica "Adicionar ao Carrinho"
7. ✅ Produto com 3 sabores iguais
```

### Teste 4: Remover e Recomeçar

```
1. Seleciona modelo
2. Seleciona 2 sabores
3. Clica remover no sabor #1
4. Vê progressão voltar para 1/2
5. Clica "Recomeçar"
6. ✅ Tudo resetado
```

---

## 🚨 Considerações Técnicas

### Performance

- Componentes bem divididos
- Estado apenas onde precisa
- Re-renders otimizados (useCallback)
- JSONB indexes no banco

### Escalabilidade

- Fácil adicionar mais sabores (constante)
- Fácil adicionar mais modelos (constante)
- Estrutura JSONB permite novos campos

### Segurança

- Validação de sabores no hook
- Máximo de sabores forçado
- Preços vêm do banco (não editáveis)
- TypeScript garante tipos corretos

---

## 🔮 Próximas Features

- [ ] Visualização 3D do ovo customizado
- [ ] Compartilhar configuração via URL
- [ ] Histórico de ovos já criados
- [ ] Recomendações de sabor
- [ ] Foto do ovo customizado antes de adicionar
- [ ] Tabela de nutrição por sabor
- [ ] Chat com dúvidas sobre sabores
- [ ] Embalagem customizada com nome
- [ ] Envio em uma data específica

---

## 📝 Notas

- Usuário pode repetir sabores în Trio (igual OK)
- Preço é per ovo, não por sabor
- Imagens são placeholders (trocar por reais)
- Toast confirma adição ao carrinho
- Resetar após adicionar permite nova customização

---

**Status:** ✅ Implementação Completa

**Data:** 27/03/2026
