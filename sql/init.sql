-- Criar tabela de produtos
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  image VARCHAR(500) NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);

-- Inserir dados de exemplo (opcional)
INSERT INTO products (name, category, price, image, description)
VALUES
  -- Categoria: Personalizados - Docinho Artesanal de Leite em Pó
  ('Docinhos Artesanais de Leite em Pó Modelados - 50 unidades', 'personalizados', 150.00, 'https://nibzwcpdpqzwigkocgio.supabase.co/storage/v1/object/public/images/modelado_personalizado%20(1).png', 'Docinhos artesanais modelados manualmente, feitos com leite em pó premium. Perfeito para eventos e celebrações.'),
  ('Docinhos Artesanais de Leite em Pó Modelados - 100 unidades', 'personalizados', 250.00, 'https://nibzwcpdpqzwigkocgio.supabase.co/storage/v1/object/public/images/Captura%20de%20tela%202026-03-27%20141550%20(1).png', 'Docinhos artesanais modelados manualmente, feitos com leite em pó premium. Ideal para festas e casamentos.'),
  ('Docinhos Artesanais de Leite em Pó Carimbados - 50 unidades', 'personalizados', 150.00, 'https://nibzwcpdpqzwigkocgio.supabase.co/storage/v1/object/public/images/carimbado%20(1).png', 'Docinhos artesanais com carimbo personalizado, feitos com leite em pó premium. Um toque especial para sua celebração.'),
  ('Docinhos Artesanais de Leite em Pó Carimbados - 100 unidades', 'personalizados', 250.00, 'https://nibzwcpdpqzwigkocgio.supabase.co/storage/v1/object/public/images/Captura%20de%20tela%202026-03-27%20141700%20(1).png', 'Docinhos artesanais com carimbo personalizado, feitos com leite em pó premium. Quantidade generosa com acabamento impecável.'),
  -- Categoria: Personalizados - Brigadeiro de Leite Ninho
  ('Brigadeiro de Leite Ninho Modelado - 50 unidades', 'personalizados', 105.00, 'https://nibzwcpdpqzwigkocgio.supabase.co/storage/v1/object/public/images/modelado_personalizado%20(1).png', 'Brigadeiro suave de Leite Ninho, modelado manualmente. Uma delícia cremosa e irresistível para seus eventos.'),
  ('Brigadeiro de Leite Ninho Modelado - 100 unidades', 'personalizados', 185.00, 'https://nibzwcpdpqzwigkocgio.supabase.co/storage/v1/object/public/images/Captura%20de%20tela%202026-03-27%20141550%20(1).png', 'Brigadeiro suave de Leite Ninho, modelado manualmente em grande quantidade. Perfeito para casamentos e festas corporativas.'),
  ('Brigadeiro de Leite Ninho Carimbado - 50 unidades', 'personalizados', 105.00, 'https://nibzwcpdpqzwigkocgio.supabase.co/storage/v1/object/public/images/carimbado%20(1).png', 'Brigadeiro suave de Leite Ninho com carimbo personalizado. Toque de elegância em cada docinhos.'),
  ('Brigadeiro de Leite Ninho Carimbado - 100 unidades', 'personalizados', 185.00, 'https://nibzwcpdpqzwigkocgio.supabase.co/storage/v1/object/public/images/Captura%20de%20tela%202026-03-27%20141700%20(1).png', 'Brigadeiro suave de Leite Ninho com carimbo personalizado. Quantidade especial para grandes eventos.'),
  -- Categoria: Tradicionais
  ('Brigadeiro Preto - 50 unidades', 'tradicionais', 90.00, 'https://nibzwcpdpqzwigkocgio.supabase.co/storage/v1/object/public/images/brigadeiro_trad%20(1).png', 'Brigadeiro clássico feito com chocolate premium. Sabor intenso e irresistível.'),
  ('Brigadeiro Branco - 50 unidades', 'tradicionais', 90.00, 'https://nibzwcpdpqzwigkocgio.supabase.co/storage/v1/object/public/images/brigadeiro-branco_trad%20(1).png', 'Brigadeiro de leite condensado cremoso. Suave e delicioso para todos os paladares.'),
  ('Beijinho - 50 unidades', 'tradicionais', 90.00, 'https://nibzwcpdpqzwigkocgio.supabase.co/storage/v1/object/public/images/beijinho_trad%20(1).png', 'Beijinho de coco com cobertura de granulado. Doce, macio e envolvente.'),
  ('Brigadeiro Preto - 100 unidades', 'tradicionais', 140.00, 'https://nibzwcpdpqzwigkocgio.supabase.co/storage/v1/object/public/images/brigadeiro_trad%20(1).png', 'Brigadeiro clássico feito com chocolate premium. Sabor intenso e irresistível.'),
  ('Brigadeiro Branco - 100 unidades', 'tradicionais', 140.00, 'https://nibzwcpdpqzwigkocgio.supabase.co/storage/v1/object/public/images/brigadeiro-branco_trad%20(1).png', 'Brigadeiro de leite condensado cremoso. Suave e delicioso para todos os paladares.'),
  ('Beijinho - 100 unidades', 'tradicionais', 140.00, 'https://nibzwcpdpqzwigkocgio.supabase.co/storage/v1/object/public/images/beijinho_trad%20(1).png', 'Beijinho de coco com cobertura de granulado. Doce, macio e envolvente.'),
  -- Categoria: Gourmet
  ('Ninho com Nutella - 50 unidades', 'gourmet', 90.00, 'https://nibzwcpdpqzwigkocgio.supabase.co/storage/v1/object/public/images/ninho-nutella%20(1).png', 'Docinho de Ninho com roseta de Nutella. Combinação irresistível.'),
  ('Crocante - 50 unidades', 'gourmet', 90.00, 'https://nibzwcpdpqzwigkocgio.supabase.co/storage/v1/object/public/images/crocante%20(1).png', 'Docinho de cobertura crocante e recheio de chocolate. Textura explosiva.'),
  ('Casadinho - 50 unidades', 'gourmet', 90.00, 'https://nibzwcpdpqzwigkocgio.supabase.co/storage/v1/object/public/images/Generated%20Image%20March%2027,%202026%20-%203_14PM%20(1).png', 'Docinho de chocolate branco com chocolate preto. Elegância em cada mordida.'),
  ('Moranguinho - 50 unidades', 'gourmet', 90.00, 'https://nibzwcpdpqzwigkocgio.supabase.co/storage/v1/object/public/images/moranguinho%20(1).png', 'Docinho de morango com cobertura de leite em pó. Delicioso e saboroso.'),
  ('Surpresa de Uva - 50 unidades', 'gourmet', 90.00, 'https://nibzwcpdpqzwigkocgio.supabase.co/storage/v1/object/public/images/surpresa-uva%20(1).png', 'Docinho de leite com recheio frutal de uva. Uma surpresa deliciosa.'),
  ('Churros - 50 unidades', 'gourmet', 90.00, 'https://nibzwcpdpqzwigkocgio.supabase.co/storage/v1/object/public/images/Generated%20Image%20March%2027,%202026%20-%204_30PM%20(1).png', 'Docinho com sabor de churros e doce de leite. Irresistível.'),
  ('Oreo - 50 unidades', 'gourmet', 90.00, 'https://nibzwcpdpqzwigkocgio.supabase.co/storage/v1/object/public/images/Generated%20Image%20March%2027,%202026%20-%204_29PM%20(1).png', 'Docinho de chocolate com recheio de Oreo.'),
  ('Ferreiro Rocher - 50 unidades', 'gourmet', 90.00, 'https://nibzwcpdpqzwigkocgio.supabase.co/storage/v1/object/public/images/ferreiro_rocher%20(1).png', 'Docinho com sabor de Ferreiro Rocher e Nutella. Encontro perfeito de texturas.'),
  ('Ninho com Nutella - 100 unidades', 'gourmet', 140.00, 'https://nibzwcpdpqzwigkocgio.supabase.co/storage/v1/object/public/images/ninho-nutella%20(1).png', 'Docinho de Ninho com roseta de Nutella. Combinação irresistível.'),
  ('Crocante - 100 unidades', 'gourmet', 140.00, 'https://nibzwcpdpqzwigkocgio.supabase.co/storage/v1/object/public/images/crocante%20(1).png', 'Docinho de cobertura crocante e recheio de chocolate. Textura explosiva.'),
  ('Casadinho - 100 unidades', 'gourmet', 140.00, 'https://nibzwcpdpqzwigkocgio.supabase.co/storage/v1/object/public/images/Generated%20Image%20March%2027,%202026%20-%203_14PM%20(1).png', 'Docinho de chocolate branco com chocolate preto. Elegância em cada mordida.'),
  ('Moranguinho - 100 unidades', 'gourmet', 140.00, 'https://nibzwcpdpqzwigkocgio.supabase.co/storage/v1/object/public/images/moranguinho%20(1).png', 'Docinho de morango com cobertura de leite em pó. Delicioso e saboroso.'),
  ('Surpresa de Uva - 100 unidades', 'gourmet', 140.00, 'https://nibzwcpdpqzwigkocgio.supabase.co/storage/v1/object/public/images/surpresa-uva%20(1).png', 'Docinho de leite com recheio frutal de uva. Uma surpresa deliciosa.'),
  ('Churros - 100 unidades', 'gourmet', 140.00, 'https://nibzwcpdpqzwigkocgio.supabase.co/storage/v1/object/public/images/Generated%20Image%20March%2027,%202026%20-%204_30PM%20(1).png', 'Docinho com sabor de churros e doce de leite. Irresistível.'),
  ('Oreo - 100 unidades', 'gourmet', 140.00, 'https://nibzwcpdpqzwigkocgio.supabase.co/storage/v1/object/public/images/Generated%20Image%20March%2027,%202026%20-%204_29PM%20(1).png', 'Docinho de chocolate com recheio de Oreo.'),
  ('Ferreiro Rocher - 100 unidades', 'gourmet', 140.00, 'https://nibzwcpdpqzwigkocgio.supabase.co/storage/v1/object/public/images/ferreiro_rocher%20(1).png', 'Docinho com sabor de Ferreiro Rocher e Nutella. Encontro perfeito de texturas.')
ON CONFLICT DO NOTHING;

