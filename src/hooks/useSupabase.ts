"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase-client";

/**
 * Exemplo de Hook para usar Supabase
 *
 * Uso:
 * const { data, loading, error } = useSupabaseData('products');
 */
export function useSupabaseData<T>(table: string) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const { data: result, error: err } = await supabase
          .from(table)
          .select("*");

        if (err) throw err;
        setData(result || []);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao carregar dados");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [table]);

  return { data, loading, error };
}

/**
 * Exemplo de Hook para autenticação Supabase
 */
export function useSupabaseAuth() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const {
          data: { user },
          error: err,
        } = await supabase.auth.getUser();
        if (err) throw err;
        setUser(user);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro de autenticação");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // Subscribe to auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription?.unsubscribe();
  }, []);

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) setError(error.message);
  };

  return { user, loading, error, signOut };
}

/**
 * Exemplo de Hook para Realtime (listen to changes)
 */
export function useSupabaseRealtime<T>(
  table: string,
  event: "INSERT" | "UPDATE" | "DELETE" | "*" = "*",
) {
  const [data, setData] = useState<T[]>([]);

  useEffect(() => {
    const subscription = supabase
      .channel(`public:${table}`)
      .on(
        "postgres_changes",
        {
          event,
          schema: "public",
          table,
        },
        (payload: any) => {
          console.log("Realtime update:", payload);
          if (payload.eventType === "INSERT") {
            setData((prev) => [...prev, payload.new]);
          } else if (payload.eventType === "UPDATE") {
            setData((prev) =>
              prev.map((item: any) =>
                item.id === payload.new.id ? payload.new : item,
              ),
            );
          } else if (payload.eventType === "DELETE") {
            setData((prev) =>
              prev.filter((item: any) => item.id !== payload.old.id),
            );
          }
        },
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [table, event]);

  return data;
}
