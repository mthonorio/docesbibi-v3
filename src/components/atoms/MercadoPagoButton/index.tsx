"use client";

import { useState } from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import { useCartStore } from "@/store/cart.store";
import { logger } from "@/lib/mercadopago";

interface MercadoPagoButtonProps {
  email?: string;
  customerName?: string;
  onError?: (error: string) => void;
  onLoading?: (isLoading: boolean) => void;
  className?: string;
}

/**
 * Componente: MercadoPagoButton
 * - Integra com o carrinho global
 * - Cria preferência de pagamento (o servidor cria o pedido correspondente)
 * - Redireciona para checkout do Mercado Pago
 */
export function MercadoPagoButton({
  email = "",
  customerName = "",
  onError,
  onLoading,
  className = "",
}: MercadoPagoButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const { items: cartItems, clearCart } = useCartStore();

  const handlePayment = async () => {
    try {
      setError("");
      setLoading(true);
      onLoading?.(true);

      // Validar carrinho
      if (!cartItems || cartItems.length === 0) {
        const errorMsg =
          "Seu carrinho está vazio. Adicione produtos antes de pagar.";
        setError(errorMsg);
        onError?.(errorMsg);
        logger.error("MERCADOPAGO_BUTTON", errorMsg);
        return;
      }

      // Validar email
      if (!email || !email.includes("@")) {
        const errorMsg = "E-mail válido é obrigatório";
        setError(errorMsg);
        onError?.(errorMsg);
        logger.error("MERCADOPAGO_BUTTON", errorMsg);
        return;
      }

      logger.info("MERCADOPAGO_BUTTON", "Iniciando pagamento", {
        itemsCount: cartItems.length,
        email,
        totalAmount: cartItems.reduce(
          (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
          0,
        ),
      });

      // Preparar payload com product_id vindo do banco (seguro).
      // O pedido é criado no servidor por /api/create-payment — o ID do
      // pedido (e, portanto, o external_reference da cobrança) vem na resposta.
      const payload = {
        items: cartItems.map((item) => ({
          product_id: item.id, // UUID do produto vindo do banco
          quantity: item.quantity || 1,
        })),
        payer: {
          email,
          name: customerName || "Cliente",
        },
      };

      logger.info(
        "MERCADOPAGO_BUTTON",
        "Enviando requisição para criar preferência",
        {
          payloadSummary: {
            itemsCount: payload.items.length,
          },
        },
      );

      // Fazer requisição
      const response = await fetch("/api/create-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMsg = data.error || "Erro ao processar pagamento";
        setError(errorMsg);
        onError?.(errorMsg);
        logger.error("MERCADOPAGO_BUTTON", "Erro na requisição", {
          status: response.status,
          error: data,
        });
        return;
      }

      if (!data.init_point) {
        const errorMsg = "Preferência criada mas sem URL de checkout";
        setError(errorMsg);
        onError?.(errorMsg);
        logger.error("MERCADOPAGO_BUTTON", errorMsg);
        return;
      }

      logger.info("MERCADOPAGO_BUTTON", "Preferência criada com sucesso", {
        preferenceId: data.preference_id,
        initPoint: data.init_point?.substring(0, 50) + "...",
      });

      // Limpar carrinho e redirecionar
      clearCart();
      window.location.href = data.init_point;
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Erro ao processar pagamento";
      setError(errorMsg);
      onError?.(errorMsg);
      logger.error("MERCADOPAGO_BUTTON", "Erro de rede/sistema", {
        error: err,
      });
    } finally {
      setLoading(false);
      onLoading?.(false);
    }
  };

  return (
    <div className="w-full">
      {/* Erro */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Botão */}
      <button
        onClick={handlePayment}
        disabled={loading || !email}
        className={`w-full px-6 py-3 bg-linear-to-r from-rosa-800 to-vermelho-700 text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${className}`}
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Processando...
          </>
        ) : (
          <>
            <svg className="w-5 h-5" viewBox="0 0 180 180" fill="currentColor">
              {/* Logo Mercado Pago simplificado */}
              <circle
                cx="90"
                cy="90"
                r="85"
                fill="none"
                stroke="white"
                strokeWidth="8"
              />
              <circle cx="90" cy="90" r="70" fill="white" />
              <circle cx="65" cy="90" r="20" fill="currentColor" />
              <circle cx="115" cy="90" r="20" fill="currentColor" />
            </svg>
            Pagar com Mercado Pago
          </>
        )}
      </button>

      {/* Info */}
      {!email && (
        <p className="text-sm text-marrom-600 mt-3 text-center">
          Digite seu e-mail para continuar
        </p>
      )}
    </div>
  );
}
