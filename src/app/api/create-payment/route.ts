import { NextResponse } from "next/server";
import { MercadoPagoConfig, Preference } from "mercadopago";
import { z } from "zod";

// ========== SCHEMAS DE VALIDAÇÃO ==========
const ItemSchema = z.object({
  title: z.string().min(1, "Título do item é obrigatório"),
  quantity: z.number().positive("Quantidade deve ser positiva"),
  unit_price: z.number().positive("Preço deve ser positivo"),
  currency_id: z.literal("BRL").optional().default("BRL"),
  description: z.string().optional(),
});

const CreatePreferenceSchema = z.object({
  items: z.array(ItemSchema).min(1, "Pelo menos um item é necessário"),
  payer: z.object({
    email: z.string().email("E-mail inválido"),
    name: z.string().optional(),
    phone: z
      .object({
        area_code: z.string().optional(),
        number: z.string().optional(),
      })
      .optional(),
  }),
  external_reference: z.string().optional(),
});

type CreatePreferenceInput = z.infer<typeof CreatePreferenceSchema>;

// ========== INICIALIZAÇÃO ==========
const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN!,
});

// ========== ENDPOINT POST: CREATE PREFERENCE ==========
/**
 * POST /api/create-payment
 * Cria uma preferência de pagamento no Mercado Pago
 *
 * Body esperado:
 * {
 *   items: [{ title, quantity, unit_price, currency_id?, description? }],
 *   payer: { email, name?, phone? },
 *   external_reference?: "ID do pedido"
 * }
 *
 * Retorna: { init_point, id, external_reference }
 */
export async function POST(req: Request) {
  try {
    console.log("[MP Payment] Recebendo requisição POST /api/create-payment");

    // Validar variáveis de ambiente
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    if (!baseUrl) {
      console.error(
        "[MP Payment] NEXT_PUBLIC_BASE_URL não definida nas variáveis de ambiente",
      );
      return NextResponse.json(
        {
          success: false,
          error: "Configuração do servidor incorreta: URL base não definida",
        },
        { status: 500 },
      );
    }

    // Parse e validação do body
    const body = await req.json();

    const validData = CreatePreferenceSchema.parse(body);
    console.log("[MP Payment] Dados validados com sucesso", {
      itemsCount: validData.items.length,
      payerEmail: validData.payer.email,
    });

    // Preparar back_urls com baseUrl validada
    const backUrls = {
      success: `${baseUrl}/checkout/success`,
      failure: `${baseUrl}/checkout/failure`,
      pending: `${baseUrl}/checkout/pending`,
    };

    console.log("[MP Payment] URLs de retorno configuradas", backUrls);

    // Criar preferência
    const preference = new Preference(client);

    // Montar o objeto de preferência
    const preferenceData: any = {
      items: validData.items.map((item, index) => ({
        id: String(index),
        title: item.title,
        quantity: item.quantity,
        unit_price: item.unit_price,
        currency_id: item.currency_id || "BRL",
        description: item.description,
      })),
      payer: {
        email: validData.payer.email,
        name: validData.payer.name,
        phone: validData.payer.phone,
      },
      external_reference: validData.external_reference,
      back_urls: backUrls,
      statement_descriptor: "DOCES BIBI",
    };

    console.log("[MP Payment] Enviando preferência para o Mercado Pago", {
      itemsCount: preferenceData.items.length,
    });

    const response = await preference.create({
      body: preferenceData,
    });

    console.log("[MP Payment] Preferência criada com sucesso", {
      preferenceId: response.id,
      initPoint: response.init_point,
    });

    return NextResponse.json(
      {
        success: true,
        init_point: response.init_point,
        preference_id: response.id,
        external_reference: response.external_reference,
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Erro de validação
      console.error("[MP Payment] Erro de validação:", error.issues);
      return NextResponse.json(
        {
          success: false,
          error: "Dados inválidos",
          details: error.issues.map((issue) => ({
            field: issue.path.join("."),
            message: issue.message,
          })),
        },
        { status: 400 },
      );
    }

    if (error instanceof Error) {
      console.error("[MP Payment] Erro:", error.message);
      return NextResponse.json(
        {
          success: false,
          error: "Erro ao criar preferência de pagamento",
          message: error.message,
        },
        { status: 500 },
      );
    }

    console.error("[MP Payment] Erro desconhecido:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Erro desconhecido ao processar pagamento",
      },
      { status: 500 },
    );
  }
}
