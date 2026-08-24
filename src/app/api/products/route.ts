import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireStaff } from "@/lib/auth-guards";
import {
  PUBLIC_PRODUCT_JOIN_SQL,
  PUBLIC_PRODUCT_VISIBILITY_SQL,
} from "@/lib/products-visibility";
import { Product, CreateProductInput, ApiResponse } from "@/types/api";

// GET /api/products - listar produtos. Público por natureza (catálogo da
// loja), mas só mostra produtos visíveis por padrão (active=true e, se
// pertencer a um evento sazonal, o evento precisa estar enabled — ver
// src/lib/products-visibility.ts) — `includeInactive=true` (usado só pela
// tela de gestão) pula essa checagem inteira, a gestora precisa ver tudo.
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const includeInactive = searchParams.get("includeInactive") === "true";

    const conditions: string[] = [];
    const params: unknown[] = [];

    if (category && category !== "all") {
      params.push(category);
      conditions.push(`p.category = $${params.length}`);
    }

    if (!includeInactive) {
      conditions.push(PUBLIC_PRODUCT_VISIBILITY_SQL);
    }

    const sql =
      `SELECT p.* FROM products p ${PUBLIC_PRODUCT_JOIN_SQL}` +
      (conditions.length ? ` WHERE ${conditions.join(" AND ")}` : "") +
      ` ORDER BY p.created_at DESC`;

    const result = await query(sql, params);

    const response: ApiResponse<Product[]> = {
      success: true,
      data: result.rows,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("GET /api/products error:", error);
    const response: ApiResponse<null> = {
      success: false,
      error: error instanceof Error ? error.message : "Erro ao buscar produtos",
    };
    return NextResponse.json(response, { status: 500 });
  }
}

// POST /api/products - criar novo produto (só gestora)
export async function POST(request: NextRequest) {
  const guard = await requireStaff();
  if (!guard.ok) return guard.response;

  try {
    const body: CreateProductInput = await request.json();

    // Validar dados obrigatórios
    if (
      !body.name ||
      !body.category ||
      !body.price ||
      !body.image ||
      !body.description
    ) {
      const response: ApiResponse<null> = {
        success: false,
        error: "Todos os campos são obrigatórios",
      };
      return NextResponse.json(response, { status: 400 });
    }

    const sql = `
      INSERT INTO products (name, category, price, image, description, active, stock, special_category_id, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
      RETURNING *
    `;

    const result = await query(sql, [
      body.name,
      body.category,
      body.price,
      body.image,
      body.description,
      body.active ?? true,
      body.stock ?? null,
      body.special_category_id ?? null,
    ]);

    const response: ApiResponse<Product> = {
      success: true,
      data: result.rows[0],
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error("POST /api/products error:", error);
    const response: ApiResponse<null> = {
      success: false,
      error: error instanceof Error ? error.message : "Erro ao criar produto",
    };
    return NextResponse.json(response, { status: 500 });
  }
}
