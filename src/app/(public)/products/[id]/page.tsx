"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, Minus, Plus, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/store/cart.store";
import { formatCurrency } from "@/functions/currency";
import type { Product, ApiResponse } from "@/types/api";

export default function ProductDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { addToCart } = useCartStore();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/products/${params.id}`);
        const result: ApiResponse<Product> = await response.json();

        if (!response.ok || !result.success || !result.data) {
          throw new Error(result.error || "Produto não encontrado");
        }
        if (!cancelled) setProduct(result.data);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Erro ao carregar produto");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    if (params.id) fetchProduct();
    return () => {
      cancelled = true;
    };
  }, [params.id]);

  const isOutOfStock = product ? product.stock === 0 : false;

  const handleAddToCart = () => {
    if (!product || isOutOfStock) return;
    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-t-2 border-b-2 border-rosa-600" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-marrom-600">{error || "Produto não encontrado"}</p>
        <button
          onClick={() => router.push("/products")}
          className="rounded-full bg-rosa-800 px-6 py-3 font-semibold text-white hover:bg-vermelho-700"
        >
          Ver todos os produtos
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white pb-28 font-playfair text-marrom-800 md:pb-16">
      <div className="mx-auto max-w-5xl px-4 pt-6 sm:px-6 lg:px-8">
        <button
          onClick={() => router.back()}
          className="mb-4 flex items-center gap-1.5 text-sm font-semibold text-marrom-600 hover:text-rosa-800"
        >
          <ChevronLeft className="h-4 w-4" /> Voltar
        </button>

        <div className="grid gap-10 md:grid-cols-2">
          {/* Image */}
          <div className="aspect-square overflow-hidden rounded-3xl bg-rosa-50">
            <img
              src={product.image}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          </div>

          {/* Info */}
          <div>
            <span className="mb-2.5 inline-block rounded-full bg-rosa-50 px-3 py-1 text-xs font-bold text-rosa-900">
              {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
            </span>
            <h1 className="font-serif text-3xl leading-tight text-marrom-900">
              {product.name}
            </h1>
            <p className="mt-3 leading-relaxed text-marrom-500">
              {product.description}
            </p>

            <div className="mt-6 border-t border-rosa-100 pt-6">
              <span className="text-3xl font-bold text-vermelho-700">
                {formatCurrency(product.price)}
              </span>
              {isOutOfStock && (
                <span className="ml-3 inline-block rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-700">
                  Esgotado
                </span>
              )}
            </div>

            {/* Quantity */}
            <div className="mt-6">
              <span className="mb-2.5 block text-sm font-bold text-marrom-900">
                Quantidade
              </span>
              <div className="inline-flex items-center overflow-hidden rounded-full border-2 border-rosa-100">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="flex h-11 w-11 items-center justify-center bg-rosa-50"
                  aria-label="Diminuir quantidade"
                >
                  <Minus className="h-4 w-4 text-marrom-900" strokeWidth={2.5} />
                </button>
                <span className="w-12 text-center font-bold">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="flex h-11 w-11 items-center justify-center bg-rosa-50"
                  aria-label="Aumentar quantidade"
                >
                  <Plus className="h-4 w-4 text-marrom-900" strokeWidth={2.5} />
                </button>
              </div>
            </div>

            {/* CTA (desktop inline) */}
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className="mt-8 hidden w-full items-center justify-center gap-2 rounded-full bg-gradient-to-br from-rosa-800 to-rosa-700 py-4 font-bold text-white shadow-lg hover:shadow-xl disabled:opacity-50 md:flex"
            >
              <ShoppingBag className="h-[18px] w-[18px]" />
              {isOutOfStock
                ? "Produto esgotado"
                : added
                  ? "Adicionado! ✓"
                  : `Adicionar ao carrinho — ${formatCurrency(product.price * quantity)}`}
            </button>
          </div>
        </div>
      </div>

      {/* Sticky CTA (mobile) */}
      <div className="fixed inset-x-0 bottom-24 z-30 border-t border-rosa-100 bg-white px-5 py-4 shadow-[0_-8px_24px_-12px_rgba(62,39,35,0.2)] md:hidden">
        <button
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-br from-rosa-800 to-rosa-700 py-4 font-bold text-white shadow-lg disabled:opacity-50"
        >
          <ShoppingBag className="h-[18px] w-[18px]" />
          {isOutOfStock
            ? "Produto esgotado"
            : added
              ? "Adicionado! ✓"
              : `Adicionar — ${formatCurrency(product.price * quantity)}`}
        </button>
      </div>
    </div>
  );
}
