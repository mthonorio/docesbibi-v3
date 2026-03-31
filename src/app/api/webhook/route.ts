import { NextResponse } from "next/server";
import { getPaymentStatus, mapPaymentStatus, logger } from "@/lib/mercadopago";
import { supabase } from "@/lib/supabase-client";

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
    // ========== 1. VALIDAR HEADERS ==========
    const xSignature = req.headers.get("x-signature");
    const xRequestId = req.headers.get("x-request-id");

    requestId = xRequestId || "UNKNOWN";

    logger.info("WEBHOOK", "Recebendo notificação", {
      requestId,
      xSignature: xSignature?.substring(0, 20) + "...",
    });

    // ========== 2. PARSE DO BODY ==========
    const body = await req.json();

    logger.info("WEBHOOK", "Body recebido", {
      type: body.type,
      dataId: body.data?.id,
    });

    // ========== 3. VALIDAR TIPO DE NOTIFICAÇÃO ==========
    if (body.type !== "payment") {
      logger.warn("WEBHOOK", "Notificação não é de pagamento", {
        type: body.type,
      });

      return NextResponse.json(
        { received: true, message: "Notificação ignorada (não é payment)" },
        { status: 200 },
      );
    }

    // ========== 4. EXTRAIR ID DO PAGAMENTO ==========
    paymentId = body.data?.id?.toString();

    if (!paymentId) {
      logger.error("WEBHOOK", "ID do pagamento não encontrado em data.id");
      return NextResponse.json(
        { error: "payment_id não encontrado" },
        { status: 400 },
      );
    }

    logger.info("WEBHOOK", "ID do pagamento extraído", { paymentId });

    // ========== 5. CONSULTAR STATUS EM TEMPO REAL ==========
    logger.info("WEBHOOK", "Consultando status real do pagamento", {
      paymentId,
    });

    const paymentStatus = await getPaymentStatus(paymentId);

    logger.info("WEBHOOK", "Status obtido com sucesso", {
      paymentId,
      status: paymentStatus.status,
      amount: paymentStatus.transaction_amount,
      externalReference: paymentStatus.external_reference,
    });

    // ========== 6. ATUALIZAR BANCO DE DADOS ==========
    // IMPORTANTE: Aqui você deve atualizar seu banco de dados
    // com o novo status do pagamento
    // Exemplo com Supabase:

    if (paymentStatus.external_reference) {
      try {
        logger.info("WEBHOOK", "Atualizando order no banco", {
          externalReference: paymentStatus.external_reference,
          status: paymentStatus.status,
        });

        // Tentar atualizar a order (substitua pelos nomes reais da sua tabela)
        const { error: updateError } = await supabase
          .from("orders")
          .update({
            status: paymentStatus.status,
            payment_id: paymentId,
            updated_at: new Date().toISOString(),
          })
          .eq("external_reference", paymentStatus.external_reference);

        if (updateError) {
          logger.error("WEBHOOK", "Erro ao atualizar order", {
            error: updateError.message,
          });
        } else {
          logger.info("WEBHOOK", "Order atualizada com sucesso");
        }
      } catch (error) {
        logger.error("WEBHOOK", "Erro ao processar atualização", {
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    // ========== 7. LOG DO PROCESSAMENTO ==========
    logger.info("WEBHOOK", "Notificação processada com sucesso", {
      paymentId,
      status: paymentStatus.status,
      requestId,
    });

    // ========== 8. RETORNAR HTTP 200 ==========
    // IMPORTANTE: O Mercado Pago requer HTTP 200 para confirmar recebimento
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
      url: process.env.NEXT_PUBLIC_API_URL + "/api/webhook",
    },
    { status: 200 },
  );
}
