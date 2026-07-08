import { query } from "@/lib/db";
import type { Order, CreateOrderInput, OrderStatus } from "@/types/api";

/**
 * Camada única de criação/leitura de pedidos, usada tanto pela rota manual
 * de pedidos (/api/orders) quanto pelo checkout de pagamento
 * (/api/create-payment) — antes eram dois caminhos que nunca se encontravam.
 */
export async function createOrder(
  input: CreateOrderInput,
  options: { status?: OrderStatus } = {},
): Promise<Order> {
  if (!input.customer_name || !input.customer_email) {
    throw new Error("customer_name e customer_email são obrigatórios");
  }
  if (!input.items || input.items.length === 0) {
    throw new Error("Pedido deve conter pelo menos um item");
  }

  const status = options.status ?? "novo_pedido";

  const orderResult = await query(
    `INSERT INTO orders (customer_name, customer_email, customer_phone, customer_address, notes, status)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id`,
    [
      input.customer_name,
      input.customer_email,
      input.customer_phone || null,
      input.customer_address || null,
      input.notes || null,
      status,
    ],
  );

  const orderId = orderResult.rows[0].id;

  for (const item of input.items) {
    const productResult = await query(
      `SELECT id, name, price FROM products WHERE id = $1`,
      [item.product_id],
    );

    if (productResult.rows.length === 0) {
      throw new Error(`Produto com ID ${item.product_id} não encontrado`);
    }

    const product = productResult.rows[0];
    const subtotal = product.price * item.quantity;

    await query(
      `INSERT INTO order_items (order_id, product_id, product_name, price, quantity, subtotal)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [orderId, product.id, product.name, product.price, item.quantity, subtotal],
    );
  }

  const created = await getOrderById(orderId);
  if (!created) {
    throw new Error("Falha ao recuperar o pedido recém-criado");
  }
  return created;
}

export async function getOrderById(id: string): Promise<Order | null> {
  const orderResult = await query(`SELECT * FROM orders WHERE id = $1`, [id]);
  if (orderResult.rows.length === 0) return null;

  const itemsResult = await query(
    `SELECT * FROM order_items WHERE order_id = $1 ORDER BY created_at ASC`,
    [id],
  );

  return { ...orderResult.rows[0], items: itemsResult.rows };
}

/** Usa o próprio ID do pedido como external_reference do Mercado Pago. */
export async function setOrderExternalReference(
  orderId: string,
  externalReference: string,
): Promise<void> {
  await query(
    `UPDATE orders SET external_reference = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
    [externalReference, orderId],
  );
}

export async function markOrderAsFailed(orderId: string): Promise<void> {
  await query(
    `UPDATE orders SET status = 'cancelado', updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
    [orderId],
  );
}

export async function updateOrderPaymentStatus(params: {
  externalReference: string;
  paymentId: string;
  status: OrderStatus;
}): Promise<Order | null> {
  const result = await query(
    `UPDATE orders SET payment_id = $1, status = $2, updated_at = CURRENT_TIMESTAMP
     WHERE external_reference = $3
     RETURNING id`,
    [params.paymentId, params.status, params.externalReference],
  );

  if (result.rows.length === 0) return null;
  return getOrderById(result.rows[0].id);
}

export async function isPaymentEventProcessed(
  mpPaymentId: string,
): Promise<boolean> {
  const result = await query(
    `SELECT 1 FROM payment_events WHERE mp_payment_id = $1`,
    [mpPaymentId],
  );
  return result.rows.length > 0;
}

export async function recordPaymentEvent(params: {
  mpPaymentId: string;
  orderId: string | null;
  status: string;
}): Promise<void> {
  await query(
    `INSERT INTO payment_events (mp_payment_id, order_id, status)
     VALUES ($1, $2, $3)
     ON CONFLICT (mp_payment_id) DO NOTHING`,
    [params.mpPaymentId, params.orderId, params.status],
  );
}
