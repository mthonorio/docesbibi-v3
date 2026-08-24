import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { isValidUUID } from "@/lib/validation";
import { requireStaff } from "@/lib/auth-guards";
import type { Customer, Order, ApiResponse } from "@/types/api";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/customers/:id - Dados do cliente + os pedidos dele (sem items —
// a tela de detalhe do cliente lista os pedidos e linka pra
// /admin/vendas/:id, que já mostra os itens). Só gestora.
export async function GET(request: NextRequest, { params }: RouteParams) {
  const guard = await requireStaff();
  if (!guard.ok) return guard.response;

  try {
    const { id } = await params;

    if (!isValidUUID(id)) {
      return NextResponse.json(
        { success: false, error: "ID inválido" },
        { status: 400 },
      );
    }

    const customerResult = await query(
      `SELECT id, name, email, phone, created_at FROM customers WHERE id = $1`,
      [id],
    );

    if (customerResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: "Cliente não encontrado" },
        { status: 404 },
      );
    }

    const ordersResult = await query(
      `SELECT * FROM orders WHERE customer_id = $1 ORDER BY created_at DESC`,
      [id],
    );

    const response: ApiResponse<{ customer: Customer; orders: Order[] }> = {
      success: true,
      data: {
        customer: customerResult.rows[0],
        orders: ordersResult.rows,
      },
    };
    return NextResponse.json(response);
  } catch (error) {
    console.error("GET /api/customers/:id error:", error);
    const response: ApiResponse<null> = {
      success: false,
      error: error instanceof Error ? error.message : "Erro ao buscar cliente",
    };
    return NextResponse.json(response, { status: 500 });
  }
}
