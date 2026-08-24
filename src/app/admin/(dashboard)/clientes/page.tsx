"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Users } from "lucide-react";
import { formatCurrency } from "@/functions/currency";
import type { CustomerSummary, ApiResponse } from "@/types/api";

export default function ClientesPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<CustomerSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/customers");
        const result: ApiResponse<CustomerSummary[]> = await response.json();
        if (!response.ok || !result.success) {
          throw new Error(result.error || "Erro ao buscar clientes");
        }
        setCustomers(result.data || []);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao buscar clientes");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return customers;
    const term = search.toLowerCase();
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(term) || c.email.toLowerCase().includes(term),
    );
  }, [customers, search]);

  return (
    <div>
      <div className="mb-[22px] flex items-center justify-between">
        <div>
          <h1 className="font-serif text-[26px] text-marrom-900">Clientes</h1>
          <p className="mt-1 text-[13.5px] text-marrom-500">
            {customers.length} conta(s) cadastrada(s)
          </p>
        </div>
        <div className="flex w-[280px] items-center gap-2 rounded-full border border-[#f1e4e0] bg-white px-4 py-2.5">
          <Search className="h-3.5 w-3.5 text-marrom-500" strokeWidth={2} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome ou e-mail..."
            className="w-full bg-transparent text-[13px] text-marrom-900 placeholder:text-marrom-400 focus:outline-none"
          />
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl bg-white p-10 text-center text-marrom-500 shadow-sm">
          Carregando clientes...
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl bg-white p-10 text-center text-marrom-500 shadow-sm">
          {customers.length === 0 ? (
            <>
              <Users className="mx-auto mb-3 h-8 w-8 text-rosa-300" strokeWidth={1.5} />
              Nenhum cliente cadastrou conta ainda.
            </>
          ) : (
            "Nenhum cliente encontrado para essa busca."
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl bg-white shadow-[0_8px_22px_-16px_rgba(62,39,35,0.15)]">
          <div className="flex items-center gap-4 border-b border-[#f1e4e0] px-5 py-3 text-[11px] font-bold uppercase tracking-wide text-marrom-400">
            <span className="w-[220px] shrink-0">Cliente</span>
            <span className="flex-1">E-mail</span>
            <span className="w-[110px] shrink-0 text-right">Pedidos</span>
            <span className="w-[130px] shrink-0 text-right">Total gasto</span>
            <span className="w-[110px] shrink-0 text-right">Desde</span>
          </div>
          {filtered.map((customer) => (
            <button
              key={customer.id}
              onClick={() => router.push(`/admin/clientes/${customer.id}`)}
              className="flex w-full items-center gap-4 border-b border-[#f1e4e0] px-5 py-[15px] text-left last:border-b-0 hover:bg-rosa-50"
            >
              <div className="w-[220px] shrink-0">
                <span className="block text-[13.5px] font-bold text-marrom-900">
                  {customer.name}
                </span>
                {customer.phone && (
                  <span className="text-[11.5px] text-marrom-500">{customer.phone}</span>
                )}
              </div>
              <span className="flex-1 truncate text-[12.5px] text-marrom-500">
                {customer.email}
              </span>
              <span className="w-[110px] shrink-0 text-right text-[13px] font-bold text-marrom-900">
                {customer.order_count}
              </span>
              <span className="w-[130px] shrink-0 text-right text-[13px] font-bold text-vermelho-700">
                {formatCurrency(customer.total_spent)}
              </span>
              <span className="w-[110px] shrink-0 text-right text-[11.5px] text-marrom-400">
                {new Date(customer.created_at).toLocaleDateString("pt-BR")}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
