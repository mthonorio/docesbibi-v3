export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  image: string;
  description: string;
}

export const categoryImages: Record<string, string> = {
  pascoa:
    "https://nibzwcpdpqzwigkocgio.supabase.co/storage/v1/object/public/images/easter_category.png",
  personalizados: "https://static.photos/food/400x400/40",
  tradicionais: "https://static.photos/food/400x400/11",
  gourmet: "https://static.photos/food/400x400/12",
};
