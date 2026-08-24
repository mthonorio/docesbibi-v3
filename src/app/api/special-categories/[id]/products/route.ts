import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { query } from "@/lib/db";
import { isValidUUID } from "@/lib/validation";
import { requireStaff } from "@/lib/auth-guards";
import type { Product, ApiResponse } from "@/types/api";

interface RouteParams {
  params: Promise<{ id: string }>;
}

const BodySchema = z.object({
  product_ids: z.array(z.string().uuid()).min(1, "Selecione ao menos um produto"),
});

// POST /api/special-categories/:id/products - Vincula produtos ao evento em
// lote (só gestora). Um produto só pertence a um evento por vez — vincular
// aqui sobrescreve o vínculo anterior, se houver (mesmo modelo N:1 de
// products.category, sem tabela de junção).
export async function POST(request: NextRequest, { params }: RouteParams) {
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

    const categoryExists = await query(`SELECT id FROM special_categories WHERE id = $1`, [id]);
    if (categoryExists.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: "Evento não encontrado" },
        { status: 404 },
      );
    }

    const body = await request.json();
    const { product_ids } = BodySchema.parse(body);

    const result = await query(
      `UPDATE products SET special_category_id = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = ANY($2::uuid[])
       RETURNING *`,
      [id, product_ids],
    );

    const response: ApiResponse<Product[]> = {
      success: true,
      data: result.rows,
    };
    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.issues[0]?.message || "Dados inválidos" },
        { status: 400 },
      );
    }
    console.error("POST /api/special-categories/:id/products error:", error);
    const response: ApiResponse<null> = {
      success: false,
      error: error instanceof Error ? error.message : "Erro ao vincular produtos",
    };
    return NextResponse.json(response, { status: 500 });
  }
}
