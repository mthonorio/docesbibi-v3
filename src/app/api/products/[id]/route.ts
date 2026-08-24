import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { isValidUUID } from "@/lib/validation";
import { requireStaff } from "@/lib/auth-guards";
import {
  PUBLIC_PRODUCT_JOIN_SQL,
  PUBLIC_PRODUCT_VISIBILITY_SQL,
} from "@/lib/products-visibility";
import { Product, UpdateProductInput, ApiResponse } from "@/types/api";

interface ParamsProps {
  params: Promise<{
    id: string;
  }>;
}

// GET /api/products/[id] - buscar um produto. Público (usado pela página de
// detalhe da loja) — respeita a mesma regra de visibilidade de
// GET /api/products: um produto de evento desativado responde 404 igual a
// um produto inexistente, mesmo em acesso direto pela URL (SPEC de
// Categorias Especiais, seção 7 — nunca confiar só no frontend pra esconder).
export async function GET(request: NextRequest, { params }: ParamsProps) {
  try {
    const { id } = await params;

    if (!isValidUUID(id)) {
      const response: ApiResponse<null> = {
        success: false,
        error: "ID inválido",
      };
      return NextResponse.json(response, { status: 400 });
    }

    const result = await query(
      `SELECT p.* FROM products p ${PUBLIC_PRODUCT_JOIN_SQL} WHERE p.id = $1 AND ${PUBLIC_PRODUCT_VISIBILITY_SQL}`,
      [id],
    );

    if (result.rows.length === 0) {
      const response: ApiResponse<null> = {
        success: false,
        error: "Produto não encontrado",
      };
      return NextResponse.json(response, { status: 404 });
    }

    const response: ApiResponse<Product> = {
      success: true,
      data: result.rows[0],
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("GET /api/products/[id] error:", error);
    const response: ApiResponse<null> = {
      success: false,
      error: error instanceof Error ? error.message : "Erro ao buscar produto",
    };
    return NextResponse.json(response, { status: 500 });
  }
}

// PATCH /api/products/[id] - atualizar produto (só gestora)
export async function PATCH(request: NextRequest, { params }: ParamsProps) {
  const guard = await requireStaff();
  if (!guard.ok) return guard.response;

  try {
    const { id } = await params;
    const body: UpdateProductInput = await request.json();

    if (!isValidUUID(id)) {
      const response: ApiResponse<null> = {
        success: false,
        error: "ID inválido",
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Construir a query dinamicamente baseada nos campos fornecidos
    const fields: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    if (body.name !== undefined) {
      fields.push(`name = $${paramIndex}`);
      values.push(body.name);
      paramIndex++;
    }
    if (body.category !== undefined) {
      fields.push(`category = $${paramIndex}`);
      values.push(body.category);
      paramIndex++;
    }
    if (body.price !== undefined) {
      fields.push(`price = $${paramIndex}`);
      values.push(body.price);
      paramIndex++;
    }
    if (body.image !== undefined) {
      fields.push(`image = $${paramIndex}`);
      values.push(body.image);
      paramIndex++;
    }
    if (body.description !== undefined) {
      fields.push(`description = $${paramIndex}`);
      values.push(body.description);
      paramIndex++;
    }
    if (body.active !== undefined) {
      fields.push(`active = $${paramIndex}`);
      values.push(body.active);
      paramIndex++;
    }
    if (body.stock !== undefined) {
      fields.push(`stock = $${paramIndex}`);
      values.push(body.stock);
      paramIndex++;
    }
    if (body.special_category_id !== undefined) {
      fields.push(`special_category_id = $${paramIndex}`);
      values.push(body.special_category_id);
      paramIndex++;
    }

    if (fields.length === 0) {
      const response: ApiResponse<null> = {
        success: false,
        error: "Nenhum campo fornecido para atualização",
      };
      return NextResponse.json(response, { status: 400 });
    }

    fields.push(`updated_at = $${paramIndex}`);
    values.push(new Date());
    values.push(id);

    const sql = `
      UPDATE products
      SET ${fields.join(", ")}
      WHERE id = $${paramIndex + 1}
      RETURNING *
    `;

    const result = await query(sql, values);

    if (result.rows.length === 0) {
      const response: ApiResponse<null> = {
        success: false,
        error: "Produto não encontrado",
      };
      return NextResponse.json(response, { status: 404 });
    }

    const response: ApiResponse<Product> = {
      success: true,
      data: result.rows[0],
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("PATCH /api/products/[id] error:", error);
    const response: ApiResponse<null> = {
      success: false,
      error:
        error instanceof Error ? error.message : "Erro ao atualizar produto",
    };
    return NextResponse.json(response, { status: 500 });
  }
}

// DELETE /api/products/[id] - deletar produto (só gestora)
export async function DELETE(request: NextRequest, { params }: ParamsProps) {
  const guard = await requireStaff();
  if (!guard.ok) return guard.response;

  try {
    const { id } = await params;

    if (!isValidUUID(id)) {
      const response: ApiResponse<null> = {
        success: false,
        error: "ID inválido",
      };
      return NextResponse.json(response, { status: 400 });
    }

    const selectResult = await query("SELECT id FROM products WHERE id = $1", [
      id,
    ]);

    if (selectResult.rows.length === 0) {
      const response: ApiResponse<null> = {
        success: false,
        error: "Produto não encontrado",
      };
      return NextResponse.json(response, { status: 404 });
    }

    await query("DELETE FROM products WHERE id = $1", [id]);

    const response: ApiResponse<{ id: string }> = {
      success: true,
      data: { id },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("DELETE /api/products/[id] error:", error);
    const response: ApiResponse<null> = {
      success: false,
      error: error instanceof Error ? error.message : "Erro ao deletar produto",
    };
    return NextResponse.json(response, { status: 500 });
  }
}
