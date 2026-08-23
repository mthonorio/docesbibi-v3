import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { query } from "@/lib/db";
import type { ApiResponse } from "@/types/api";

const RegisterSchema = z.object({
  name: z.string().trim().min(1, "Nome é obrigatório"),
  email: z.string().trim().toLowerCase().email("E-mail inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  phone: z.string().trim().optional(),
});

interface NewCustomer {
  id: string;
  email: string;
  name: string;
}

// POST /api/auth/register - Cadastro de comprador. Depois de criar a conta,
// "reivindica" pedidos feitos como visitante com o mesmo e-mail (customer_id
// ainda nulo) — é o que faz pedidos antigos aparecerem em /pedidos sem
// depender de busca aberta por e-mail.
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = RegisterSchema.parse(body);

    const existing = await query(`SELECT id FROM customers WHERE email = $1`, [
      data.email,
    ]);
    if (existing.rows.length > 0) {
      const response: ApiResponse<null> = {
        success: false,
        error: "Já existe uma conta com este e-mail",
      };
      return NextResponse.json(response, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

    const inserted = await query(
      `INSERT INTO customers (email, password_hash, name, phone)
       VALUES ($1, $2, $3, $4)
       RETURNING id, email, name`,
      [data.email, passwordHash, data.name, data.phone || null],
    );
    const customer = inserted.rows[0] as NewCustomer;

    await query(
      `UPDATE orders SET customer_id = $1 WHERE customer_email = $2 AND customer_id IS NULL`,
      [customer.id, data.email],
    );

    const response: ApiResponse<NewCustomer> = {
      success: true,
      data: customer,
    };
    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: error.issues[0]?.message || "Dados inválidos",
        },
        { status: 400 },
      );
    }
    console.error("POST /api/auth/register error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Erro ao criar conta",
      },
      { status: 500 },
    );
  }
}
