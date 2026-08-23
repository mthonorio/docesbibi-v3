-- ============================================
-- Corrige a idempotência do webhook do Mercado Pago
-- ============================================
-- Bug: payment_events tinha UNIQUE só em mp_payment_id. O MP manda um
-- webhook por MUDANÇA DE STATUS do mesmo pagamento (ex.: "pending" e depois
-- "approved" chegam como duas notificações separadas, mesmo data.id). Com a
-- unicidade antiga, a primeira notificação "trava" o mp_payment_id e todas
-- as seguintes — inclusive a que traria "approved" — eram descartadas como
-- "já processado", deixando o pedido preso em aguardando_pagamento pra
-- sempre em qualquer pagamento que passe por um estado intermediário (Pix,
-- boleto, 3DS). A chave correta de idempotência é (mp_payment_id, status):
-- ignora reentrega do MESMO status, mas permite aplicar uma transição real.

ALTER TABLE payment_events DROP CONSTRAINT IF EXISTS payment_events_mp_payment_id_key;

CREATE UNIQUE INDEX IF NOT EXISTS idx_payment_events_payment_status
  ON payment_events(mp_payment_id, status);
