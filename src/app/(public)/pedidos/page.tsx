"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, ChevronRight } from "lucide-react";
import { StatusBadge } from "@/components/atoms/StatusBadge";
import { formatCurrency } from "@/functions/currency";
import type { Order, ApiResponse } from "@/types/api";

/**
 * Busca por e-mail contra GET /api/orders?email= (rota já existente, hoje
 * também usada pelo painel da gestora). Limitação conhecida: não há
 * verificação de posse do e-mail — qualquer um que souber o e-mail de outra
 * pessoa consegue ver os pedidos dela digitando-o aqui. Aceitável pro
 * escopo deste redesign, mas não é controle de acesso real; um próximo
 * passo razoável seria enviar um código de confirmação por e-mail antes de
 * mostrar a lista.
 */
export default function PedidosPage() {
  const [email, setEmail] = useState("");
  const [searchedEmail, setSearchedEmail] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    try {
      setLoading(true);
      setError(null);
      const response = await fetch(
        `/api/orders?email=${encodeURIComponent(email.trim())}`,
      );
      const result: ApiResponse<Order[]> = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Erro ao buscar pedidos");
      }

      setOrders(result.data || []);
      setSearchedEmail(email.trim());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao buscar pedidos");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto min-h-[70vh] max-w-2xl px-4 py-10 font-playfair sm:px-6 lg:px-8">
      <h1 className="mb-2 font-serif text-3xl text-marrom-900">Meus Pedidos</h1>
      <p className="mb-6 text-sm text-marrom-500">
        Digite o e-mail usado na compra para ver seus pedidos.
      </p>

      <form onSubmit={handleSearch} className="mb-8 flex gap-2">
        <div className="flex flex-1 items-center gap-2 rounded-full border border-rosa-100 bg-rosa-50 px-4 py-3">
          <Mail className="h-4 w-4 text-marrom-500" strokeWidth={2} />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="seu@email.com"
            className="w-full bg-transparent text-sm text-marrom-900 placeholder:text-marrom-400 focus:outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="rounded-full bg-rosa-800 px-6 py-3 text-sm font-bold text-white hover:bg-vermelho-700 disabled:opacity-60"
        >
          {loading ? "..." : "Buscar"}
        </button>
      </form>

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {searchedEmail && !loading && orders.length === 0 && !error && (
        <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
          <p className="font-semibold text-marrom-800">
            Nenhum pedido encontrado para {searchedEmail}
          </p>
          <p className="mt-1 text-sm text-marrom-500">
            Confira se digitou o e-mail usado na compra.
          </p>
        </div>
      )}

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
    </div>
  );
}
