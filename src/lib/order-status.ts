import type { OrderStatus } from "@/types/api";

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  novo_pedido: "Novo Pedido",
  aguardando_pagamento: "Aguardando Pagamento",
  pago: "Pago",
  em_producao: "Em Produção",
  pronto_retirada: "Pronto p/ Retirada",
  saiu_entrega: "Saiu p/ Entrega",
  finalizado: "Finalizado",
  cancelado: "Cancelado",
};

export const ORDER_STATUS_COLORS: Record<
  OrderStatus,
  { bg: string; text: string }
> = {
  novo_pedido: { bg: "#fef9c3", text: "#854d0e" },
  aguardando_pagamento: { bg: "#fce8d6", text: "#c2650a" },
  pago: { bg: "#dbeafe", text: "#1d4ed8" },
  em_producao: { bg: "#ffe0ea", text: "#be185d" },
  pronto_retirada: { bg: "#ccfbf1", text: "#0f766e" },
  saiu_entrega: { bg: "#ede9fe", text: "#6d28d9" },
  finalizado: { bg: "#dcfce7", text: "#15803d" },
  cancelado: { bg: "#fee2e2", text: "#b91c1c" },
};

/**
 * Ordem real do fluxo de produção (sql/002_payment_flow.sql). Usado pelo
 * OrderStatusTimeline para saber quais etapas já passaram vs. faltam.
 * "cancelado" fica fora — é um estado terminal alternativo, não um passo.
 */
export const ORDER_STATUS_FLOW: OrderStatus[] = [
  "novo_pedido",
  "aguardando_pagamento",
  "pago",
  "em_producao",
  "pronto_retirada",
  "saiu_entrega",
  "finalizado",
];

/**
 * Transições que fazem sentido a partir de cada status — usado pra decidir
 * quais botões de ação mostrar em Detalhes da Venda (nunca todas as 8).
 */
export const ORDER_STATUS_NEXT: Record<OrderStatus, OrderStatus[]> = {
  novo_pedido: ["aguardando_pagamento", "cancelado"],
  aguardando_pagamento: ["pago", "cancelado"],
  pago: ["em_producao", "cancelado"],
  em_producao: ["pronto_retirada", "cancelado"],
  pronto_retirada: ["saiu_entrega", "cancelado"],
  saiu_entrega: ["finalizado", "cancelado"],
  finalizado: [],
  cancelado: [],
};

export const ORDER_STATUS_ACTION_LABELS: Partial<Record<OrderStatus, string>> = {
  aguardando_pagamento: "Confirmar pedido",
  pago: "Marcar como pago",
  em_producao: "Iniciar preparação",
  pronto_retirada: "Marcar como pronto",
  saiu_entrega: "Marcar como enviado",
  finalizado: "Finalizar pedido",
  cancelado: "Cancelar pedido",
};
