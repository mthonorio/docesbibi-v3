"use client";

import { useState, useEffect } from "react";
import type { ApiResponse } from "@/types/api";

/**
 * Busca produtos via /api/products (rota `pg`-backed, ver src/lib/db.ts).
 * Substitui o antigo `useSupabaseData` — não há mais leitura direto do
 * client contra um provedor externo, tudo passa pela API do próprio app.
 */
export function useProducts<T>(category?: string) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const url = category
          ? `/api/products?category=${encodeURIComponent(category)}`
          : "/api/products";
        const response = await fetch(url);
        const result: ApiResponse<T[]> = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.error || "Erro ao carregar produtos");
        }

        setData(result.data || []);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao carregar dados");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [category]);

  return { data, loading, error };
}
