import { formatCurrency } from "@/functions/currency";
import { Product } from "@/types/api";
import { Minus, Plus, Trash2 } from "lucide-react";

interface CartItemType extends Product {
  quantity: number;
}

interface CartItemProps {
  item: CartItemType;
  onUpdateQuantity: (id: string, change: number) => void;
  onRemove: (id: string) => void;
}

export function CartItem({ item, onUpdateQuantity, onRemove }: CartItemProps) {
  return (
    <div className="flex gap-3.5 py-4 border-b border-rosa-100 last:border-b-0">
      <img
        src={item.image}
        alt={item.name}
        className="w-[76px] h-[76px] object-cover rounded-2xl shrink-0"
      />
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start gap-2">
          <h4 className="font-semibold text-marrom-900 text-sm leading-tight">
            {item.name}
          </h4>
          <button
            onClick={() => onRemove(item.id)}
            className="text-marrom-400 hover:text-vermelho-700 shrink-0"
            aria-label={`Remover ${item.name}`}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center justify-between mt-2.5">
          <div className="inline-flex items-center rounded-full border-2 border-rosa-100">
            <button
              onClick={() => onUpdateQuantity(item.id, -1)}
              className="w-7 h-7 flex items-center justify-center"
              aria-label="Diminuir quantidade"
            >
              <Minus className="w-3 h-3 text-marrom-900" strokeWidth={2.5} />
            </button>
            <span className="text-xs font-bold w-6 text-center">
              {item.quantity}
            </span>
            <button
              onClick={() => onUpdateQuantity(item.id, 1)}
              className="w-7 h-7 flex items-center justify-center"
              aria-label="Aumentar quantidade"
            >
              <Plus className="w-3 h-3 text-marrom-900" strokeWidth={2.5} />
            </button>
          </div>
          <span className="text-vermelho-700 font-bold text-[15px]">
            {formatCurrency(item.price * item.quantity)}
          </span>
        </div>
      </div>
    </div>
  );
}
