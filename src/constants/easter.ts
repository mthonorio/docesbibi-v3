import type { EasterModel, EasterFlavor } from "@/types/api";

export const EASTER_MODELS: EasterModel[] = [
  {
    type: "150g",
    label: "150g",
    price: 45.0,
    flavorCount: 1,
    description: "Um único sabor de chocolate gourmet",
    image:
      "https://nibzwcpdpqzwigkocgio.supabase.co/storage/v1/object/public/images/ovo_150g%20(1).png",
  },
  {
    type: "duo_150g",
    label: "Duo 150g",
    price: 80.0,
    flavorCount: 2,
    description: "Escolha dois sabores diferentes ou iguais",
    image:
      "https://nibzwcpdpqzwigkocgio.supabase.co/storage/v1/object/public/images/ovo_duo%20(1).png",
  },
  {
    type: "trio_50g",
    label: "Trio 50g",
    price: 35.0,
    flavorCount: 3,
    description: "Três sabores em tamanho miniatura",
    image:
      "https://nibzwcpdpqzwigkocgio.supabase.co/storage/v1/object/public/images/ovo_trio%20(1).png",
  },
  {
    type: "400g",
    label: "400g Grande",
    price: 80.0,
    flavorCount: 1,
    description: "Ovo grande e impressionante",
    image:
      "https://nibzwcpdpqzwigkocgio.supabase.co/storage/v1/object/public/images/ovo_400g%20(1).png",
  },
];

export const EASTER_FLAVORS: EasterFlavor[] = [
  {
    id: 1,
    name: "Dois Amores",
    description: "Chocolate branco e ao leite em perfeita harmonia",
    color_hex: "#A0522D",
  },
  {
    id: 2,
    name: "Oreo",
    description: "Chocolate com biscoito crocante Oreo",
    color_hex: "#1C1C1C",
  },
  {
    id: 3,
    name: "Ninho com Nutella",
    description: "Doçura morna do Ninho com avelã irresistível",
    color_hex: "#D4A574",
  },
  {
    id: 4,
    name: "Brigadeirão",
    description: "Chocolate denso e cremoso do brigadeiro brasileiro",
    color_hex: "#3D2817",
  },
  {
    id: 5,
    name: "Ferreiro Rocher",
    description: "Luxo: chocolate, wafer e ouro comestível",
    color_hex: "#D4AF37",
  },
  {
    id: 6,
    name: "Fini Kids",
    description: "Frutas coloridas para crianças se divertirem",
    color_hex: "#FF69B4",
  },
  {
    id: 7,
    name: "Surpresa de Uva",
    description: "Acidez doce e surpreendente de frutas vermelhas",
    color_hex: "#8B0000",
  },
  {
    id: 8,
    name: "Laka Oreo",
    description: "Cobertura crocante Laka com recheio Oreo",
    color_hex: "#000000",
  },
];
