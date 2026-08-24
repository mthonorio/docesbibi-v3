import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { query } from "@/lib/db";
import { requireStaff } from "@/lib/auth-guards";
import type {
  SpecialCategorySummary,
  CreateSpecialCategoryInput,
  ApiResponse,
} from "@/types/api";

const SLUG_REGEX = /^[a-z0-9]+(-[a-z0-9]+)*$/;

const CreateSchema = z.object({
  name: z.string().trim().min(1, "Nome é obrigatório"),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(SLUG_REGEX, "Slug deve conter apenas letras minúsculas, números e hífens"),
  description: z.string().trim().optional(),
  image: z.string().trim().optional(),
  enabled: z.boolean().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
});

// GET /api/special-categories - Lista eventos com contagem de produtos
// vinculados, pra tabela de gestão em /admin/eventos. Só gestora — sem
// endpoint público, a SPEC não pede landing page por evento.
export async function GET() {
  const guard = await requireStaff();
  if (!guard.ok) return guard.response;

  try {
    const result = await query(`
      SELECT
        sc.*,
        COUNT(p.id) AS product_count
      FROM special_categories sc
      LEFT JOIN products p ON p.special_category_id = sc.id
      GROUP BY sc.id
      ORDER BY sc.created_at DESC
    `);

    const categories: SpecialCategorySummary[] = result.rows.map((row) => ({
      ...row,
      product_count: Number(row.product_count),
    }));

    const response: ApiResponse<SpecialCategorySummary[]> = {
      success: true,
      data: categories,
    };
    return NextResponse.json(response);
  } catch (error) {
    console.error("GET /api/special-categories error:", error);
    const response: ApiResponse<null> = {
      success: false,
      error: error instanceof Error ? error.message : "Erro ao buscar eventos",
    };
    return NextResponse.json(response, { status: 500 });
  }
}

// POST /api/special-categories - Cria um evento (só gestora). Nasce
// enabled=false por padrão (ver sql/008_special_categories.sql) — a
// gestora ativa explicitamente quando o evento estiver pronto.
export async function POST(request: NextRequest) {
  const guard = await requireStaff();
  if (!guard.ok) return guard.response;

  try {
    const body: CreateSpecialCategoryInput = await request.json();
    const data = CreateSchema.parse(body);

    const existing = await query(
      `SELECT id FROM special_categories WHERE slug = $1`,
      [data.slug],
    );
    if (existing.rows.length > 0) {
      const response: ApiResponse<null> = {
        success: false,
        error: "Já existe um evento com esse slug",
      };
      return NextResponse.json(response, { status: 409 });
    }

    const result = await query(
      `INSERT INTO special_categories (name, slug, description, image, enabled, start_date, end_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        data.name,
        data.slug,
        data.description || null,
        data.image || null,
        data.enabled ?? false,
        data.start_date || null,
        data.end_date || null,
      ],
    );

    const response: ApiResponse<SpecialCategorySummary> = {
      success: true,
      data: { ...result.rows[0], product_count: 0 },
    };
    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const response: ApiResponse<null> = {
        success: false,
        error: error.issues[0]?.message || "Dados inválidos",
      };
      return NextResponse.json(response, { status: 400 });
    }
    console.error("POST /api/special-categories error:", error);
    const response: ApiResponse<null> = {
      success: false,
      error: error instanceof Error ? error.message : "Erro ao criar evento",
    };
    return NextResponse.json(response, { status: 500 });
  }
}
