import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireCustomer } from "@/lib/auth-guards";
import type { Order, ApiResponse } from "@/types/api";

// GET /api/orders/mine - Pedidos do comprador logado. Substitui a antiga
// busca aberta por e-mail em /pedidos (qualquer um podia consultar pedidos
// de qualquer e-mail) — aqui a posse vem da sessão, não de um parâmetro.
export async function GET() {
  const guard = await requireCustomer();
  if (!guard.ok) return guard.response;

  try {
    const ordersResult = await query(
      `SELECT * FROM orders WHERE customer_id = $1 ORDER BY created_at DESC`,
      [guard.customerId],
    );

    const ordersWithItems: Order[] = await Promise.all(
      ordersResult.rows.map(async (order) => {
        const itemsResult = await query(
          `SELECT * FROM order_items WHERE order_id = $1 ORDER BY created_at ASC`,
          [order.id],
        );
        return { ...order, items: itemsResult.rows };
      }),
    );

    const response: ApiResponse<Order[]> = {
      success: true,
      data: ordersWithItems,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("GET /api/orders/mine error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Erro ao buscar pedidos",
      },
      { status: 500 },
    );
  }
}
