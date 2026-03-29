import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { Product, UpdateProductInput, ApiResponse } from "@/types/api";

interface ParamsProps {
  params: Promise<{
    id: string;
  }>;
}

// PATCH /api/products/[id] - atualizar produto
export async function PATCH(request: NextRequest, { params }: ParamsProps) {
  try {
    const { id } = await params;
    const body: UpdateProductInput = await request.json();

    // Validar se o ID é válido
    if (!id || isNaN(Number(id))) {
      const response: ApiResponse<null> = {
        success: false,
        error: "ID inválido",
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Construir a query dinamicamente baseada nos campos fornecidos
    const fields: string[] = [];
    const values: any[] = [];
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

    if (fields.length === 0) {
      const response: ApiResponse<null> = {
        success: false,
        error: "Nenhum campo fornecido para atualização",
      };
      return NextResponse.json(response, { status: 400 });
    }

    fields.push(`updated_at = $${paramIndex}`);
    values.push(new Date());
    values.push(Number(id));

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

// DELETE /api/products/[id] - deletar produto
export async function DELETE(request: NextRequest, { params }: ParamsProps) {
  try {
    const { id } = await params;

    // Validar se o ID é válido
    if (!id || isNaN(Number(id))) {
      const response: ApiResponse<null> = {
        success: false,
        error: "ID inválido",
      };
      return NextResponse.json(response, { status: 400 });
    }

    const sql = "SELECT * FROM products WHERE id = $1";
    const selectResult = await query(sql, [Number(id)]);

    if (selectResult.rows.length === 0) {
      const response: ApiResponse<null> = {
        success: false,
        error: "Produto não encontrado",
      };
      return NextResponse.json(response, { status: 404 });
    }

    const deleteSql = "DELETE FROM products WHERE id = $1";
    await query(deleteSql, [Number(id)]);

    const response: ApiResponse<{ id: number }> = {
      success: true,
      data: { id: Number(id) },
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
