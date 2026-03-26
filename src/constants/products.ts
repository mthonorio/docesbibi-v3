export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  image: string;
  description: string;
}

export const products: Product[] = [
  {
    id: 1,
    name: "Barra de Chocolate Orgânico 70%",
    category: "chocolates",
    price: 28.9,
    image: "https://static.photos/food/400x400/6",
    description: "Cacau orgânico selecionado",
  },
  {
    id: 2,
    name: "Trufas Sortidas - Caixa com 12",
    category: "chocolates",
    price: 45.0,
    image: "https://static.photos/food/400x400/7",
    description: "Sabores variados artesanais",
  },
  {
    id: 3,
    name: "Bolo de Chocolate Belga",
    category: "bolos",
    price: 120.0,
    image: "https://static.photos/food/400x400/8",
    description: "Cobertura de ganache orgânico",
  },
  {
    id: 4,
    name: "Macarons Franceses - 6 unidades",
    category: "doces",
    price: 35.0,
    image: "https://static.photos/food/400x400/9",
    description: "Sabores sortidos tradicionais",
  },
  {
    id: 5,
    name: "Cesta Café da Manhã Premium",
    category: "presentes",
    price: 189.9,
    image: "https://static.photos/workspace/400x400/13",
    description: "Itens orgânicos selecionados",
  },
  {
    id: 6,
    name: "Brigadeiros Gourmet - 15 unid.",
    category: "doces",
    price: 42.0,
    image: "https://static.photos/food/400x400/14",
    description: "Chocolate belga e cacau orgânico",
  },
  {
    id: 7,
    name: "Barra Chocolate ao Leite c/ Nuts",
    category: "chocolates",
    price: 32.5,
    image: "https://static.photos/food/400x400/15",
    description: "Castanhas orgânicas crocantes",
  },
  {
    id: 8,
    name: "Bolo Red Velvet",
    category: "bolos",
    price: 135.0,
    image: "https://static.photos/food/400x400/16",
    description: "Cream cheese e baunilha natural",
  },
];

export const categoryImages: Record<string, string> = {
  chocolates: "https://static.photos/food/400x400/1",
  bolos: "https://static.photos/food/400x400/2",
  doces: "https://static.photos/food/400x400/3",
  presentes: "https://static.photos/workspace/400x400/13",
};
