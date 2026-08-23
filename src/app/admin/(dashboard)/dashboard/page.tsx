"use client";

import { useEffect, useMemo, useState } from "react";
import { useOrderStore } from "@/store/order.store";
import { formatCurrency } from "@/functions/currency";
import { ORDER_STATUS_COLORS, ORDER_STATUS_LABELS } from "@/lib/order-status";
import type { OrderStatus } from "@/types/api";

type Period = "hoje" | "semana" | "mes";

// Pedidos nesses status representam venda de fato realizada (pagamento
// confirmado) — "novo_pedido"/"aguardando_pagamento" ainda não é receita,
// "cancelado" nunca foi.
const REVENUE_STATUSES: OrderStatus[] = [
  "pago",
  "em_producao",
  "pronto_retirada",
  "saiu_entrega",
  "finalizado",
];

function startOfPeriod(period: Period): Date {
  const now = new Date();
  if (period === "hoje") {
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }
  if (period === "semana") {
    const d = new Date(now);
    d.setDate(d.getDate() - 7);
    return d;
  }
  const d = new Date(now);
  d.setDate(d.getDate() - 30);
  return d;
}

export default function DashboardPage() {
  const { orders, loading, fetchAll } = useOrderStore();
  const [period, setPeriod] = useState<Period>("semana");

  useEffect(() => {
    // Limite alto o suficiente pra cobrir os KPIs calculados aqui no
    // cliente — sem endpoint de agregação dedicado (ver plano/CLAUDE.md).
    fetchAll({ limit: 500 });
  }, [fetchAll]);

  const periodOrders = useMemo(() => {
    const since = startOfPeriod(period);
    return orders.filter((o) => o.created_at && new Date(o.created_at) >= since);
  }, [orders, period]);

  const revenueOrders = useMemo(
    () => periodOrders.filter((o) => REVENUE_STATUSES.includes(o.status)),
    [periodOrders],
  );

  const revenue = revenueOrders.reduce((sum, o) => sum + Number(o.total_price || 0), 0);
  const orderCount = periodOrders.length;
  const avgTicket = revenueOrders.length > 0 ? revenue / revenueOrders.length : 0;
  const inProgressCount = orders.filter((o) =>
    ["novo_pedido", "aguardando_pagamento", "pago", "em_producao"].includes(o.status),
  ).length;

  const statusBreakdown = useMemo(() => {
    const counts = new Map<OrderStatus, number>();
    for (const o of orders) counts.set(o.status, (counts.get(o.status) || 0) + 1);
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
  }, [orders]);

  const last7Days = useMemo(() => {
    const days: { label: string; total: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const day = new Date();
      day.setDate(day.getDate() - i);
      day.setHours(0, 0, 0, 0);
      const nextDay = new Date(day);
      nextDay.setDate(nextDay.getDate() + 1);

      const total = orders
        .filter(
          (o) =>
            REVENUE_STATUSES.includes(o.status) &&
            o.created_at &&
            new Date(o.created_at) >= day &&
            new Date(o.created_at) < nextDay,
        )
        .reduce((sum, o) => sum + Number(o.total_price || 0), 0);

      days.push({ label: String(day.getDate()).padStart(2, "0"), total });
    }
    return days;
  }, [orders]);

  const maxDay = Math.max(1, ...last7Days.map((d) => d.total));

  return (
    <div>
      <div className="mb-[26px] flex items-end justify-between">
        <div>
          <h1 className="font-serif text-[26px] text-marrom-900">Dashboard</h1>
          <p className="mt-1 text-[13.5px] text-marrom-500">
            Visão geral da operação
          </p>
        </div>
        <div className="flex gap-2">
          {(["hoje", "semana", "mes"] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`rounded-full px-4 py-2 text-[12.5px] font-bold capitalize ${
                period === p
                  ? "bg-rosa-800 text-white"
                  : "border border-[#f1e4e0] bg-white text-marrom-700"
              }`}
            >
              {p === "mes" ? "Mês" : p}
            </button>
          ))}
        </div>
      </div>

      {loading && orders.length === 0 ? (
        <div className="rounded-2xl bg-white p-10 text-center text-marrom-500 shadow-sm">
          Carregando...
        </div>
      ) : (
        <>
          <div className="mb-[22px] grid grid-cols-2 gap-[18px] lg:grid-cols-4">
            <Kpi label="Faturamento" value={formatCurrency(revenue)} />
            <Kpi label="Pedidos no período" value={String(orderCount)} />
            <Kpi label="Ticket médio" value={formatCurrency(avgTicket)} />
            <Kpi
              label="Em andamento agora"
              value={String(inProgressCount)}
              hint="precisam de atenção"
            />
          </div>

          <div className="grid gap-[18px] lg:grid-cols-[1.3fr_1fr]">
            <div className="rounded-[20px] bg-white p-[22px] shadow-[0_8px_24px_-16px_rgba(62,39,35,0.16)]">
              <h3 className="mb-5 font-serif text-[15px] text-marrom-900">
                Faturamento nos últimos 7 dias
              </h3>
              <div className="flex h-[150px] items-end gap-3.5">
                {last7Days.map((d, i) => (
                  <div key={i} className="flex flex-1 flex-col items-center gap-2">
                    <div
                      className="w-full rounded-t-lg bg-gradient-to-b from-rosa-800 to-rosa-200"
                      style={{ height: `${Math.max(4, (d.total / maxDay) * 140)}px` }}
                      title={formatCurrency(d.total)}
                    />
                    <span className="text-[10.5px] text-marrom-500">{d.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[20px] bg-white p-[22px] shadow-[0_8px_24px_-16px_rgba(62,39,35,0.16)]">
              <h3 className="mb-[18px] font-serif text-[15px] text-marrom-900">
                Pedidos por status
              </h3>
              <div className="flex flex-col gap-3">
                {statusBreakdown.map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-[12.5px]">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: ORDER_STATUS_COLORS[status].text }}
                      />
                      {ORDER_STATUS_LABELS[status]}
                    </span>
                    <span className="text-[13px] font-bold">{count}</span>
                  </div>
                ))}
                {statusBreakdown.length === 0 && (
                  <p className="text-[12.5px] text-marrom-400">Nenhum pedido ainda.</p>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function Kpi({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-[20px] bg-white p-[22px] shadow-[0_8px_24px_-16px_rgba(62,39,35,0.16)]">
      <span className="text-xs font-bold text-marrom-500">{label}</span>
      <p className="my-2 font-serif text-[28px] font-bold text-marrom-900">{value}</p>
      {hint && <span className="text-[11.5px] font-bold text-[#c2650a]">{hint}</span>}
    </div>
  );
}
