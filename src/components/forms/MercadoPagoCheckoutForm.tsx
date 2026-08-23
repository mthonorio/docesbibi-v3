"use client";

import { useState } from "react";
import { Mail, User, Phone, MapPin, MessageSquare } from "lucide-react";
import { MercadoPagoButton } from "@/components/atoms/MercadoPagoButton";
import { useCartStore } from "@/store/cart.store";

type CheckoutFormData = {
  name: string;
  email: string;
  phone: string;
  address: string;
  notes: string;
};

function SectionLabel({ step, title }: { step: number; title: string }) {
  return (
    <div className="flex items-center gap-2.5 mb-4">
      <span className="w-6 h-6 rounded-full bg-rosa-800 text-white text-xs font-bold flex items-center justify-center shrink-0">
        {step}
      </span>
      <h3 className="font-semibold text-marrom-900 text-[15px]">{title}</h3>
    </div>
  );
}

const fieldClass =
  "w-full px-4 py-3 border border-rosa-100 rounded-xl focus:outline-none focus:border-rosa-800 text-sm";

/**
 * Componente: MercadoPagoCheckoutForm
 * - Coleta dados do cliente, endereço e observações
 * - Exibe resumo do carrinho
 * - Integra botão de pagamento MP
 */
export function MercadoPagoCheckoutForm() {
  const [formData, setFormData] = useState<CheckoutFormData>({
    name: "",
    email: "",
    phone: "",
    address: "",
    notes: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const { items: cartItems } = useCartStore();

  const totalAmount = cartItems.reduce(
    (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
    0,
  );

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
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
        <div className="space-y-7">
          {/* 1. Dados */}
          <div>
            <SectionLabel step={1} title="Seus dados" />
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-marrom-900 mb-1.5">
                  <User className="inline w-3.5 h-3.5 mr-1.5 -mt-0.5" />
                  Nome Completo
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="João Silva"
                  className={fieldClass}
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-marrom-900 mb-1.5">
                  <Mail className="inline w-3.5 h-3.5 mr-1.5 -mt-0.5" />
                  E-mail
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="seu@email.com"
                  className={fieldClass}
                  disabled={isLoading}
                />
                <p className="text-xs text-marrom-500 mt-1">
                  Usaremos para enviar a confirmação do pedido
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-marrom-900 mb-1.5">
                  <Phone className="inline w-3.5 h-3.5 mr-1.5 -mt-0.5" />
                  Telefone (opcional)
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="(11) 99999-9999"
                  className={fieldClass}
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          {/* 2. Endereço */}
          <div>
            <SectionLabel step={2} title="Endereço de entrega" />
            <label className="block text-xs font-bold text-marrom-900 mb-1.5">
              <MapPin className="inline w-3.5 h-3.5 mr-1.5 -mt-0.5" />
              Endereço completo (opcional pra retirada no local)
            </label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              placeholder="Rua, número, bairro, cidade"
              rows={2}
              className={fieldClass}
              disabled={isLoading}
            />
          </div>

          {/* 3. Observações */}
          <div>
            <SectionLabel step={3} title="Observações do pedido" />
            <label className="block text-xs font-bold text-marrom-900 mb-1.5">
              <MessageSquare className="inline w-3.5 h-3.5 mr-1.5 -mt-0.5" />
              Alguma preferência? (opcional)
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="Ex.: sem açúcar, embalar pra presente..."
              rows={2}
              className={fieldClass}
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Resumo do Carrinho */}
        <div className="bg-rosa-50 rounded-2xl p-6 border border-rosa-100 h-fit">
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
                    <p className="text-xs text-marrom-500">
                      Qtd: {item.quantity}
                    </p>
                  </div>
                  <p className="font-semibold text-vermelho-700">
                    R$ {((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-marrom-500 text-sm text-center py-4">
                Carrinho vazio
              </p>
            )}
          </div>

          {/* Total */}
          <div className="border-t-2 border-rosa-200 pt-4">
            <div className="flex justify-between items-baseline mb-4">
              <span className="font-semibold text-marrom-900">Total</span>
              <span className="text-2xl font-bold text-vermelho-700">
                R$ {totalAmount.toFixed(2)}
              </span>
            </div>

            {/* Botão Mercado Pago */}
            <MercadoPagoButton
              email={formData.email}
              customerName={formData.name}
              customerAddress={formData.address}
              notes={formData.notes}
              onLoading={setIsLoading}
              className="mt-6"
            />
          </div>

          {/* Aviso de segurança */}
          <p className="text-xs text-marrom-500 mt-4 text-center">
            🔒 Sua transação é segura e protegida pelo Mercado Pago
          </p>
        </div>
      </div>
    </div>
  );
}
