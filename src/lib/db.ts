import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error(
    "❌ DATABASE_URL is not defined. Make sure you set it in your environment variables.",
  );
  throw new Error(
    "DATABASE_URL is not defined. Please configure your database connection.",
  );
}

console.log("📊 Initializing PostgreSQL connection pool...");

// Removemos "sslmode" da connection string porque versões recentes do pg
// tratam sslmode=require como alias de verify-full (validação completa da
// cadeia de certificados), o que ignora a opção `ssl` abaixo e quebra a
// conexão com "self-signed certificate in certificate chain" em provedores
// com certificado autoassinado (ex.: Supabase).
//
// O Postgres do próprio Railway (rede interna, host *.railway.internal) não
// fala SSL, então SSL é opt-in: liga automaticamente se a connection string
// tiver sslmode=require/verify-*, ou manualmente via DATABASE_SSL=true (útil
// se um dia a conexão for por fora da rede interna do Railway).
const connectionUrl = new URL(connectionString);
const sslMode = connectionUrl.searchParams.get("sslmode");
connectionUrl.searchParams.delete("sslmode");

const useSSL = sslMode
  ? sslMode !== "disable"
  : process.env.DATABASE_SSL === "true";

const pool = new Pool({
  connectionString: connectionUrl.toString(),
  ssl: useSSL ? { rejectUnauthorized: false } : undefined,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on("error", (err) => {
  console.error("❌ Unexpected error on idle client", err);
});

pool.on("connect", () => {
  console.log("✅ New client connected to database");
});

export async function query(text: string, params?: unknown[]) {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log("Executed query", { text, duration, rows: result.rowCount });
    return result;
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  }
}

export async function getClient() {
  return pool.connect();
}

export default pool;
