import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import type { ApiResponse } from "@/types/api";

function unauthorized(message: string) {
  const body: ApiResponse<null> = { success: false, error: message };
  return NextResponse.json(body, { status: 401 });
}

/**
 * Gate para rotas de API só a gestora pode chamar (listar/editar/apagar
 * pedidos, criar/editar/apagar produtos). O proxy (src/proxy.ts) só protege
 * NAVEGAÇÃO DE PÁGINA — chamadas diretas a /api/* nunca passavam por ele,
 * então essas rotas precisam checar a sessão elas mesmas.
 */
export async function requireStaff(): Promise<
  { ok: true } | { ok: false; response: NextResponse }
> {
  const session = await auth();
  if (!session || session.user.role !== "staff") {
    return { ok: false, response: unauthorized("Não autorizado") };
  }
  return { ok: true };
}

/**
 * Gate para rotas que só o próprio comprador logado pode chamar (ex.:
 * GET /api/orders/mine). Devolve o customerId já resolvido pra evitar
 * repetir `session.user.id` em cada rota.
 */
export async function requireCustomer(): Promise<
  { ok: true; customerId: string } | { ok: false; response: NextResponse }
> {
  const session = await auth();
  if (!session || session.user.role !== "customer") {
    return { ok: false, response: unauthorized("Não autorizado") };
  }
  return { ok: true, customerId: session.user.id };
}
