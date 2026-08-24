-- ============================================
-- Categorias Especiais / Eventos sazonais (Páscoa, Dia das Mães, Black
-- Friday...). Produto vinculado a um evento desativado some das consultas
-- públicas (ver src/lib/products-visibility.ts) sem que products.active
-- seja tocado — reativar o evento basta pra ele voltar a aparecer.
-- ============================================
-- Seguro rodar mais de uma vez (idempotente).

CREATE TABLE IF NOT EXISTS special_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  image VARCHAR(500),
  enabled BOOLEAN NOT NULL DEFAULT false,
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_special_categories_slug ON special_categories(slug);

-- Um produto pertence a no máximo um evento (mesmo padrão N:1 já usado por
-- products.category, que também não é uma FK N:N). ON DELETE SET NULL
-- garante no nível de banco que excluir um evento nunca leva o produto
-- junto — a API ainda bloqueia a exclusão enquanto houver produtos
-- vinculados (ver POST/DELETE /api/special-categories em
-- src/app/api/special-categories/).
ALTER TABLE products ADD COLUMN IF NOT EXISTS special_category_id UUID REFERENCES special_categories(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_products_special_category_id ON products(special_category_id);
