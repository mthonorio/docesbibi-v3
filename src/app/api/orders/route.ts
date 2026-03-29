import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import type { Order, CreateOrderInput, ApiResponse } from "@/types/api";

// GET /api/orders - Listar todos os pedidos com filtro opcional
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const email = searchParams.get("email");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    let sql = "SELECT * FROM orders WHERE 1=1";
    const params: any[] = [];
    let paramIndex = 1;

    if (status) {
      sql += ` AND status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (email) {
      sql += ` AND customer_email ILIKE $${paramIndex}`;
      params.push(`%${email}%`);
      paramIndex++;
    }

    sql += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await query(sql, params);

    // Buscar itens para cada pedido
    const ordersWithItems: Order[] = await Promise.all(
      result.rows.map(async (order) => {
        const itemsResult = await query(
          `SELECT * FROM order_items WHERE order_id = $1 ORDER BY created_at ASC`,
          [order.id],
        );
        return {
          ...order,
          items: itemsResult.rows,
        };
      }),
    );

    const response: ApiResponse<Order[]> = {
      success: true,
      data: ordersWithItems,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("GET /api/orders error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Erro ao buscar pedidos",
      },
      { status: 500 },
    );
  }
}

// POST /api/orders - Criar novo pedido
export async function POST(request: NextRequest) {
  try {
    const body: CreateOrderInput = await request.json();

    // Validação
    if (!body.customer_name || !body.customer_email || !body.customer_address) {
      return NextResponse.json(
        {
          success: false,
          error:
            "customer_name, customer_email e customer_address são obrigatórios",
        },
        { status: 400 },
      );
    }

    if (!body.items || body.items.length === 0) {
      return NextResponse.json(
        { success: false, error: "Pedido deve conter pelo menos um item" },
        { status: 400 },
      );
    }

    // Criar pedido
    const orderResult = await query(
      `INSERT INTO orders (customer_name, customer_email, customer_phone, customer_address, notes, status)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        body.customer_name,
        body.customer_email,
        body.customer_phone || null,
        body.customer_address,
        body.notes || null,
        "pendente",
      ],
    );

    const orderId = orderResult.rows[0].id;

    // Adicionar itens do pedido
    for (const item of body.items) {
      // Buscar produto para obter nome e preço
      const productResult = await query(
        `SELECT id, name, price FROM products WHERE id = $1`,
        [item.product_id],
      );

      if (productResult.rows.length === 0) {
        throw new Error(`Produto com ID ${item.product_id} não encontrado`);
      }

      const product = productResult.rows[0];
      const subtotal = product.price * item.quantity;

      await query(
        `INSERT INTO order_items (order_id, product_id, product_name, price, quantity, subtotal)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          orderId,
          product.id,
          product.name,
          product.price,
          item.quantity,
          subtotal,
        ],
      );
    }

    // Buscar pedido completo com itens
    const completedOrder = await query(`SELECT * FROM orders WHERE id = $1`, [
      orderId,
    ]);

    const itemsResult = await query(
      `SELECT * FROM order_items WHERE order_id = $1`,
      [orderId],
    );

    const response: ApiResponse<Order> = {
      success: true,
      data: {
        ...completedOrder.rows[0],
        items: itemsResult.rows,
      },
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error("POST /api/orders error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Erro ao criar pedido",
      },
      { status: 500 },
    );
  }
}
