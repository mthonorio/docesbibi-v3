import { Resend } from "resend";
import type { Order } from "@/types/api";

let resendClient: Resend | null = null;

function getResendClient(): Resend | null {
  if (!process.env.RESEND_API_KEY) {
    console.warn(
      "[email] RESEND_API_KEY não configurada — e-mail não será enviado.",
    );
    return null;
  }
  if (!resendClient) {
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }
  return resendClient;
}

function currency(value: number | string): string {
  return `R$ ${Number(value).toFixed(2).replace(".", ",")}`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const BRAND_COLOR = "#9d174d"; // rosa-800, ver tailwind.config
const BRAND_NAME = "Doces Bibi";

function emailShell(title: string, bodyHtml: string): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
  <body style="margin:0;padding:0;background-color:#fdf2f8;font-family:Georgia,'Times New Roman',serif;color:#44403c;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;">
            <tr>
              <td style="background:${BRAND_COLOR};padding:24px 32px;">
                <h1 style="margin:0;color:#ffffff;font-size:22px;">${BRAND_NAME}</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;">
                <h2 style="margin-top:0;color:#292524;">${title}</h2>
                ${bodyHtml}
              </td>
            </tr>
            <tr>
              <td style="padding:16px 32px;background:#fdf2f8;color:#78716c;font-size:12px;">
                ${BRAND_NAME} — este e-mail foi enviado automaticamente, não é necessário responder.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function orderItemsTable(order: Order): string {
  const rows = (order.items || [])
    .map(
      (item) => `
      <tr>
        <td style="padding:8px 0;border-bottom:1px solid #f3e8e8;">${escapeHtml(item.product_name)} × ${item.quantity}</td>
        <td style="padding:8px 0;border-bottom:1px solid #f3e8e8;text-align:right;">${currency(item.subtotal)}</td>
      </tr>`,
    )
    .join("");

  return `
    <table role="presentation" width="100%" style="border-collapse:collapse;margin:16px 0;font-size:14px;">
      ${rows}
      <tr>
        <td style="padding:12px 0 0;font-weight:bold;">Total</td>
        <td style="padding:12px 0 0;font-weight:bold;text-align:right;">${currency(order.total_price)}</td>
      </tr>
    </table>`;
}

/**
 * E-mail de confirmação para o cliente — disparado quando o pedido vira
 * "pago" (webhook do MP) ou é criado manualmente pela gestora (sem
 * pagamento online). Nunca lança — falha de e-mail não pode derrubar o
 * fluxo de pedido/pagamento que a chamou.
 */
export async function sendOrderConfirmationEmail(order: Order): Promise<void> {
  const client = getResendClient();
  if (!client) return;

  const html = emailShell(
    "Recebemos seu pedido! 🎉",
    `
      <p>Olá, ${escapeHtml(order.customer_name)}!</p>
      <p>Seu pedido <strong>#${order.id.slice(0, 8)}</strong> foi confirmado e já está sendo preparado com carinho.</p>
      ${orderItemsTable(order)}
      ${order.customer_address ? `<p style="font-size:14px;color:#57534e;">Endereço: ${escapeHtml(order.customer_address)}</p>` : ""}
      <p style="font-size:14px;color:#57534e;">Qualquer dúvida, responda este e-mail ou fale com a gente pelo WhatsApp.</p>
    `,
  );

  try {
    await client.emails.send({
      from: process.env.EMAIL_FROM || "Doces Bibi <onboarding@resend.dev>",
      to: order.customer_email,
      subject: `Pedido confirmado — #${order.id.slice(0, 8)}`,
      html,
    });
  } catch (error) {
    console.error("[email] Falha ao enviar confirmação ao cliente:", {
      orderId: order.id,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

/**
 * E-mail para a dona da plataforma avisando de um novo pedido — endereço
 * vem de STORE_OWNER_EMAIL (.env), nunca do cliente/frontend.
 */
export async function sendNewOrderNotificationEmail(order: Order): Promise<void> {
  const client = getResendClient();
  const ownerEmail = process.env.STORE_OWNER_EMAIL;

  if (!ownerEmail) {
    console.warn(
      "[email] STORE_OWNER_EMAIL não configurada — notificação de novo pedido não enviada.",
    );
    return;
  }
  if (!client) return;

  const html = emailShell(
    "Novo pedido recebido 🛎️",
    `
      <p><strong>Cliente:</strong> ${escapeHtml(order.customer_name)}</p>
      <p><strong>E-mail:</strong> ${escapeHtml(order.customer_email)}</p>
      ${order.customer_phone ? `<p><strong>Telefone:</strong> ${escapeHtml(order.customer_phone)}</p>` : ""}
      ${order.customer_address ? `<p><strong>Endereço:</strong> ${escapeHtml(order.customer_address)}</p>` : ""}
      ${order.notes ? `<p><strong>Observações:</strong> ${escapeHtml(order.notes)}</p>` : ""}
      ${orderItemsTable(order)}
      <p style="font-size:14px;color:#57534e;">Pedido #${order.id} — status atual: ${order.status}</p>
    `,
  );

  try {
    await client.emails.send({
      from: process.env.EMAIL_FROM || "Doces Bibi <onboarding@resend.dev>",
      to: ownerEmail,
      subject: `Novo pedido de ${order.customer_name} — ${currency(order.total_price)}`,
      html,
    });
  } catch (error) {
    console.error("[email] Falha ao enviar notificação à gestora:", {
      orderId: order.id,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}
