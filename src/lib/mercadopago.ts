import { MercadoPagoConfig, Payment } from "mercadopago";

// ========== INICIALIZAÇÃO DO CLIENTE ==========
export const mercadopagoClient = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN!,
});

// ========== TIPOS ==========
export interface PaymentStatus {
  id: string;
  status: "approved" | "rejected" | "pending" | "in_process";
  external_reference?: string;
  payer_email?: string;
  transaction_amount: number;
  currency_id: string;
  created_at: string;
  last_updated: string;
}

// ========== LOGGING COM TIMESTAMP ==========
export const logger = {
  info: (label: string, message: string, data?: any) => {
    console.log(
      `[${new Date().toISOString()}] [INFO] [${label}] ${message}`,
      data || "",
    );
  },

  error: (label: string, message: string, data?: any) => {
    console.error(
      `[${new Date().toISOString()}] [ERROR] [${label}] ${message}`,
      data || "",
    );
  },

  warn: (label: string, message: string, data?: any) => {
    console.warn(
      `[${new Date().toISOString()}] [WARN] [${label}] ${message}`,
      data || "",
    );
  },
};

// ========== FUNÇÕES UTILITÁRIAS ==========

/**
 * Consulta o status de um pagamento na API do MP
 * @param paymentId ID do pagamento
 * @returns Dados do pagamento
 */
export async function getPaymentStatus(
  paymentId: string,
): Promise<PaymentStatus> {
  try {
    logger.info("MP_PAYMENT", "Consultando status do pagamento", {
      paymentId,
    });

    const payment = new Payment(mercadopagoClient);
    const response = await payment.get({ id: paymentId });

    const paymentStatus: PaymentStatus = {
      id: response.id?.toString() || paymentId,
      status: (response.status as any) || "pending",
      external_reference: response.external_reference || undefined,
      payer_email: (response.payer as any)?.email,
      transaction_amount: response.transaction_amount || 0,
      currency_id: response.currency_id || "BRL",
      created_at: response.date_created || new Date().toISOString(),
      last_updated: response.date_last_updated || new Date().toISOString(),
    };

    logger.info("MP_PAYMENT", "Status obtido com sucesso", {
      paymentId,
      status: paymentStatus.status,
    });

    return paymentStatus;
  } catch (error) {
    logger.error("MP_PAYMENT", "Erro ao consultar pagamento", {
      paymentId,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

/**
 * Valida a assinatura de um webhook
 * @param xSignature Header x-signature do Mercado Pago
 * @param requestId Header x-request-id do Mercado Pago
 * @param body Body da requisição
 * @returns True se a assinatura é válida
 */
export function validateWebhookSignature(
  xSignature: string,
  requestId: string,
  body: string,
): boolean {
  try {
    // O secret é uma combinação do Access Token e da data/hora
    // Ref: https://developer.mercadopago.com/pt_BR/guides/webhooks/general-considerations

    const secret = process.env.MERCADO_PAGO_WEBHOOK_SECRET || "";
    if (!secret) {
      logger.warn("MP_WEBHOOK", "MERCADO_PAGO_WEBHOOK_SECRET não configurado");
      // Em desenvolvimento, podemos permitir sem validação
      return true;
    }

    // A validação real seria implementada com crypto
    // Por enquanto, apenas logamos para fins de desenvolvimento
    logger.info("MP_WEBHOOK", "Validando assinatura do webhook", {
      requestId,
      signatureLength: xSignature.length,
    });

    return true;
  } catch (error) {
    logger.error("MP_WEBHOOK", "Erro ao validar assinatura", {
      error: error instanceof Error ? error.message : String(error),
    });
    return false;
  }
}

/**
 * Mapeia status do MP para status legível
 */
export function mapPaymentStatus(
  mpStatus: string,
): "approved" | "rejected" | "pending" | "in_process" {
  const statusMap: Record<
    string,
    "approved" | "rejected" | "pending" | "in_process"
  > = {
    approved: "approved",
    pending: "pending",
    authorized: "pending",
    in_process: "in_process",
    in_mediation: "pending",
    rejected: "rejected",
    cancelled: "rejected",
    refunded: "rejected",
    charged_back: "rejected",
  };

  return statusMap[mpStatus] || "pending";
}
