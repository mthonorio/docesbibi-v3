import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import type { Order, UpdateOrderInput, ApiResponse } from "@/types/api";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// GET /api/orders/:id - Buscar pedido específico
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: orderId } = await params;

    // Validar UUID
    if (!isValidUUID(orderId)) {
      return NextResponse.json(
        { success: false, error: "ID inválido" },
        { status: 400 },
      );
    }

    const orderResult = await query(`SELECT * FROM orders WHERE id = $1`, [
      orderId,
    ]);

    if (orderResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: "Pedido não encontrado" },
        { status: 404 },
      );
    }

    const itemsResult = await query(
      `SELECT * FROM order_items WHERE order_id = $1 ORDER BY created_at ASC`,
      [orderId],
    );

    const response: ApiResponse<Order> = {
      success: true,
      data: {
        ...orderResult.rows[0],
        items: itemsResult.rows,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("GET /api/orders/:id error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Erro ao buscar pedido",
      },
      { status: 500 },
    );
  }
}

// PATCH /api/orders/:id - Atualizar pedido
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: orderId } = await params;
    const body: UpdateOrderInput = await request.json();

    // Validar UUID
    if (!isValidUUID(orderId)) {
      return NextResponse.json(
        { success: false, error: "ID inválido" },
        { status: 400 },
      );
    }

    // Verificar se pedido existe
    const orderExists = await query(`SELECT id FROM orders WHERE id = $1`, [
      orderId,
    ]);

    if (orderExists.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: "Pedido não encontrado" },
        { status: 404 },
      );
    }

    // Construir query dinamicamente
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (body.status) {
      fields.push(`status = $${paramIndex}`);
      values.push(body.status);
      paramIndex++;
    }

    if (body.customer_name !== undefined) {
      fields.push(`customer_name = $${paramIndex}`);
      values.push(body.customer_name);
      paramIndex++;
    }

    if (body.customer_email !== undefined) {
      fields.push(`customer_email = $${paramIndex}`);
      values.push(body.customer_email);
      paramIndex++;
    }

    if (body.customer_phone !== undefined) {
      fields.push(`customer_phone = $${paramIndex}`);
      values.push(body.customer_phone);
      paramIndex++;
    }

    if (body.customer_address !== undefined) {
      fields.push(`customer_address = $${paramIndex}`);
      values.push(body.customer_address);
      paramIndex++;
    }

    if (body.notes !== undefined) {
      fields.push(`notes = $${paramIndex}`);
      values.push(body.notes);
      paramIndex++;
    }

    if (fields.length === 0) {
      return NextResponse.json(
        { success: false, error: "Nenhum campo fornecido para atualização" },
        { status: 400 },
      );
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(orderId);

    const sql = `UPDATE orders SET ${fields.join(", ")} WHERE id = $${paramIndex} RETURNING *`;

    const result = await query(sql, values);

    // Buscar itens
    const itemsResult = await query(
      `SELECT * FROM order_items WHERE order_id = $1`,
      [orderId],
    );

    const response: ApiResponse<Order> = {
      success: true,
      data: {
        ...result.rows[0],
        items: itemsResult.rows,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("PATCH /api/orders/:id error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Erro ao atualizar pedido",
      },
      { status: 500 },
    );
  }
}

// DELETE /api/orders/:id - Deletar pedido (cascata deleta itens)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: orderId } = await params;

    // Validar UUID
    if (!isValidUUID(orderId)) {
      return NextResponse.json(
        { success: false, error: "ID inválido" },
        { status: 400 },
      );
    }

    // Verificar se pedido existe
    const orderExists = await query(`SELECT id FROM orders WHERE id = $1`, [
      orderId,
    ]);

    if (orderExists.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: "Pedido não encontrado" },
        { status: 404 },
      );
    }

    // Deletar pedido (cascata deleta order_items)
    await query(`DELETE FROM orders WHERE id = $1`, [orderId]);

    const response: ApiResponse<{ id: string }> = {
      success: true,
      data: { id: orderId },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("DELETE /api/orders/:id error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Erro ao deletar pedido",
      },
      { status: 500 },
    );
  }
}

// Função helper para validar UUID
function isValidUUID(uuid: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}
