import { NextResponse } from "next/server";
import {
  getPaymentStatus,
  mapPaymentStatusToOrderStatus,
  validateWebhookSignature,
  logger,
} from "@/lib/mercadopago";
import {
  isPaymentEventProcessed,
  recordPaymentEvent,
  updateOrderPaymentStatus,
} from "@/lib/orders-service";

/**
 * POST /api/webhook
 *
 * Webhook do Mercado Pago para receber notificações de pagamento
 *
 * Documentação: https://developer.mercadopago.com/pt_BR/guides/webhooks/general-considerations
 *
 * Body esperado (IPN):
 * {
 *   id: "123456",
 *   live_mode: true,
 *   type: "payment" | "plan" | "subscription" | "invoice",
 *   data: { id: "payment_id" },
 *   created_at: "2024-03-30T10:30:00.000Z"
 * }
 */
export async function POST(req: Request) {
  let requestId = "UNKNOWN";
  let paymentId = "";

  try {
    // ========== 1. LER HEADERS ==========
    const xSignature = req.headers.get("x-signature");
    const xRequestId = req.headers.get("x-request-id");
    requestId = xRequestId || "UNKNOWN";

    // ========== 2. PARSE DO BODY ==========
    const url = new URL(req.url);
    const body = await req.json();

    logger.info("WEBHOOK", "Notificação recebida", {
      requestId,
      type: body.type,
      dataId: body.data?.id,
    });

    // ========== 3. IGNORAR NOTIFICAÇÕES QUE NÃO SÃO DE PAGAMENTO ==========
    if (body.type !== "payment") {
      return NextResponse.json(
        { received: true, message: "Notificação ignorada (não é payment)" },
        { status: 200 },
      );
    }

    paymentId = body.data?.id?.toString();
    if (!paymentId) {
      logger.error("WEBHOOK", "ID do pagamento não encontrado em data.id");
      return NextResponse.json(
        { error: "payment_id não encontrado" },
        { status: 400 },
      );
    }

    // ========== 4. VALIDAR ASSINATURA ==========
    // O data.id usado na assinatura vem preferencialmente da query string
    // (é como o MP monta o manifesto); cai para o valor do body se ausente.
    const dataIdForSignature = url.searchParams.get("data.id") || paymentId;

    const signatureIsValid = validateWebhookSignature(
      xSignature,
      xRequestId,
      dataIdForSignature,
    );

    if (!signatureIsValid) {
      logger.error("WEBHOOK", "Assinatura inválida — requisição rejeitada", {
        requestId,
        paymentId,
      });
      return NextResponse.json({ error: "Assinatura inválida" }, { status: 401 });
    }

    // ========== 5. IDEMPOTÊNCIA ==========
    // O Mercado Pago reenvia notificações até receber 200 de forma
    // consistente; sem isso, uma reentrega reaplicaria a mudança de status.
    if (await isPaymentEventProcessed(paymentId)) {
      logger.info("WEBHOOK", "Evento já processado, ignorando reentrega", {
        paymentId,
      });
      return NextResponse.json(
        { received: true, message: "Já processado" },
        { status: 200 },
      );
    }

    // ========== 6. CONSULTAR STATUS REAL DO PAGAMENTO ==========
    const paymentStatus = await getPaymentStatus(paymentId);

    logger.info("WEBHOOK", "Status obtido com sucesso", {
      paymentId,
      status: paymentStatus.status,
      externalReference: paymentStatus.external_reference,
    });

    // ========== 7. ATUALIZAR O PEDIDO ==========
    let updatedOrderId: string | null = null;

    if (paymentStatus.external_reference) {
      const orderStatus = mapPaymentStatusToOrderStatus(paymentStatus.status);

      const updatedOrder = await updateOrderPaymentStatus({
        externalReference: paymentStatus.external_reference,
        paymentId,
        status: orderStatus,
      });

      if (!updatedOrder) {
        logger.error("WEBHOOK", "Nenhum pedido encontrado para este external_reference", {
          externalReference: paymentStatus.external_reference,
        });
      } else {
        updatedOrderId = updatedOrder.id;
        logger.info("WEBHOOK", "Pedido atualizado", {
          orderId: updatedOrder.id,
          status: orderStatus,
        });
      }
    } else {
      logger.warn("WEBHOOK", "Notificação sem external_reference", { paymentId });
    }

    // ========== 8. REGISTRAR EVENTO PROCESSADO ==========
    await recordPaymentEvent({
      mpPaymentId: paymentId,
      orderId: updatedOrderId,
      status: paymentStatus.status,
    });

    // ========== 9. RETORNAR HTTP 200 ==========
    // O Mercado Pago requer HTTP 200 para confirmar recebimento.
    return NextResponse.json(
      {
        received: true,
        payment_id: paymentId,
        status: paymentStatus.status,
        request_id: requestId,
      },
      { status: 200 },
    );
  } catch (error) {
    logger.error("WEBHOOK", "Erro ao processar webhook", {
      error: error instanceof Error ? error.message : String(error),
      paymentId,
      requestId,
    });

    // Mesmo em caso de erro, retornamos 200 para não ficar em retry loop
    // Mas logamos o erro para investigação posterior
    return NextResponse.json(
      {
        received: true,
        error: true,
        message: "Erro ao processar, será retentado",
      },
      { status: 200 },
    );
  }
}

/**
 * GET /api/webhook (para teste)
 * Retorna informações sobre o webhook
 */
export async function GET() {
  return NextResponse.json(
    {
      status: "ok",
      message: "Webhook do Mercado Pago está ativo",
      url: process.env.NEXT_PUBLIC_BASE_URL + "/api/webhook",
    },
    { status: 200 },
  );
}
