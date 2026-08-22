import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { addCorsHeaders, corsOptionsResponse } from "@/lib/cors";

// Rotas que só a gestora (staff) pode ver. Hoje só /orders — que hoje age
// como um mini-admin. Quando o painel /admin (Fase 3) existir, ele entra aqui.
const PROTECTED_PATHS = ["/orders"];

// `auth()` do NextAuth envolve o handler e injeta `request.auth` (sessão
// decodificada do cookie JWT — não bate no banco aqui, só verifica a
// assinatura, por isso funciona no runtime Edge do Proxy).
export const proxy = auth((request) => {
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

  if (!request.auth) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("redirectTo", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
