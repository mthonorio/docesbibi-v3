import { NextResponse } from "next/server";
import { MercadoPagoConfig, Preference } from "mercadopago";
import { z } from "zod";
import { query } from "@/lib/db";
import { auth } from "@/lib/auth";
import {
  createOrder,
  setOrderExternalReference,
  markOrderAsFailed,
} from "@/lib/orders-service";

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
  customer_address: z.string().optional(),
  notes: z.string().optional(),
  delivery_type: z.enum(["retirada", "entrega"]).optional(),
  delivery_date: z.string().optional(),
  delivery_time: z.string().optional(),
});

// ========== INTERFACE PARA PRODUTO ==========
interface ProductFromDB {
  id: string;
  name: string;
  price: number;
  description?: string;
  active: boolean;
  stock: number | null;
}

// ========== TIPOS DA PREFERÊNCIA MERCADO PAGO ==========
// Só os campos que este route handler efetivamente monta — não é o shape
// completo aceito pela API do MP, só o suficiente pra tipar sem `any`.
interface PreferenceItemData {
  id: string;
  title: string;
  quantity: number;
  unit_price: number;
  currency_id: string;
  description?: string;
}

interface CreatePreferenceData {
  items: PreferenceItemData[];
  payer: {
    email: string;
    name?: string;
    phone?: { area_code?: string; number?: string };
  };
  external_reference: string;
  back_urls: { success: string; failure: string; pending: string };
  notification_url: string;
  statement_descriptor: string;
  auto_return?: "approved";
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
    const result = await query(
      `SELECT id, name, price, description, active, stock FROM products WHERE id = ANY($1::uuid[])`,
      [productIds],
    );

    const productsMap = new Map<string, ProductFromDB>();
    result.rows.forEach((product) => {
      productsMap.set(product.id, {
        id: product.id,
        name: product.name,
        price: Number(product.price),
        description: product.description,
        active: product.active,
        stock: product.stock === null ? null : Number(product.stock),
      });
    });

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
 *   customer_address?: string,
 *   notes?: string
 * }
 *
 * Cria o pedido no banco (status "aguardando_pagamento") e usa o próprio
 * ID do pedido como external_reference da preferência do Mercado Pago.
 *
 * Retorna: { init_point, preference_id, external_reference, order_id }
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

    // ========== VALIDAR DISPONIBILIDADE (ATIVO / ESTOQUE) ==========
    // Mesma lógica de "nunca confiar no client" já usada pro preço: a
    // vitrine pode estar com cache velho mostrando um produto desativado ou
    // sem estoque, então revalidamos aqui antes de gerar a cobrança.
    for (const item of validData.items) {
      const product = productsFromDB.get(item.product_id)!;
      if (!product.active) {
        return NextResponse.json(
          {
            success: false,
            error: `Produto "${product.name}" não está mais disponível`,
          },
          { status: 409 },
        );
      }
      if (product.stock !== null && item.quantity > product.stock) {
        return NextResponse.json(
          {
            success: false,
            error: `Estoque insuficiente para "${product.name}"`,
          },
          { status: 409 },
        );
      }
    }

    // Se o comprador estiver logado, o pedido nasce já vinculado à conta —
    // não depende do "claim" por e-mail feito no cadastro (ver
    // src/app/api/auth/register/route.ts). Checkout de visitante continua
    // funcionando normalmente (session fica undefined nesse caso).
    const session = await auth();
    const customerId =
      session?.user.role === "customer" ? session.user.id : undefined;

    // ========== CRIAR O PEDIDO ANTES DE COBRAR ==========
    // O pedido nasce aqui, com status "aguardando_pagamento" — é o que o
    // webhook (/api/webhook) vai localizar e atualizar quando o Mercado
    // Pago confirmar o pagamento. Sem isso, pagar não gerava pedido algum.
    const order = await createOrder(
      {
        customer_id: customerId,
        customer_name: validData.payer.name || "Cliente",
        customer_email: validData.payer.email,
        customer_phone: validData.payer.phone?.number,
        customer_address: validData.customer_address,
        notes: validData.notes,
        delivery_type: validData.delivery_type,
        delivery_date: validData.delivery_date,
        delivery_time: validData.delivery_time,
        items: validData.items,
      },
      { status: "aguardando_pagamento" },
    );

    await setOrderExternalReference(order.id, order.id);

    console.log("[MP Payment] Pedido criado", { orderId: order.id });

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
    const preferenceItems = validData.items.map((item) => {
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
    const preferenceData: CreatePreferenceData = {
      items: preferenceItems,
      payer: {
        email: validData.payer.email,
        name: validData.payer.name,
        phone: validData.payer.phone,
      },
      external_reference: order.id,
      back_urls: backUrls,
      // Explícito por preferência em vez de depender só da "Notification URL"
      // configurada no painel do MP — assim cada ambiente (local/staging/
      // produção) aponta pro seu próprio /api/webhook automaticamente. Pra
      // testar localmente ainda é preciso expor a porta 3000 via túnel
      // (ngrok etc.) — o MP não alcança localhost.
      notification_url: `${baseUrl}/api/webhook`,
      statement_descriptor: "DOCES BIBI",
    };

    // auto_return exige back_urls https — em dev (http://localhost) o MP
    // rejeita/ignora a preferência se isso for setado, então só habilitamos
    // em produção.
    if (baseUrl.startsWith("https://")) {
      preferenceData.auto_return = "approved";
    }

    console.log("[MP Payment] Enviando preferência para o Mercado Pago", {
      itemsCount: preferenceData.items.length,
      totalAmount: preferenceData.items.reduce(
        (sum, item) => sum + item.unit_price * item.quantity,
        0,
      ),
    });

    let response;
    try {
      response = await preference.create({ body: preferenceData });
    } catch (mpError) {
      // O pedido já existe no banco — se o Mercado Pago falhar em gerar a
      // preferência, não deixamos o pedido preso em "aguardando_pagamento".
      console.error("[MP Payment] Falha ao criar preferência, cancelando pedido", {
        orderId: order.id,
        error: mpError instanceof Error ? mpError.message : String(mpError),
      });
      await markOrderAsFailed(order.id);
      throw mpError;
    }

    console.log("[MP Payment] Preferência criada com sucesso", {
      orderId: order.id,
      preferenceId: response.id,
      initPoint: response.init_point,
    });

    return NextResponse.json(
      {
        success: true,
        init_point: response.init_point,
        preference_id: response.id,
        external_reference: response.external_reference,
        order_id: order.id,
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
