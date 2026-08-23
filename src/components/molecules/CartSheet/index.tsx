import { X, ShoppingBag } from "lucide-react";
import Link from "next/link";
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
          <div>
            <h3 className="font-serif text-2xl font-bold text-marrom-900">
              Seu Carrinho
            </h3>
            {items.length > 0 && (
              <span className="text-xs text-marrom-500">
                {items.reduce((sum, i) => sum + i.quantity, 0)} itens
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-rosa-200 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-marrom-800" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <div className="w-16 h-16 rounded-full bg-rosa-50 flex items-center justify-center mb-4">
                <ShoppingBag className="w-7 h-7 text-rosa-300" strokeWidth={1.5} />
              </div>
              <p className="font-semibold text-marrom-800 mb-1">
                Seu carrinho está vazio
              </p>
              <p className="text-sm text-marrom-500 mb-5">
                Que tal experimentar nossos docinhos?
              </p>
              <Link
                href="/products"
                onClick={onClose}
                className="bg-rosa-800 text-white px-6 py-2.5 rounded-full font-semibold text-sm hover:bg-vermelho-700 transition-colors"
              >
                Ver produtos
              </Link>
            </div>
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
        {items.length > 0 && (
          <div className="p-6 border-t border-rosa-100 bg-rosa-50">
            <div className="flex justify-between items-baseline mb-4">
              <span className="font-semibold text-marrom-800">Total</span>
              <span className="text-2xl font-bold text-vermelho-700">
                {formatCurrency(totalPrice)}
              </span>
            </div>
            <Link
              href="/checkout"
              className="block w-full bg-gradient-to-br from-rosa-800 to-rosa-700 text-white py-3.5 rounded-full hover:shadow-lg transition-all font-semibold text-center shadow-md"
              onClick={onClose}
            >
              Finalizar Compra
            </Link>
            <button
              onClick={onClose}
              className="w-full text-center text-marrom-500 text-sm font-semibold mt-3 hover:text-marrom-800"
            >
              Continuar comprando
            </button>
          </div>
        )}
      </div>
    </>
  );
}
