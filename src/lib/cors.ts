import { NextResponse } from "next/server";

const DEV_ORIGINS = ["http://localhost:3000"];

/**
 * Origens confiáveis: o site em produção (NEXT_PUBLIC_BASE_URL), o preview
 * atual da Vercel (VERCEL_URL) e localhost em desenvolvimento. Nunca "*" —
 * as rotas /api/orders e /api/create-payment escrevem dados.
 */
function getAllowedOrigins(): string[] {
  const origins = new Set<string>(DEV_ORIGINS);

  if (process.env.NEXT_PUBLIC_BASE_URL) {
    origins.add(process.env.NEXT_PUBLIC_BASE_URL);
  }
  if (process.env.VERCEL_URL) {
    origins.add(`https://${process.env.VERCEL_URL}`);
  }

  return Array.from(origins);
}

function resolveOrigin(requestOrigin: string | null): string | null {
  if (!requestOrigin) return null;
  return getAllowedOrigins().includes(requestOrigin) ? requestOrigin : null;
}

function baseCorsHeaders(requestOrigin: string | null): Record<string, string> {
  const headers: Record<string, string> = {
    "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };

  const allowedOrigin = resolveOrigin(requestOrigin);
  if (allowedOrigin) {
    headers["Access-Control-Allow-Origin"] = allowedOrigin;
  }

  return headers;
}

export function addCorsHeaders(response: NextResponse, requestOrigin: string | null) {
  for (const [key, value] of Object.entries(baseCorsHeaders(requestOrigin))) {
    response.headers.set(key, value);
  }
  return response;
}

export function corsResponse(body: unknown, requestOrigin: string | null, status = 200) {
  return addCorsHeaders(NextResponse.json(body, { status }), requestOrigin);
}

export function corsOptionsResponse(requestOrigin: string | null) {
  return new NextResponse(null, {
    status: 204,
    headers: baseCorsHeaders(requestOrigin),
  });
}
