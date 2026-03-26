import { Minus, Plus, Trash2 } from "lucide-react";

interface CartItemType {
  id: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

interface CartItemProps {
  item: CartItemType;
  onUpdateQuantity: (id: number, change: number) => void;
  onRemove: (id: number) => void;
}

export function CartItem({ item, onUpdateQuantity, onRemove }: CartItemProps) {
  return (
    <div className="flex gap-4 bg-rosa-50 p-4 rounded-xl">
      <img
        src={item.image}
        alt={item.name}
        className="w-20 h-20 object-cover rounded-lg"
      />
      <div className="flex-1">
        <h4 className="font-semibold text-marrom-900 text-sm mb-1">
          {item.name}
        </h4>
        <p className="text-vermelho-700 font-bold">
          R$ {item.price.toFixed(2)}
        </p>
        <div className="flex items-center gap-2 mt-2">
          <button
            onClick={() => onUpdateQuantity(item.id, -1)}
            className="w-6 h-6 rounded-full bg-white border border-rosa-300 flex items-center justify-center hover:bg-rosa-100"
          >
            <Minus className="w-3 h-3" />
          </button>
          <span className="text-sm font-semibold w-6 text-center">
            {item.quantity}
          </span>
          <button
            onClick={() => onUpdateQuantity(item.id, 1)}
            className="w-6 h-6 rounded-full bg-white border border-rosa-300 flex items-center justify-center hover:bg-rosa-100"
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>
      </div>
      <button
        onClick={() => onRemove(item.id)}
        className="text-marrom-400 hover:text-vermelho-700"
      >
        <Trash2 className="w-5 h-5" />
      </button>
    </div>
  );
}
