import { Plus } from "lucide-react";

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  image: string;
  description: string;
}

interface ProductCardProps {
  product: Product;
  onAddToCart: (id: number) => void;
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover-lift group">
      {/* Image Container */}
      <div className="relative overflow-hidden aspect-square">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />

        {/* Add Button */}
        <button
          onClick={() => onAddToCart(product.id)}
          className="absolute bottom-4 right-4 bg-rosa-800 text-white p-3 rounded-full shadow-lg hover:bg-vermelho-700 transition-all transform translate-y-12 group-hover:translate-y-0"
        >
          <Plus className="w-6 h-6" />
        </button>

        {/* Category Badge */}
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-semibold text-marrom-800">
          {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="font-serif text-lg font-semibold text-marrom-900 mb-1">
          {product.name}
        </h3>
        <p className="text-marrom-500 text-sm mb-3">{product.description}</p>

        {/* Price and Action */}
        <div className="flex justify-between items-center">
          <span className="text-xl font-bold text-vermelho-700">
            R$ {product.price.toFixed(2)}
          </span>
          <button
            onClick={() => onAddToCart(product.id)}
            className="text-rosa-800 hover:text-vermelho-700 font-semibold text-sm"
          >
            Adicionar
          </button>
        </div>
      </div>
    </div>
  );
}
