"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, Mail, Phone, Calendar } from "lucide-react";
import { StatusBadge } from "@/components/atoms/StatusBadge";
import { formatCurrency } from "@/functions/currency";
import type { Customer, Order, ApiResponse } from "@/types/api";

export default function ClienteDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/customers/${params.id}`);
        const result: ApiResponse<{ customer: Customer; orders: Order[] }> =
          await response.json();
        if (!response.ok || !result.success || !result.data) {
          throw new Error(result.error || "Cliente não encontrado");
        }
        if (!cancelled) {
          setCustomer(result.data.customer);
          setOrders(result.data.orders);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Erro ao carregar cliente");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    if (params.id) load();
    return () => {
      cancelled = true;
    };
  }, [params.id]);

  if (loading) {
    return <div className="p-10 text-center text-marrom-500">Carregando cliente...</div>;
  }

  if (error || !customer) {
    return (
      <div className="rounded-2xl bg-white p-10 text-center text-marrom-500 shadow-sm">
        {error || "Cliente não encontrado"}
      </div>
    );
  }

  const totalSpent = orders
    .filter((o) => o.status !== "cancelado")
    .reduce((sum, o) => sum + o.total_price, 0);

  return (
    <div>
      <div className="mb-1.5 flex items-center gap-3">
        <button
          onClick={() => router.push("/admin/clientes")}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-[#f1e4e0] bg-white"
        >
          <ChevronLeft className="h-[15px] w-[15px] text-marrom-900" strokeWidth={2.2} />
        </button>
        <h1 className="font-serif text-2xl text-marrom-900">{customer.name}</h1>
      </div>
      <p className="mb-6 ml-[44px] text-[13px] text-marrom-500">
        Cliente desde {new Date(customer.created_at).toLocaleDateString("pt-BR")}
      </p>

      <div className="grid gap-5 md:grid-cols-[1fr_1.4fr]">
        <div className="flex flex-col gap-[18px]">
          <Section title="Contato">
            <Row icon={Mail} label="E-mail" value={customer.email} />
            {customer.phone && <Row icon={Phone} label="Telefone" value={customer.phone} />}
            <Row
              icon={Calendar}
              label="Cadastro"
              value={new Date(customer.created_at).toLocaleDateString("pt-BR")}
            />
          </Section>

          <Section title="Resumo">
            <Row label="Pedidos" value={String(orders.length)} strongValue />
            <Row label="Total gasto" value={formatCurrency(totalSpent)} strongValue />
          </Section>
        </div>

        <Section title="Pedidos">
          {orders.length === 0 ? (
            <p className="py-4 text-center text-[12.5px] text-marrom-400">
              Este cliente ainda não fez nenhum pedido.
            </p>
          ) : (
            <div className="flex flex-col gap-2.5">
              {orders.map((order) => (
                <button
                  key={order.id}
                  onClick={() => router.push(`/admin/vendas/${order.id}`)}
                  className="flex items-center gap-3 rounded-xl border border-[#f1e4e0] px-3.5 py-3 text-left hover:bg-rosa-50"
                >
                  <span className="w-[80px] shrink-0 font-mono text-[11px] text-marrom-500">
                    #{order.id.slice(0, 8)}
                  </span>
                  <span className="w-[90px] shrink-0 text-[11.5px] text-marrom-500">
                    {order.created_at
                      ? new Date(order.created_at).toLocaleDateString("pt-BR")
                      : ""}
                  </span>
                  <span className="flex-1 shrink-0">
                    <StatusBadge status={order.status} />
                  </span>
                  <span className="text-[13px] font-bold text-marrom-900">
                    {formatCurrency(order.total_price)}
                  </span>
                </button>
              ))}
            </div>
          )}
        </Section>
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
  icon: Icon,
  label,
  value,
  strongValue,
}: {
  icon?: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  value: string;
  strongValue?: boolean;
}) {
  return (
    <div className="flex items-center justify-between border-b border-[#f1e4e0] py-2.5 text-[13px] last:border-b-0">
      <span className="flex items-center gap-1.5 text-marrom-500">
        {Icon && <Icon className="h-3.5 w-3.5" strokeWidth={2} />}
        {label}
      </span>
      <span className={strongValue ? "font-bold text-marrom-900" : ""}>{value}</span>
    </div>
  );
}
