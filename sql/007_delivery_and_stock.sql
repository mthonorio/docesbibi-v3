-- ============================================
-- Agendamento de entrega em orders + estoque/ativação em products.
-- ============================================
-- Seguro rodar mais de uma vez (idempotente).

-- 'retirada' | 'entrega' — opcional, um pedido sem agendamento simplesmente
-- não aparece na aba "Agendadas" do painel.
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_type VARCHAR(20);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_date DATE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_time VARCHAR(5);

-- `active`: produto some do catálogo público quando false, mas continua
-- editável no painel. `stock`: NULL = não controlado/ilimitado; gerenciado
-- manualmente pela gestora, o checkout NÃO decrementa automaticamente.
ALTER TABLE products ADD COLUMN IF NOT EXISTS active BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE products ADD COLUMN IF NOT EXISTS stock INT;
