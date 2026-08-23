"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, PackageSearch } from "lucide-react";
import { StatusBadge } from "@/components/atoms/StatusBadge";
import { formatCurrency } from "@/functions/currency";
import type { Order, ApiResponse } from "@/types/api";

/**
 * Pedidos do comprador logado (GET /api/orders/mine — a posse vem da
 * sessão, sem parâmetro de e-mail). A página em si já fica atrás do proxy
 * (ver src/proxy.ts, CUSTOMER_PATHS), então sempre há sessão de customer
 * aqui — se não houver, o próprio /api/orders/mine devolve 401 e o usuário
 * cai no estado de erro abaixo.
 */
export default function PedidosPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/orders/mine");
        const result: ApiResponse<Order[]> = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.error || "Erro ao buscar pedidos");
        }

        setOrders(result.data || []);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao buscar pedidos");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  return (
    <div className="mx-auto min-h-[70vh] max-w-2xl px-4 py-10 font-playfair sm:px-6 lg:px-8">
      <h1 className="mb-2 font-serif text-3xl text-marrom-900">Meus Pedidos</h1>
      <p className="mb-8 text-sm text-marrom-500">
        Acompanhe o status de todas as suas compras.
      </p>

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="h-10 w-10 animate-spin rounded-full border-t-2 border-b-2 border-rosa-600" />
        </div>
      ) : orders.length === 0 && !error ? (
        <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
          <PackageSearch className="mx-auto mb-3 h-8 w-8 text-rosa-300" strokeWidth={1.5} />
          <p className="font-semibold text-marrom-800">
            Você ainda não fez nenhum pedido
          </p>
          <Link
            href="/products"
            className="mt-4 inline-block rounded-full bg-rosa-800 px-6 py-2.5 text-sm font-bold text-white hover:bg-vermelho-700"
          >
            Ver produtos
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/pedidos/${order.id}`}
              className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-[0_8px_22px_-14px_rgba(62,39,35,0.15)] hover:shadow-[0_8px_22px_-10px_rgba(62,39,35,0.25)]"
            >
              <div className="flex-1">
                <div className="mb-1.5 flex items-center gap-2">
                  <span className="font-mono text-xs text-marrom-500">
                    #{order.id.slice(0, 8)}
                  </span>
                  <StatusBadge status={order.status} />
                </div>
                <p className="text-sm text-marrom-800">
                  {order.items?.map((i) => i.product_name).join(", ") || "—"}
                </p>
                <p className="mt-1 text-xs text-marrom-500">
                  {order.created_at
                    ? new Date(order.created_at).toLocaleDateString("pt-BR")
                    : ""}{" "}
                  · {formatCurrency(order.total_price)}
                </p>
              </div>
              <ChevronRight className="h-5 w-5 shrink-0 text-marrom-400" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
