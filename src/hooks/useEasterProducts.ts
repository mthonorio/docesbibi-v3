"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

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

        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
        );

        const { data, error: supabaseError } = await supabase
          .from("products")
          .select("id, name, price, image, description")
          .eq("category", "easter")
          .order("price", { ascending: true });

        if (supabaseError) {
          throw new Error(`Erro ao buscar produtos: ${supabaseError.message}`);
        }

        setProducts(data || []);
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
