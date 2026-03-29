-- ============================================
-- EXTENSÃO PARA CUSTOMIZAÇÃO DE OVOS DE PÁSCOA
-- ============================================

-- Adicionar coluna de sabores aos order_items (JSONB para flexibilidade)
-- struct: { flavors: string[], model_type: '150g' | 'duo_150g' | 'trio_50g' | '400g' }
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS flavors JSONB DEFAULT '[]';
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS model_type VARCHAR(50);

-- Exemplos de dados customizados:
-- Duo 150g com 2 sabores:
-- { "flavors": ["Dois Amores", "Oreo"], "model_type": "duo_150g" }
--
-- Trio 50g com 3 sabores (podem ser iguais):
-- { "flavors": ["Ninho com Nutella", "Ninho com Nutella", "Ninho com Nutella"], "model_type": "trio_50g" }
--
-- 150g simples com 1 sabor:
-- { "flavors": ["Brigadeirão"], "model_type": "150g" }

-- Criar índice para melhor performance ao buscar por model_type
CREATE INDEX IF NOT EXISTS idx_order_items_model_type ON order_items(model_type);
CREATE INDEX IF NOT EXISTS idx_order_items_flavors ON order_items USING GIN(flavors);

-- Criar tipo enum para modelos de ovo
CREATE TYPE easter_model_type AS ENUM (
  '150g',
  'duo_150g',
  'trio_50g',
  '400g'
);

-- OPCIONAL: Se usar tabela separada para flavores (mais normalizada)
-- Descomente se preferir estrutura relacional em vez de JSONB
/*
CREATE TABLE IF NOT EXISTS order_item_flavors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_item_id UUID NOT NULL REFERENCES order_items(id) ON DELETE CASCADE,
  flavor_name VARCHAR(255) NOT NULL,
  position INT NOT NULL CHECK (position > 0),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_order_item_flavors_order_item_id 
ON order_item_flavors(order_item_id);
*/

-- Seed: Tabela de sabores disponíveis (referência)
CREATE TABLE IF NOT EXISTS available_flavors (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  color_hex VARCHAR(7),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO available_flavors (name, description, color_hex) VALUES
  ('Dois Amores', 'Chocolate branco e ao leite em perfeita harmonia', '#A0522D'),
  ('Oreo', 'Chocolate com biscoito crocante Oreo', '#1C1C1C'),
  ('Ninho com Nutella', 'Doçura morna do Ninho com Nutella irresistível', '#D4A574'),
  ('Brigadeirão', 'Chocolate denso e cremoso do brigadeiro brasileiro', '#3D2817'),
  ('Ferreiro Rocher', 'Chocolate, Textura crocante e Nutella', '#D4AF37'),
  ('Fini Kids', 'Frutas coloridas para crianças se divertirem', '#FF69B4'),
  ('Surpresa de Uva', 'Acidez doce e surpreendente de uva verde', '#318500'),
  ('Laka Oreo', 'Cobertura crocante Laka com recheio Oreo', '#c09d00')
ON CONFLICT (name) DO NOTHING;
