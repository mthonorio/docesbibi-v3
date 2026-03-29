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

const pool = new Pool({
  connectionString,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
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

export async function query(text: string, params?: any[]) {
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
