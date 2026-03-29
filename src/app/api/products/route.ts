import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { Product, CreateProductInput, ApiResponse } from "@/types/api";

// GET /api/products - listar todos os produtos
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");

    let sql = "SELECT * FROM products ORDER BY created_at DESC";
    const params: any[] = [];

    if (category && category !== "all") {
      sql =
        "SELECT * FROM products WHERE category = $1 ORDER BY created_at DESC";
      params.push(category);
    }

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

// POST /api/products - criar novo produto
export async function POST(request: NextRequest) {
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
      INSERT INTO products (name, category, price, image, description, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
      RETURNING *
    `;

    const result = await query(sql, [
      body.name,
      body.category,
      body.price,
      body.image,
      body.description,
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
