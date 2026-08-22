#!/usr/bin/env node
/**
 * Cria (ou atualiza a senha de) um usuário da gestora, usado pelo login em
 * /admin/login (NextAuth Credentials — ver src/lib/auth.ts).
 *
 * Uso:
 *   node scripts/create-staff-user.mjs voce@docesbibi.com.br "senha-forte" ["Seu Nome"]
 *
 * Requer DATABASE_URL no ambiente (ou em .env.local) apontando pro Postgres
 * do Railway. Se DATABASE_URL não estiver definida, o script só imprime o
 * hash e o SQL — não conecta em lugar nenhum.
 */
import bcrypt from "bcryptjs";
import { config } from "dotenv";

config({ path: ".env.local" });
config();

const [, , email, password, name] = process.argv;

if (!email || !password) {
  console.error(
    'Uso: node scripts/create-staff-user.mjs "email@dominio.com" "senha" ["Nome"]',
  );
  process.exit(1);
}

const passwordHash = await bcrypt.hash(password, 12);
const normalizedEmail = email.toLowerCase().trim();

const sql = `INSERT INTO users (email, password_hash, name)
VALUES ('${normalizedEmail}', '${passwordHash}', ${name ? `'${name.replace(/'/g, "''")}'` : "NULL"})
ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, updated_at = CURRENT_TIMESTAMP;`;

if (!process.env.DATABASE_URL) {
  console.log("DATABASE_URL não definida — só gerando o SQL abaixo:\n");
  console.log(sql);
  process.exit(0);
}

const { Pool } = await import("pg");
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_SSL === "true" ? { rejectUnauthorized: false } : undefined,
});

try {
  await pool.query(
    `INSERT INTO users (email, password_hash, name)
     VALUES ($1, $2, $3)
     ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, updated_at = CURRENT_TIMESTAMP`,
    [normalizedEmail, passwordHash, name || null],
  );
  console.log(`✅ Usuário ${normalizedEmail} criado/atualizado com sucesso.`);
} finally {
  await pool.end();
}
