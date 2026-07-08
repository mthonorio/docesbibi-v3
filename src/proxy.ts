import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { addCorsHeaders, corsOptionsResponse } from "@/lib/cors";

// Rotas que só a gestora (staff) pode ver. Hoje só /orders — que hoje age
// como um mini-admin. Quando o painel /admin (Fase 3) existir, ele entra aqui.
const PROTECTED_PATHS = ["/orders"];

export async function proxy(request: NextRequest) {
  const origin = request.headers.get("origin");

  if (request.method === "OPTIONS") {
    return corsOptionsResponse(origin);
  }

  if (request.nextUrl.pathname.startsWith("/api/")) {
    return addCorsHeaders(NextResponse.next(), origin);
  }

  const isProtected = PROTECTED_PATHS.some(
    (path) => request.nextUrl.pathname === path || request.nextUrl.pathname.startsWith(`${path}/`),
  );

  if (!isProtected) {
    return NextResponse.next();
  }

  // Renova a sessão do Supabase (padrão recomendado para App Router) e
  // decide se a requisição pode seguir para a rota protegida.
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("redirectTo", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
