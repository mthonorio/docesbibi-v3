"use client";

import { useState, useEffect } from "react";
import type { ApiResponse } from "@/types/api";

export interface EasterProduct {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
}

export function useEasterProducts() {
  const [products, setProducts] = useState<EasterProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEasterProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch("/api/products?category=easter");
        const result: ApiResponse<EasterProduct[]> = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.error || "Erro ao buscar produtos");
        }

        const sorted = [...(result.data || [])].sort(
          (a, b) => a.price - b.price,
        );
        setProducts(sorted);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Erro ao buscar produtos";
        setError(message);
        console.error("[useEasterProducts] Erro:", message);
      } finally {
        setLoading(false);
      }
    };

    fetchEasterProducts();
  }, []);

  return { products, loading, error };
}
