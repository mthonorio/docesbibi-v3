const R2_PUBLIC_URL = process.env.NEXT_PUBLIC_R2_PUBLIC_URL?.replace(/\/$/, "");

/**
 * Monta a URL pública de uma imagem no bucket R2, a partir da mesma chave
 * (`images/<arquivo>`) usada no Supabase Storage antes da migração — ver
 * scripts/migrate-images-to-r2.mjs e src/docs/RAILWAY_DEPLOY.md.
 */
export function r2Image(key: string): string {
  if (!R2_PUBLIC_URL) {
    console.warn(
      "NEXT_PUBLIC_R2_PUBLIC_URL não configurada — imagens não vão carregar.",
    );
  }
  return `${R2_PUBLIC_URL || ""}/images/${key}`;
}
