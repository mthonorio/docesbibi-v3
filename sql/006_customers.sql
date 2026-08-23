-- ============================================
-- Conta do comprador: tabela própria (separada de `users`, que é só a
-- gestora) + vínculo em `orders`. Ver src/lib/auth.ts (segundo provider
-- Credentials, role "customer") e src/app/api/auth/register/route.ts.
-- ============================================
-- Seguro rodar mais de uma vez (idempotente).

CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);

-- Pedidos feitos como visitante (customer_id NULL) são "reivindicados" pro
-- cliente no momento do cadastro, quando o e-mail bate — ver o UPDATE em
-- src/app/api/auth/register/route.ts.
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES customers(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
