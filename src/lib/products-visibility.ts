/**
 * Fonte única da regra de visibilidade pública de produtos (SPEC de
 * Categorias Especiais/Eventos). Um produto só aparece nas duas rotas
 * públicas de leitura (GET /api/products, GET /api/products/:id) quando:
 *
 *   active = true
 *   AND (special_category_id IS NULL OR o evento vinculado está enabled)
 *
 * Desativar um evento NUNCA mexe em products.active — só some da consulta
 * pública enquanto o evento estiver desabilitado.
 *
 * Duas formas da MESMA regra, que precisam ficar em sincronia:
 * - PUBLIC_PRODUCT_*_SQL: o que as rotas realmente executam no Postgres.
 * - isProductPubliclyVisible: espelho em TS, só pra dar pra testar a regra
 *   sem precisar de um banco rodando (ver products-visibility.test.ts).
 */

export const PUBLIC_PRODUCT_JOIN_SQL =
  "LEFT JOIN special_categories sc ON sc.id = p.special_category_id";

export const PUBLIC_PRODUCT_VISIBILITY_SQL =
  "p.active = true AND (p.special_category_id IS NULL OR sc.enabled = true)";

/**
 * @param active `products.active`
 * @param specialCategoryEnabled `null` quando o produto não pertence a
 *   nenhum evento (`special_category_id IS NULL`); senão o `enabled` do
 *   evento vinculado.
 */
export function isProductPubliclyVisible(
  active: boolean,
  specialCategoryEnabled: boolean | null,
): boolean {
  return active && (specialCategoryEnabled === null || specialCategoryEnabled === true);
}
