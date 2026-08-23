"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Plus } from "lucide-react";
import { useOrderStore } from "@/store/order.store";
import { StatusBadge } from "@/components/atoms/StatusBadge";
import { CreateOrderForm } from "@/components/forms/CreateOrderForm";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/atoms/Dialog";
import { formatCurrency } from "@/functions/currency";
import type { Order } from "@/types/api";

type Tab = "andamento" | "agendadas" | "finalizadas" | "canceladas";

const IN_PROGRESS_STATUSES = [
  "novo_pedido",
  "aguardando_pagamento",
  "pago",
  "em_producao",
  "pronto_retirada",
  "saiu_entrega",
] as const;

function timeAgo(dateString?: string): string {
  if (!dateString) return "";
  const diffMs = Date.now() - new Date(dateString).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "agora";
  if (minutes < 60) return `há ${minutes}min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `há ${hours}h`;
  return `há ${Math.floor(hours / 24)}d`;
}

export default function VendasPage() {
  const router = useRouter();
  const { orders, loading, error, fetchAll } = useOrderStore();
  const [tab, setTab] = useState<Tab>("andamento");
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => {
    fetchAll({ limit: 200 });
  }, [fetchAll]);

  const filtered = useMemo(() => {
    let list: Order[];
    switch (tab) {
      case "andamento":
        list = orders.filter((o) =>
          (IN_PROGRESS_STATUSES as readonly string[]).includes(o.status),
        );
        break;
      case "finalizadas":
        list = orders.filter((o) => o.status === "finalizado");
        break;
      case "canceladas":
        list = orders.filter((o) => o.status === "cancelado");
        break;
      case "agendadas":
        list = orders
          .filter(
            (o) =>
              !!o.delivery_date &&
              (IN_PROGRESS_STATUSES as readonly string[]).includes(o.status),
          )
          .sort((a, b) => {
            const aKey = `${a.delivery_date}T${a.delivery_time || "00:00"}`;
            const bKey = `${b.delivery_date}T${b.delivery_time || "00:00"}`;
            return aKey.localeCompare(bKey);
          });
        break;
    }

    if (!search.trim()) return list;
    const term = search.toLowerCase();
    return list.filter(
      (o) =>
        o.customer_name.toLowerCase().includes(term) ||
        o.customer_email.toLowerCase().includes(term) ||
        o.id.toLowerCase().includes(term),
    );
  }, [orders, tab, search]);

  const counts = useMemo(
    () => ({
      andamento: orders.filter((o) =>
        (IN_PROGRESS_STATUSES as readonly string[]).includes(o.status),
      ).length,
      agendadas: orders.filter(
        (o) =>
          !!o.delivery_date &&
          (IN_PROGRESS_STATUSES as readonly string[]).includes(o.status),
      ).length,
      finalizadas: orders.filter((o) => o.status === "finalizado").length,
      canceladas: orders.filter((o) => o.status === "cancelado").length,
    }),
    [orders],
  );

  const tabs: { id: Tab; label: string }[] = [
    { id: "andamento", label: "Em andamento" },
    { id: "agendadas", label: "Agendadas" },
    { id: "finalizadas", label: "Finalizadas" },
    { id: "canceladas", label: "Canceladas" },
  ];

  return (
    <div>
      <div className="mb-[22px] flex items-center justify-between">
        <div>
          <h1 className="font-serif text-[26px] text-marrom-900">Vendas</h1>
          <p className="mt-1 text-[13.5px] text-marrom-500">
            {orders.length} pedidos no total
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex w-[260px] items-center gap-2 rounded-full border border-[#f1e4e0] bg-white px-4 py-2.5">
            <Search className="h-3.5 w-3.5 text-marrom-500" strokeWidth={2} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por cliente, e-mail..."
              className="w-full bg-transparent text-[13px] text-marrom-900 placeholder:text-marrom-400 focus:outline-none"
            />
          </div>
          <button
            onClick={() => setCreateOpen(true)}
            className="flex items-center gap-1.5 whitespace-nowrap rounded-full bg-gradient-to-br from-rosa-800 to-rosa-700 px-5 py-2.5 text-[12.5px] font-bold text-white"
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
            Pedido manual
          </button>
        </div>
      </div>

      <div className="mb-[22px] flex gap-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`rounded-full px-[18px] py-2.5 text-[12.5px] font-bold transition-colors ${
              tab === t.id
                ? "bg-rosa-800 text-white"
                : "border border-[#f1e4e0] bg-white text-marrom-700"
            }`}
          >
            {t.label} · {counts[t.id]}
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl bg-white p-10 text-center text-marrom-500 shadow-sm">
          Carregando pedidos...
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl bg-white p-10 text-center text-marrom-500 shadow-sm">
          Nenhum pedido encontrado{search ? " para essa busca" : " nesta aba"}.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((order) => (
            <button
              key={order.id}
              onClick={() => router.push(`/admin/vendas/${order.id}`)}
              className="flex w-full items-center gap-4 rounded-2xl bg-white px-5 py-[18px] text-left shadow-[0_8px_22px_-16px_rgba(62,39,35,0.15)] hover:shadow-[0_8px_22px_-10px_rgba(62,39,35,0.25)]"
            >
              <span className="w-[90px] shrink-0 font-mono text-xs text-marrom-500">
                #{order.id.slice(0, 8)}
              </span>
              <div className="w-[190px] shrink-0">
                <span className="block text-[13.5px] font-bold text-marrom-900">
                  {order.customer_name}
                </span>
                <span className="text-[11.5px] text-marrom-500">
                  {order.customer_email}
                </span>
              </div>
              <span className="w-[130px] shrink-0 text-[12.5px] text-marrom-500">
                {order.items?.length || 0} item(ns)
              </span>
              <span className="flex-1 truncate text-[12.5px] text-marrom-500">
                {order.items?.map((i) => i.product_name).join(", ") || "—"}
              </span>
              {tab === "agendadas" && order.delivery_date && (
                <span className="w-[130px] shrink-0 text-[12px] font-semibold text-[#c2650a]">
                  {order.delivery_type === "entrega" ? "Entrega" : "Retirada"}{" "}
                  {new Date(`${order.delivery_date}T00:00`).toLocaleDateString("pt-BR")}
                  {order.delivery_time ? ` · ${order.delivery_time}` : ""}
                </span>
              )}
              <span className="w-[90px] shrink-0 text-[13.5px] font-bold text-marrom-900">
                {formatCurrency(order.total_price)}
              </span>
              <span className="w-[150px] shrink-0">
                <StatusBadge status={order.status} />
              </span>
              <span className="w-[60px] shrink-0 text-right text-[11px] text-marrom-400">
                {timeAgo(order.created_at)}
              </span>
            </button>
          ))}
        </div>
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Novo pedido manual</DialogTitle>
          </DialogHeader>
          <CreateOrderForm />
        </DialogContent>
      </Dialog>
    </div>
  );
}
