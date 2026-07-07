import { NextResponse } from "next/server";
import { MercadoPagoConfig, Preference } from "mercadopago";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";

// ========== INICIALIZAÇÃO SUPABASE ==========
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
);

// ========== SCHEMAS DE VALIDAÇÃO ==========
const CartItemSchema = z.object({
  product_id: z.string().uuid("ID do produto deve ser um UUID válido"),
  quantity: z.number().positive("Quantidade deve ser positiva"),
});

const CreatePreferenceSchema = z.object({
  items: z.array(CartItemSchema).min(1, "Pelo menos um item é necessário"),
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

// ========== INTERFACE PARA PRODUTO ==========
interface ProductFromDB {
  id: string;
  name: string;
  price: number;
  description?: string;
}

// ========== INICIALIZAÇÃO MERCADO PAGO ==========
const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN!,
});

// ========== FUNÇÕES AUXILIARES ==========
/**
 * Busca produtos do banco de dados pelo UUID
 * @param productIds Array dos UUIDs dos produtos a buscar
 * @returns Map de product_id (UUID) => ProductFromDB
 */
async function getProductsFromDatabase(
  productIds: string[],
): Promise<Map<string, ProductFromDB>> {
  console.log("[MP Payment] Buscando produtos do banco de dados", {
    productIds,
  });

  try {
    const { data, error } = await supabase
      .from("products")
      .select("id, name, price, description")
      .in("id", productIds);

    if (error) {
      console.error("[MP Payment] Erro ao buscar produtos:", error);
      throw new Error(`Erro ao buscar produtos: ${error.message}`);
    }

    const productsMap = new Map<string, ProductFromDB>();
    if (data) {
      data.forEach((product) => {
        productsMap.set(product.id, {
          id: product.id,
          name: product.name,
          price: product.price,
          description: product.description,
        });
      });
    }

    console.log("[MP Payment] Produtos encontrados:", {
      count: productsMap.size,
      productIds: Array.from(productsMap.keys()),
    });

    return productsMap;
  } catch (error) {
    console.error("[MP Payment] Erro ao buscar produtos do DB:", error);
    throw error;
  }
}

/**
 * Valida se todos os produtos existem no banco de dados
 * @param requestedIds UUIDs dos produtos solicitados
 * @param foundProducts Produtos encontrados
 */
function validateProductsExist(
  requestedIds: string[],
  foundProducts: Map<string, ProductFromDB>,
): {
  valid: boolean;
  missingIds: string[];
} {
  const missingIds = requestedIds.filter((id) => !foundProducts.has(id));

  return {
    valid: missingIds.length === 0,
    missingIds,
  };
}

// ========== ENDPOINT POST: CREATE PREFERENCE ==========
/**
 * POST /api/create-payment
 *
 * SEGURANÇA: Os preços são buscados do banco de dados com autenticação de UUID.
 * O cliente envia apenas product_id (UUID) e quantity, não unit_price.
 *
 * Body esperado:
 * {
 *   items: [{ product_id (UUID), quantity }],
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

    // ========== SEGURANÇA: BUSCAR PREÇOS DO BANCO DE DADOS ==========
    const productIds = validData.items.map((item) => item.product_id);
    const productsFromDB = await getProductsFromDatabase(productIds);

    // Validar se todos os produtos foram encontrados
    const validation = validateProductsExist(productIds, productsFromDB);
    if (!validation.valid) {
      console.error("[MP Payment] Produtos não encontrados:", {
        missingIds: validation.missingIds,
      });
      return NextResponse.json(
        {
          success: false,
          error: "Um ou mais produtos não foram encontrados no banco de dados",
          missingProductIds: validation.missingIds,
        },
        { status: 404 },
      );
    }

    // Preparar back_urls com baseUrl validada
    const backUrls = {
      success: `${baseUrl}/checkout/success`,
      failure: `${baseUrl}/checkout/failure`,
      pending: `${baseUrl}/checkout/pending`,
    };

    console.log("[MP Payment] URLs de retorno configuradas", backUrls);

    // Criar preferência
    const preference = new Preference(client);

    // ========== MONTAR ITEMS COM PREÇOS DO BANCO DE DADOS ==========
    const preferenceItems = validData.items.map((item, index) => {
      const product = productsFromDB.get(item.product_id)!;
      return {
        id: String(item.product_id),
        title: product.name,
        quantity: item.quantity,
        unit_price: product.price, // PREÇO VINDO DO BANCO DE DADOS
        currency_id: "BRL",
        description: product.description,
      };
    });

    // Montar o objeto de preferência
    const preferenceData: any = {
      items: preferenceItems,
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
      totalAmount: preferenceData.items.reduce(
        (sum: number, item: any) => sum + item.unit_price * item.quantity,
        0,
      ),
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
