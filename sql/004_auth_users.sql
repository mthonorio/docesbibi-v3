-- Tabela de usuários da gestora (login em /admin/login, protege /orders).
-- Substitui o Supabase Auth: agora o app é dono da própria tabela de auth,
-- consultada por src/lib/auth.ts (NextAuth Credentials provider).
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Não insere nenhum usuário aqui de propósito — a senha nunca deve estar em
-- texto plano num arquivo versionado. Para criar o primeiro usuário, rode:
--   node scripts/create-staff-user.mjs voce@docesbibi.com.br "sua-senha"
-- (ver src/docs/AUTH_GUIDE.md)
