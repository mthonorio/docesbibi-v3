import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { isValidUUID } from "@/lib/validation";
import { requireStaff } from "@/lib/auth-guards";
import type { ApiResponse } from "@/types/api";

interface RouteParams {
  params: Promise<{ id: string; productId: string }>;
}

// DELETE /api/special-categories/:id/products/:productId - Remove o vínculo
// (não apaga o produto — ele volta a ser um produto comum, respeitando só
// o próprio `active`). Escopado: só desvincula se o produto realmente
// pertence a esse evento, pra não desvincular por engano de outro.
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const guard = await requireStaff();
  if (!guard.ok) return guard.response;

  try {
    const { id, productId } = await params;
    if (!isValidUUID(id) || !isValidUUID(productId)) {
      return NextResponse.json(
        { success: false, error: "ID inválido" },
        { status: 400 },
      );
    }

    const result = await query(
      `UPDATE products SET special_category_id = NULL, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND special_category_id = $2
       RETURNING id`,
      [productId, id],
    );

    if (result.rows.length === 0) {
      const response: ApiResponse<null> = {
        success: false,
        error: "Produto não está vinculado a este evento",
      };
      return NextResponse.json(response, { status: 404 });
    }

    const response: ApiResponse<{ id: string }> = {
      success: true,
      data: { id: productId },
    };
    return NextResponse.json(response);
  } catch (error) {
    console.error("DELETE /api/special-categories/:id/products/:productId error:", error);
    const response: ApiResponse<null> = {
      success: false,
      error: error instanceof Error ? error.message : "Erro ao remover produto do evento",
    };
    return NextResponse.json(response, { status: 500 });
  }
}
