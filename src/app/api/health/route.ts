import { NextResponse } from "next/server";

/**
 * GET /api/health
 *
 * Usado pelo healthcheck do Railway (railway.toml). Não checa o Postgres de
 * propósito — um problema no banco não deve derrubar o container e entrar
 * em loop de restart.
 */
export async function GET() {
  return NextResponse.json({ status: "ok" }, { status: 200 });
}
