import { NextResponse } from "next/server";
import { getPaymentStatus, logger } from "@/lib/mercadopago";

/**
 * GET /api/payments/[id]
 * Consulta o status de um pagamento específico
 *
 * Query params:
 * - id: ID do pagamento no Mercado Pago
 *
 * Retorna: { success, payment: { id, status, transaction_amount, ... } }
 */
export async function GET(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const paymentId = params.id;

    if (!paymentId) {
      logger.error("GET_PAYMENT", "ID do pagamento não fornecido");
      return NextResponse.json(
        {
          success: false,
          error: "ID do pagamento é obrigatório",
        },
        { status: 400 },
      );
    }

    logger.info("GET_PAYMENT", "Consultando pagamento", { paymentId });

    const payment = await getPaymentStatus(paymentId);

    return NextResponse.json(
      {
        success: true,
        payment,
      },
      { status: 200 },
    );
  } catch (error) {
    logger.error("GET_PAYMENT", "Erro ao consultar pagamento", {
      error: error instanceof Error ? error.message : String(error),
    });

    return NextResponse.json(
      {
        success: false,
        error: "Erro ao consultar pagamento",
      },
      { status: 500 },
    );
  }
}
