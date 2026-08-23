"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { useOrderStore } from "@/store/order.store";
import { StatusBadge } from "@/components/atoms/StatusBadge";
import { formatCurrency } from "@/functions/currency";
import {
  ORDER_STATUS_ACTION_LABELS,
  ORDER_STATUS_NEXT,
} from "@/lib/order-status";
import type { OrderStatus } from "@/types/api";

export default function VendaDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { currentOrder, loading, error, fetchById, updateStatus, delete: deleteOrder } =
    useOrderStore();

  useEffect(() => {
    if (params.id) fetchById(params.id);
  }, [params.id, fetchById]);

  if (loading && !currentOrder) {
    return <div className="p-10 text-center text-marrom-500">Carregando pedido...</div>;
  }

  if (error || !currentOrder) {
    return (
      <div className="rounded-2xl bg-white p-10 text-center text-marrom-500 shadow-sm">
        {error || "Pedido não encontrado"}
      </div>
    );
  }

  const order = currentOrder;
  const nextStatuses = ORDER_STATUS_NEXT[order.status];

  const handleTransition = async (status: OrderStatus) => {
    await updateStatus(order.id, status);
  };

  const handleDelete = async () => {
    if (!confirm(`Excluir o pedido #${order.id.slice(0, 8)} permanentemente?`)) return;
    await deleteOrder(order.id);
    router.push("/admin/vendas");
  };

  return (
    <div>
      <div className="mb-1.5 flex items-center gap-3">
        <button
          onClick={() => router.push("/admin/vendas")}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-[#f1e4e0] bg-white"
        >
          <ChevronLeft className="h-[15px] w-[15px] text-marrom-900" strokeWidth={2.2} />
        </button>
        <h1 className="font-serif text-2xl text-marrom-900">
          Pedido #{order.id.slice(0, 8)}
        </h1>
        <StatusBadge status={order.status} />
      </div>
      <p className="mb-6 ml-[44px] text-[13px] text-marrom-500">
        Criado {order.created_at ? new Date(order.created_at).toLocaleString("pt-BR") : "—"}
        {order.updated_at && order.updated_at !== order.created_at
          ? ` · Atualizado ${new Date(order.updated_at).toLocaleString("pt-BR")}`
          : ""}
      </p>

      <div className="grid gap-5 md:grid-cols-[1.4fr_1fr]">
        <div className="flex flex-col gap-[18px]">
          {/* Cliente */}
          <Section title="Cliente">
            <Row label="Nome" value={order.customer_name} strong />
            <Row label="E-mail" value={order.customer_email} />
            {order.customer_phone && <Row label="Telefone" value={order.customer_phone} />}
          </Section>

          {/* Produtos */}
          <Section title="Produtos">
            {order.items?.map((item) => (
              <Row
                key={item.id}
                label={`${item.product_name} × ${item.quantity}`}
                value={formatCurrency(item.subtotal)}
                strongValue
              />
            ))}
            {order.notes && (
              <div className="mt-3 rounded-xl bg-rosa-50 px-3.5 py-3 text-[12.5px] text-marrom-700">
                <strong>Obs.:</strong> {order.notes}
              </div>
            )}
          </Section>

          {/* Entrega */}
          {order.customer_address && (
            <Section title="Entrega">
              <Row label="Endereço" value={order.customer_address} />
            </Section>
          )}
        </div>

        <div className="flex flex-col gap-[18px]">
          {/* Pagamento */}
          <Section title="Pagamento">
            <Row label="Subtotal" value={formatCurrency(order.total_price)} />
            {order.payment_id && <Row label="ID do pagamento (MP)" value={order.payment_id} />}
            <div className="mt-2.5 flex items-baseline justify-between border-t border-[#f1e4e0] pt-3.5">
              <span className="font-bold text-marrom-900">Total</span>
              <span className="text-lg font-bold text-vermelho-700">
                {formatCurrency(order.total_price)}
              </span>
            </div>
          </Section>

          {/* Ações */}
          <Section title="Ações">
            <p className="-mt-1.5 mb-3.5 text-[11.5px] text-marrom-500">
              Disponíveis pro status atual
            </p>
            {nextStatuses.length === 0 ? (
              <p className="text-[12.5px] text-marrom-400">
                Este pedido está em um status final — nenhuma ação disponível.
              </p>
            ) : (
              nextStatuses.map((status, index) => {
                const isDestructive = status === "cancelado";
                return (
                  <button
                    key={status}
                    onClick={() => handleTransition(status)}
                    disabled={loading}
                    className={`mb-2.5 w-full rounded-full py-3.5 text-[13.5px] font-bold disabled:opacity-60 ${
                      isDestructive
                        ? "border border-[#f3b3b3] bg-[#fff5f5] text-red-700"
                        : index === 0
                          ? "bg-gradient-to-br from-rosa-800 to-rosa-700 text-white shadow-md"
                          : "border border-marrom-800 text-marrom-800"
                    }`}
                  >
                    {ORDER_STATUS_ACTION_LABELS[status]}
                  </button>
                );
              })
            )}
            <button
              onClick={handleDelete}
              className="mt-1 w-full text-center text-[12px] font-semibold text-marrom-400 hover:text-red-600"
            >
              Excluir pedido
            </button>
          </Section>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[20px] bg-white p-[22px] shadow-[0_8px_22px_-16px_rgba(62,39,35,0.15)]">
      <span className="mb-3.5 block text-[11px] font-bold uppercase tracking-wide text-marrom-500">
        {title}
      </span>
      {children}
    </div>
  );
}

function Row({
  label,
  value,
  strong,
  strongValue,
}: {
  label: string;
  value: string;
  strong?: boolean;
  strongValue?: boolean;
}) {
  return (
    <div className="flex justify-between border-b border-[#f1e4e0] py-2.5 text-[13px] last:border-b-0">
      <span className={strong ? "font-bold text-marrom-900" : "text-marrom-500"}>
        {label}
      </span>
      <span className={strongValue ? "font-bold" : ""}>{value}</span>
    </div>
  );
}
