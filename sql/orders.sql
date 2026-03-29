-- Extensão para UUID (já vem ativada no Supabase)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Criar tipo enum para status de pedido
CREATE TYPE order_status AS ENUM (
  'pendente',
  'confirmado',
  'enviado',
  'entregue',
  'cancelado'
);

-- Tabela de Pedidos
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(20),
  customer_address TEXT NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  status order_status NOT NULL DEFAULT 'pendente',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Itens do Pedido
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  product_name VARCHAR(255) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  quantity INT NOT NULL CHECK (quantity > 0),
  subtotal DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_orders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at
CREATE TRIGGER orders_update_timestamp
BEFORE UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION update_orders_updated_at();

-- Função para recalcular total do pedido
CREATE OR REPLACE FUNCTION recalculate_order_total()
RETURNS TRIGGER AS $$
DECLARE
  new_total DECIMAL(10, 2);
BEGIN
  SELECT COALESCE(SUM(subtotal), 0)
  INTO new_total
  FROM order_items
  WHERE order_id = CASE 
    WHEN TG_OP = 'DELETE' THEN OLD.order_id
    ELSE NEW.order_id
  END;
  
  UPDATE orders 
  SET total_price = new_total,
      updated_at = CURRENT_TIMESTAMP
  WHERE id = CASE 
    WHEN TG_OP = 'DELETE' THEN OLD.order_id
    ELSE NEW.order_id
  END;
  
  RETURN CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END;
END;
$$ LANGUAGE plpgsql;

-- Trigger para recalcular total quando adiciona/remove itens
CREATE TRIGGER order_items_update_total
AFTER INSERT OR DELETE ON order_items
FOR EACH ROW
EXECUTE FUNCTION recalculate_order_total();

-- Dados de exemplo (opcional)
INSERT INTO orders (customer_name, customer_email, customer_phone, customer_address, status)
VALUES
  ('João Silva', 'joao@example.com', '11999999999', 'Rua A, 123 - São Paulo, SP', 'confirmado')
ON CONFLICT DO NOTHING;
