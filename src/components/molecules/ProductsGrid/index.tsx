import { ProductCard } from "../ProductCard";

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  image: string;
  description: string;
}

interface ProductsGridProps {
  products: Product[];
  onAddToCart: (id: number) => void;
}

export function ProductsGrid({ products, onAddToCart }: ProductsGridProps) {
  return (
    <>
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onAddToCart={onAddToCart}
        />
      ))}
    </>
  );
}
