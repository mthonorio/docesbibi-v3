import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireStaff } from "@/lib/auth-guards";
import type { CustomerSummary, ApiResponse } from "@/types/api";

// GET /api/customers - Lista clientes (contas de comprador) com estatísticas
// de pedidos, pra tela de gestão em /admin/clientes. Só gestora — mesma PII
// (e-mail, telefone) que já é protegida em GET /api/orders.
export async function GET() {
  const guard = await requireStaff();
  if (!guard.ok) return guard.response;

  try {
    const result = await query(`
      SELECT
        c.id,
        c.name,
        c.email,
        c.phone,
        c.created_at,
        COUNT(o.id) AS order_count,
        COALESCE(SUM(CASE WHEN o.status != 'cancelado' THEN o.total_price ELSE 0 END), 0) AS total_spent,
        MAX(o.created_at) AS last_order_at
      FROM customers c
      LEFT JOIN orders o ON o.customer_id = c.id
      GROUP BY c.id
      ORDER BY c.created_at DESC
    `);

    const customers: CustomerSummary[] = result.rows.map((row) => ({
      id: row.id,
      name: row.name,
      email: row.email,
      phone: row.phone,
      created_at: row.created_at,
      order_count: Number(row.order_count),
      total_spent: Number(row.total_spent),
      last_order_at: row.last_order_at,
    }));

    const response: ApiResponse<CustomerSummary[]> = {
      success: true,
      data: customers,
    };
    return NextResponse.json(response);
  } catch (error) {
    console.error("GET /api/customers error:", error);
    const response: ApiResponse<null> = {
      success: false,
      error: error instanceof Error ? error.message : "Erro ao buscar clientes",
    };
    return NextResponse.json(response, { status: 500 });
  }
}
