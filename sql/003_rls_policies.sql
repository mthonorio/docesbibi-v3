-- ============================================
-- FASE 1 (F1-6): Row Level Security
-- ============================================
-- Rode este arquivo inteiro no SQL Editor do Supabase (ou psql $DATABASE_URL -f sql/003_rls_policies.sql).
-- É seguro rodar mais de uma vez (idempotente).
--
-- Levantamento feito no código antes de escrever isto (nenhuma tabela aqui é
-- lida/escrita pela chave anônima além do que as policies abaixo liberam):
--   - products         -> lido via chave anônima em useSupabaseData, useEasterProducts,
--                          api/create-payment (leitura de preço). Nunca escrito por essa via.
--   - available_flavors -> não é consultado em lugar nenhum hoje; tratado como catálogo público.
--   - orders / order_items / payment_events -> só são acessados via DATABASE_URL
--                          (pg.Pool, papel "postgres", que não passa pelo PostgREST e
--                          portanto ignora RLS). Nenhum código usa a chave anônima nessas tabelas.

-- products: catálogo público — leitura livre, escrita só pelo backend.
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "products_public_read" ON products;
CREATE POLICY "products_public_read" ON products FOR SELECT USING (true);

-- available_flavors: mesma lógica de catálogo público.
ALTER TABLE available_flavors ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "available_flavors_public_read" ON available_flavors;
CREATE POLICY "available_flavors_public_read" ON available_flavors FOR SELECT USING (true);

-- orders / order_items / payment_events: RLS habilitada sem nenhuma policy =
-- acesso negado por padrão via API do Supabase (chave anônima ou autenticada).
-- Isso não afeta as rotas /api/orders, /api/create-payment nem o webhook, que
-- usam DATABASE_URL diretamente (fora do PostgREST).
--
-- Na Fase 2, ao construir a página pública de acompanhamento de pedido e o
-- histórico do cliente, adicione policies específicas aqui (ex.: SELECT
-- restrito por auth.uid() ou por um token de acompanhamento) em vez de abrir
-- acesso genérico.
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_events ENABLE ROW LEVEL SECURITY;
