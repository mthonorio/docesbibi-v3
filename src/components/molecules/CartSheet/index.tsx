import { X } from "lucide-react";
import { CartItem } from "./CartItem";
import { Product } from "@/types/api";
import { formatCurrency } from "@/functions/currency";

interface CartItemType extends Product {
  quantity: number;
}

interface CartSheetProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItemType[];
  totalPrice: number;
  onUpdateQuantity: (id: string, change: number) => void;
  onRemoveItem: (id: string) => void;
}

export function CartSheet({
  isOpen,
  onClose,
  items,
  totalPrice,
  onUpdateQuantity,
  onRemoveItem,
}: CartSheetProps) {
  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        ></div>
      )}

      {/* Cart Sidebar */}
      <div
        className={`fixed inset-y-0 right-0 w-full md:w-96 bg-white shadow-2xl transform transition-transform duration-300 z-50 flex flex-col ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="p-6 border-b border-rosa-100 flex justify-between items-center bg-rosa-50">
          <h3 className="font-serif text-2xl font-bold text-marrom-900">
            Seu Carrinho
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-rosa-200 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-marrom-800" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {items.length === 0 ? (
            <p className="text-marrom-500 text-center py-8">
              Seu carrinho está vazio
            </p>
          ) : (
            items.map((item) => (
              <CartItem
                key={item.id}
                item={item}
                onUpdateQuantity={onUpdateQuantity}
                onRemove={onRemoveItem}
              />
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-rosa-100 bg-rosa-50">
          <div className="flex justify-between mb-4 text-lg font-semibold">
            <span>Total:</span>
            <span>{formatCurrency(totalPrice)}</span>
          </div>
          <button className="w-full bg-rosa-800 text-white py-3 rounded-full hover:bg-vermelho-700 transition-colors font-semibold">
            Finalizar Compra
          </button>
        </div>
      </div>
    </>
  );
}
