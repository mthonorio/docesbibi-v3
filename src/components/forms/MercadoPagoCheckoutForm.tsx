"use client";

import { useState } from "react";
import { Mail, User, Phone } from "lucide-react";
import { MercadoPagoButton } from "@/components/atoms/MercadoPagoButton";
import { useCartStore } from "@/store/cart.store";

type CheckoutFormData = {
  name: string;
  email: string;
  phone: string;
};

/**
 * Componente: MercadoPagoCheckoutForm
 * - Coleta dados do cliente
 * - Exibe resumo do carrinho
 * - Integra botão de pagamento MP
 */
export function MercadoPagoCheckoutForm() {
  const [formData, setFormData] = useState<CheckoutFormData>({
    name: "",
    email: "",
    phone: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const { items: cartItems } = useCartStore();

  const totalAmount = cartItems.reduce(
    (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
    0,
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="bg-white rounded-3xl shadow-lg p-8 md:p-12">
      <h2 className="font-serif text-3xl font-bold text-marrom-900 mb-8 text-center">
        Finalizar Compra
      </h2>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Formulário */}
        <div className="space-y-6">
          <h3 className="font-semibold text-marrom-900 text-lg mb-4">
            Seus Dados
          </h3>

          {/* Nome */}
          <div>
            <label className="block text-sm font-semibold text-marrom-900 mb-2">
              <User className="inline w-4 h-4 mr-2" />
              Nome Completo
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="João Silva"
              className="w-full px-4 py-3 border border-marrom-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rosa-600"
              disabled={isLoading}
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-marrom-900 mb-2">
              <Mail className="inline w-4 h-4 mr-2" />
              E-mail
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="seu@email.com"
              className="w-full px-4 py-3 border border-marrom-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rosa-600"
              disabled={isLoading}
            />
            <p className="text-xs text-marrom-600 mt-1">
              Usaremos para enviar confirmação do pedido
            </p>
          </div>

          {/* Telefone */}
          <div>
            <label className="block text-sm font-semibold text-marrom-900 mb-2">
              <Phone className="inline w-4 h-4 mr-2" />
              Telefone (Opcional)
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="(11) 99999-9999"
              className="w-full px-4 py-3 border border-marrom-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rosa-600"
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Resumo do Carrinho */}
        <div className="bg-rosa-50 rounded-2xl p-6 border border-rosa-200 h-fit">
          <h3 className="font-semibold text-marrom-900 text-lg mb-4">
            Resumo do Pedido
          </h3>

          <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
            {cartItems.length > 0 ? (
              cartItems.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between text-sm pb-2 border-b border-rosa-200"
                >
                  <div>
                    <p className="font-semibold text-marrom-900">{item.name}</p>
                    <p className="text-xs text-marrom-600">
                      Qty: {item.quantity}
                    </p>
                  </div>
                  <p className="font-semibold text-rosa-800">
                    R$ {((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-marrom-600 text-sm text-center py-4">
                Carrinho vazio
              </p>
            )}
          </div>

          {/* Total */}
          <div className="border-t-2 border-rosa-300 pt-4">
            <div className="flex justify-between items-center mb-4">
              <span className="font-semibold text-marrom-900">Total:</span>
              <span className="text-2xl font-bold text-rosa-800">
                R$ {totalAmount.toFixed(2)}
              </span>
            </div>

            {/* Botão Mercado Pago */}
            <MercadoPagoButton
              email={formData.email}
              customerName={formData.name}
              orderId={`ORDER_${Date.now()}`}
              onLoading={setIsLoading}
              className="mt-6"
            />
          </div>

          {/* Aviso de segurança */}
          <p className="text-xs text-marrom-600 mt-4 text-center">
            🔒 Sua transação é segura e protegida pelo Mercado Pago
          </p>
        </div>
      </div>
    </div>
  );
}
