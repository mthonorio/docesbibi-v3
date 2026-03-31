# Conversão do Design para Next.js + TailwindCSS

## Resumo das Mudanças

O design e funcionalidade do `index.html` foram completamente convertidos para um componente Next.js utilizando React hooks e TailwindCSS.

## Arquivos Modificados

### 1. **tailwind.config.ts** (Novo)

- Criado arquivo de configuração do Tailwind
- Adicionadas cores personalizadas: `rosa`, `marrom`, `vermelho`
- Definidas fontes personalizadas: `Playfair Display` (serif), `Lato` (sans)
- Configuradas animações customizadas: `gradientShift`, `blobMorph`, `fadeIn`

### 2. **src/app/globals.css** (Modificado)

Adicionados estilos globais para:

- Scrollbar customizado (WebKit)
- Seleção de texto personalizada
- Animações e efeitos
- Estilos de foco para acessibilidade
- Media queries responsive
- Propriedades `will-change` e `backface-visibility` para performance

### 3. **src/app/layout.tsx** (Modificado)

- Importadas fontes do Google: `Playfair Display` e `Lato`
- Adicionadas variáveis CSS para as novas fontes
- Atualizados metadados (title, description)
- Alterada linguagem para `pt-BR`
- Adicionada classe `scroll-smooth` ao html

### 4. **src/app/page.tsx** (Reescrito)

Componente completamente refeito com:

- `"use client"` para suportar React hooks
- **Estado (useState)**: cart, filter, mobileMenuOpen, cartOpen, toast, scrollShadow
- **Efeitos (useEffect)**: scroll listener para sombra da navbar
- **Funções principais**:
  - `showToast()` - exibe notificações temporárias
  - `addToCart()` - adiciona produtos ao carrinho
  - `updateQuantity()` - atualiza quantidade de itens
  - `removeFromCart()` - remove itens do carrinho
- **Seções**:
  1. Navegação fixa com responsividade
  2. Hero section com gradientes e blobs
  3. Categorias (4 categorias principais)
  4. Produtos com filtros dinâmicos
  5. Sobre (história e destaques)
  6. Testimoniais
  7. Newsletter
  8. Footer com links
  9. Carrinho lateral (drawer)
  10. Toast de notificação

## Funcionalidades Implementadas

### Carrinho de Compras

- ✅ Adicionar produtos
- ✅ Atualizar quantidade
- ✅ Remover itens
- ✅ Cálculo automático de total
- ✅ Drawer lateral responsivo
- ✅ Contador de itens no ícone

### Filtros de Produtos

- ✅ Filtrar por categoria
- ✅ Visualizar "Todos" os produtos
- ✅ Destaque visual do filtro ativo
- ✅ Navegação suave para seção

### Interações

- ✅ Menu mobile colapsável
- ✅ Scroll suave
- ✅ Sombra dinâmica na navbar
- ✅ Hover effects em cards
- ✅ Animações de entrada
- ✅ Toast notifications

### Responsividade

- ✅ Mobile-first design
- ✅ Breakpoints Tailwind (sm, md, lg)
- ✅ Menu responsivo
- ✅ Grid adaptativo de produtos

## Componentes Utilizados

### Lucide Icons

- `ShoppingCart` - ícone de carrinho
- `Menu` - ícone de menu hamburger
- `X` - ícone de fechar
- `Mail` - ícone de email
- `Trash2` - ícone de lixo
- `Plus` / `Minus` - ícones de quantidade
- `CheckCircle` - ícone de confirmação

## Cores Personalizadas

```typescript
rosa: {
  50: "#FFF0F0",    // Fundo muito claro
  200: "#FFB2B2",   // Claro
  300: "#FF9999",   // Médio-claro
  600: "#F08DA3",   // Médio
  800: "#F08DA3",   // Escuro (rosa principal)
}

marrom: {
  400: "#A1887F",   // Muito claro
  500: "#8B7355",   // Claro
  700: "#6D4C41",   // Médio
  800: "#3E2723",   // Escuro
  900: "#3E2723",   // Muito escuro
}

vermelho: {
  700: "#8B0000",   // Deep red
}
```

## Fontes

- **Serif (Títulos)**: Playfair Display (400, 600, 700)
- **Sans (Texto)**: Lato (300, 400, 700)

## Animações

1. **gradientShift** - Animação de gradiente em movimento (3s)
2. **blobMorph** - Transformação de blob (8s)
3. **fadeIn** - Fade in com translação (0.8s)
4. **hover-lift** - Efeito de elevação no hover

## Performance

- ✅ Lazy loading de imagens
- ✅ CSS otimizado com Tailwind
- ✅ Componente único (sem split)
- ✅ Event listeners removidos no cleanup
- ✅ Backface visibility para animações

## Próximas Etapas Recomendadas

1. Conectar a API de pagamento (checkout)
2. Implementar backend para carrinho persistente
3. Adicionar página de produto detalhado
4. Implementar autenticação de usuário
5. Adicionar análise de conversão
6. Otimizar imagens com Next.js Image component
7. Adicionar SEO estruturado (Schema.org)

## Contato & Suporte

Para integração futura:

- API de produtos
- Sistema de pedidos
- Integração com gateway de pagamento
- Gerenciamento de estoque
- Email marketing
