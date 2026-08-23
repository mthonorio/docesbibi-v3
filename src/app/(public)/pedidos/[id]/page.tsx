"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { StatusBadge } from "@/components/atoms/StatusBadge";
import { OrderStatusTimeline } from "@/components/molecules/OrderStatusTimeline";
import { formatCurrency } from "@/functions/currency";
import type { Order, ApiResponse } from "@/types/api";

export default function PedidoDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchOrder = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/orders/${params.id}`);
        const result: ApiResponse<Order> = await response.json();

        if (!response.ok || !result.success || !result.data) {
          throw new Error(result.error || "Pedido não encontrado");
        }
        if (!cancelled) setOrder(result.data);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Erro ao carregar pedido");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    if (params.id) fetchOrder();
    return () => {
      cancelled = true;
    };
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-t-2 border-b-2 border-rosa-600" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-marrom-600">{error || "Pedido não encontrado"}</p>
        <button
          onClick={() => router.push("/pedidos")}
          className="rounded-full bg-rosa-800 px-6 py-3 font-semibold text-white hover:bg-vermelho-700"
        >
          Buscar meus pedidos
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 pb-10 font-playfair sm:px-6 lg:px-8">
      <button
        onClick={() => router.back()}
        className="mb-4 flex items-center gap-1.5 text-sm font-semibold text-marrom-600 hover:text-rosa-800"
      >
        <ChevronLeft className="h-4 w-4" /> Voltar
      </button>

      <div className="mb-1.5 flex items-center gap-3">
        <h1 className="font-serif text-xl text-marrom-900">
          Pedido #{order.id.slice(0, 8)}
        </h1>
        <StatusBadge status={order.status} />
      </div>
      <p className="mb-6 text-xs text-marrom-500">
        {order.created_at
          ? new Date(order.created_at).toLocaleString("pt-BR")
          : ""}
      </p>

      <Section title="Status">
        <OrderStatusTimeline status={order.status} />
      </Section>

      <Section title="Produtos">
        {order.items?.map((item) => (
          <div
            key={item.id}
            className="flex justify-between border-b border-rosa-100 py-2.5 text-[13px] last:border-b-0"
          >
            <span>
              {item.product_name} × {item.quantity}
            </span>
            <span className="font-bold">{formatCurrency(item.subtotal)}</span>
          </div>
        ))}
      </Section>

      {order.customer_address && (
        <Section title="Entrega">
          <p className="text-[13px] text-marrom-700">{order.customer_address}</p>
        </Section>
      )}

      <Section title="Pagamento">
        <div className="flex justify-between border-b border-rosa-100 py-2.5 text-[13px]">
          <span className="text-marrom-500">Subtotal</span>
          <span>{formatCurrency(order.total_price)}</span>
        </div>
        <div className="mt-1.5 flex items-baseline justify-between pt-2">
          <span className="font-bold text-marrom-900">Total</span>
          <span className="text-lg font-bold text-vermelho-700">
            {formatCurrency(order.total_price)}
          </span>
        </div>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-4 rounded-2xl bg-white p-5 shadow-[0_8px_22px_-14px_rgba(62,39,35,0.15)]">
      <h3 className="mb-3 text-sm font-bold text-marrom-900">{title}</h3>
      {children}
    </div>
  );
}
