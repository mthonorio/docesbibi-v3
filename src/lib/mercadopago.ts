import { MercadoPagoConfig, Payment } from "mercadopago";
import crypto from "node:crypto";

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
  info: (label: string, message: string, data?: unknown) => {
    console.log(
      `[${new Date().toISOString()}] [INFO] [${label}] ${message}`,
      data || "",
    );
  },

  error: (label: string, message: string, data?: unknown) => {
    console.error(
      `[${new Date().toISOString()}] [ERROR] [${label}] ${message}`,
      data || "",
    );
  },

  warn: (label: string, message: string, data?: unknown) => {
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
      status: (response.status as PaymentStatus["status"]) || "pending",
      external_reference: response.external_reference || undefined,
      payer_email: (response.payer as { email?: string } | undefined)?.email,
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
 * Valida a assinatura HMAC de um webhook do Mercado Pago.
 * Ref: https://www.mercadopago.com.br/developers/pt/docs/checkout-api/webhooks/how-to-configure-notifications
 *
 * @param xSignature Header x-signature (formato "ts=...,v1=...")
 * @param xRequestId Header x-request-id
 * @param dataId ID do recurso notificado (data.id da query string ou do body)
 * @returns True se a assinatura é válida
 */
export function validateWebhookSignature(
  xSignature: string | null,
  xRequestId: string | null,
  dataId: string,
): boolean {
  const secret = process.env.MERCADO_PAGO_WEBHOOK_SECRET;

  if (!secret) {
    // Sem secret configurado não há como validar. Em produção isso deve
    // bloquear o webhook; em dev, deixamos passar para facilitar testes locais.
    logger.warn(
      "MP_WEBHOOK",
      "MERCADO_PAGO_WEBHOOK_SECRET não configurado — webhook não pode ser validado",
    );
    return process.env.NODE_ENV !== "production";
  }

  if (!xSignature || !xRequestId) {
    logger.error("MP_WEBHOOK", "Headers x-signature ou x-request-id ausentes");
    return false;
  }

  try {
    const parts = Object.fromEntries(
      xSignature.split(",").map((pair) => {
        const [key, value] = pair.split("=");
        return [key?.trim(), value?.trim()];
      }),
    );

    const ts = parts.ts;
    const receivedHash = parts.v1;

    if (!ts || !receivedHash) {
      logger.error("MP_WEBHOOK", "Formato de x-signature inválido", {
        xSignature,
      });
      return false;
    }

    const manifest = `id:${dataId.toLowerCase()};request-id:${xRequestId};ts:${ts};`;
    const computedHash = crypto
      .createHmac("sha256", secret)
      .update(manifest)
      .digest("hex");

    const receivedBuffer = Buffer.from(receivedHash);
    const computedBuffer = Buffer.from(computedHash);

    const isValid =
      receivedBuffer.length === computedBuffer.length &&
      crypto.timingSafeEqual(receivedBuffer, computedBuffer);

    if (!isValid) {
      logger.error("MP_WEBHOOK", "Assinatura inválida", {
        requestId: xRequestId,
      });
    }

    return isValid;
  } catch (error) {
    logger.error("MP_WEBHOOK", "Erro ao validar assinatura", {
      error: error instanceof Error ? error.message : String(error),
    });
    return false;
  }
}

/**
 * Mapeia o status de pagamento do MP para o fluxo de status interno do pedido.
 */
export function mapPaymentStatusToOrderStatus(
  mpStatus: string,
): "pago" | "cancelado" | "aguardando_pagamento" {
  const map: Record<string, "pago" | "cancelado" | "aguardando_pagamento"> = {
    approved: "pago",
    rejected: "cancelado",
    cancelled: "cancelado",
    refunded: "cancelado",
    charged_back: "cancelado",
    pending: "aguardando_pagamento",
    authorized: "aguardando_pagamento",
    in_process: "aguardando_pagamento",
    in_mediation: "aguardando_pagamento",
  };

  return map[mpStatus] || "aguardando_pagamento";
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
