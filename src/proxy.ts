import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { addCorsHeaders, corsOptionsResponse } from "@/lib/cors";

// Rotas que só a gestora (staff) pode ver. Note que "/admin/login" NÃO
// entra aqui de propósito — protegê-la criaria um loop de redirect
// (deslogado → /admin/login → "protegido, redireciona pra /admin/login"…).
const STAFF_PATHS = [
  "/admin/dashboard",
  "/admin/vendas",
  "/admin/produtos",
  "/admin/eventos",
  "/admin/clientes",
];

// Rotas que só o comprador logado pode ver (mesma lógica: "/entrar" e
// "/cadastro" ficam de fora pra não criar loop de redirect).
const CUSTOMER_PATHS = ["/pedidos"];

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

  const matchesPath = (paths: string[]) =>
    paths.some(
      (path) => request.nextUrl.pathname === path || request.nextUrl.pathname.startsWith(`${path}/`),
    );

  if (matchesPath(STAFF_PATHS)) {
    if (!request.auth || request.auth.user.role !== "staff") {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("redirectTo", request.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  if (matchesPath(CUSTOMER_PATHS)) {
    if (!request.auth || request.auth.user.role !== "customer") {
      const loginUrl = new URL("/entrar", request.url);
      loginUrl.searchParams.set("redirectTo", request.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
