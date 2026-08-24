import { describe, it, expect } from "vitest";
import { isProductPubliclyVisible } from "./products-visibility";

// Os 6 casos da SPEC de Categorias Especiais/Eventos (seção 20).
describe("isProductPubliclyVisible", () => {
  it("caso 1: produto ativo sem evento -> visível", () => {
    expect(isProductPubliclyVisible(true, null)).toBe(true);
  });

  it("caso 2: produto ativo + evento ativo -> visível", () => {
    expect(isProductPubliclyVisible(true, true)).toBe(true);
  });

  it("caso 3: produto ativo + evento desativado -> oculto", () => {
    expect(isProductPubliclyVisible(true, false)).toBe(false);
  });

  it("caso 4: produto desativado + evento ativo -> oculto", () => {
    expect(isProductPubliclyVisible(false, true)).toBe(false);
  });

  it("caso 5: evento reativado com produto ativo -> volta a ficar visível", () => {
    // mesma função, evento passando de false -> true: não há estado
    // "preso" no produto, a visibilidade é recalculada do zero.
    expect(isProductPubliclyVisible(true, false)).toBe(false);
    expect(isProductPubliclyVisible(true, true)).toBe(true);
  });

  it("caso 6: produto removido do evento respeita só o próprio active", () => {
    expect(isProductPubliclyVisible(true, null)).toBe(true);
    expect(isProductPubliclyVisible(false, null)).toBe(false);
  });
});
