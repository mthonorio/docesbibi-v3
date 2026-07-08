-- ============================================
-- FASE 1 (F1-2 / F1-4): fluxo de pagamento e idempotência de webhook
-- ============================================
-- Rode este arquivo inteiro de uma vez no SQL Editor do Supabase
-- (ou via psql $DATABASE_URL -f sql/002_payment_flow.sql).
-- É seguro rodar mais de uma vez (idempotente).

-- 1) Endereço deixa de ser obrigatório: hoje o checkout de pagamento não
--    coleta endereço (isso entra no fluxo de agendamento da Fase 2).
ALTER TABLE orders ALTER COLUMN customer_address DROP NOT NULL;

-- 2) Colunas para ligar o pedido à cobrança no Mercado Pago.
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_id VARCHAR(64);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS external_reference VARCHAR(64);

CREATE INDEX IF NOT EXISTS idx_orders_payment_id ON orders(payment_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_external_reference
  ON orders(external_reference) WHERE external_reference IS NOT NULL;

-- 3) Migrar o enum de status de 5 valores para o fluxo de produção de 8 estados.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_status_old') THEN
    -- migração já foi aplicada antes; não faz nada
    RETURN;
  END IF;

  ALTER TYPE order_status RENAME TO order_status_old;

  CREATE TYPE order_status AS ENUM (
    'novo_pedido',
    'aguardando_pagamento',
    'pago',
    'em_producao',
    'pronto_retirada',
    'saiu_entrega',
    'finalizado',
    'cancelado'
  );

  ALTER TABLE orders ALTER COLUMN status DROP DEFAULT;

  ALTER TABLE orders ALTER COLUMN status TYPE order_status USING (
    CASE status::text
      WHEN 'pendente'   THEN 'novo_pedido'
      WHEN 'confirmado' THEN 'pago'
      WHEN 'enviado'    THEN 'saiu_entrega'
      WHEN 'entregue'   THEN 'finalizado'
      WHEN 'cancelado'  THEN 'cancelado'
      ELSE 'novo_pedido'
    END
  )::order_status;

  ALTER TABLE orders ALTER COLUMN status SET DEFAULT 'novo_pedido';

  DROP TYPE order_status_old;
END $$;

-- 4) Idempotência do webhook: cada payment_id do Mercado Pago só é aplicado uma vez.
CREATE TABLE IF NOT EXISTS payment_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mp_payment_id VARCHAR(64) NOT NULL UNIQUE,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  status VARCHAR(32) NOT NULL,
  processed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_payment_events_order_id ON payment_events(order_id);
