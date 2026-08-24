import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { query } from "@/lib/db";
import { isValidUUID } from "@/lib/validation";
import { requireStaff } from "@/lib/auth-guards";
import type {
  SpecialCategory,
  Product,
  UpdateSpecialCategoryInput,
  ApiResponse,
} from "@/types/api";

interface RouteParams {
  params: Promise<{ id: string }>;
}

const SLUG_REGEX = /^[a-z0-9]+(-[a-z0-9]+)*$/;

const UpdateSchema = z.object({
  name: z.string().trim().min(1).optional(),
  slug: z.string().trim().toLowerCase().regex(SLUG_REGEX).optional(),
  description: z.string().trim().optional(),
  image: z.string().trim().optional(),
  enabled: z.boolean().optional(),
  start_date: z.string().nullable().optional(),
  end_date: z.string().nullable().optional(),
});

// GET /api/special-categories/:id - Evento + produtos vinculados (pra
// seção "Produtos do evento" em /admin/eventos/:id). Só gestora.
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

    const categoryResult = await query(
      `SELECT * FROM special_categories WHERE id = $1`,
      [id],
    );
    if (categoryResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: "Evento não encontrado" },
        { status: 404 },
      );
    }

    const productsResult = await query(
      `SELECT * FROM products WHERE special_category_id = $1 ORDER BY created_at DESC`,
      [id],
    );

    const response: ApiResponse<{ category: SpecialCategory; products: Product[] }> = {
      success: true,
      data: {
        category: categoryResult.rows[0],
        products: productsResult.rows,
      },
    };
    return NextResponse.json(response);
  } catch (error) {
    console.error("GET /api/special-categories/:id error:", error);
    const response: ApiResponse<null> = {
      success: false,
      error: error instanceof Error ? error.message : "Erro ao buscar evento",
    };
    return NextResponse.json(response, { status: 500 });
  }
}

// PATCH /api/special-categories/:id - Update parcial (só gestora), incluindo
// o toggle rápido de `enabled` — mesmo padrão de PATCH /api/orders/:id e
// PATCH /api/products/:id, sem rota /status separada.
export async function PATCH(request: NextRequest, { params }: RouteParams) {
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

    const body: UpdateSpecialCategoryInput = await request.json();
    const data = UpdateSchema.parse(body);

    if (data.slug) {
      const slugConflict = await query(
        `SELECT id FROM special_categories WHERE slug = $1 AND id != $2`,
        [data.slug, id],
      );
      if (slugConflict.rows.length > 0) {
        return NextResponse.json(
          { success: false, error: "Já existe um evento com esse slug" },
          { status: 409 },
        );
      }
    }

    const fields: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    for (const [key, value] of Object.entries(data)) {
      if (value === undefined) continue;
      fields.push(`${key} = $${paramIndex}`);
      values.push(value);
      paramIndex++;
    }

    if (fields.length === 0) {
      return NextResponse.json(
        { success: false, error: "Nenhum campo fornecido para atualização" },
        { status: 400 },
      );
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const result = await query(
      `UPDATE special_categories SET ${fields.join(", ")} WHERE id = $${paramIndex} RETURNING *`,
      values,
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: "Evento não encontrado" },
        { status: 404 },
      );
    }

    const response: ApiResponse<SpecialCategory> = {
      success: true,
      data: result.rows[0],
    };
    return NextResponse.json(response);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.issues[0]?.message || "Dados inválidos" },
        { status: 400 },
      );
    }
    console.error("PATCH /api/special-categories/:id error:", error);
    const response: ApiResponse<null> = {
      success: false,
      error: error instanceof Error ? error.message : "Erro ao atualizar evento",
    };
    return NextResponse.json(response, { status: 500 });
  }
}

// DELETE /api/special-categories/:id - Só gestora. Bloqueia (409) enquanto
// houver produtos vinculados — nunca apaga produto junto com o evento (a
// gestora precisa desvincular primeiro, ver DELETE .../products/:productId).
export async function DELETE(request: NextRequest, { params }: RouteParams) {
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

    const exists = await query(`SELECT id FROM special_categories WHERE id = $1`, [id]);
    if (exists.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: "Evento não encontrado" },
        { status: 404 },
      );
    }

    const linkedProducts = await query(
      `SELECT COUNT(*) FROM products WHERE special_category_id = $1`,
      [id],
    );
    const productCount = Number(linkedProducts.rows[0].count);
    if (productCount > 0) {
      const response: ApiResponse<null> = {
        success: false,
        error: `Não é possível excluir: ${productCount} produto(s) ainda vinculado(s) a este evento. Remova os produtos do evento antes de excluir.`,
      };
      return NextResponse.json(response, { status: 409 });
    }

    await query(`DELETE FROM special_categories WHERE id = $1`, [id]);

    const response: ApiResponse<{ id: string }> = {
      success: true,
      data: { id },
    };
    return NextResponse.json(response);
  } catch (error) {
    console.error("DELETE /api/special-categories/:id error:", error);
    const response: ApiResponse<null> = {
      success: false,
      error: error instanceof Error ? error.message : "Erro ao excluir evento",
    };
    return NextResponse.json(response, { status: 500 });
  }
}
