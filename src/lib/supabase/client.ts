"use client";

import { createBrowserClient } from "@supabase/ssr";

/** Cliente Supabase para uso em Client Components (login, logout). */
export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
  );
}
