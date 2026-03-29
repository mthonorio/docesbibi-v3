"use client";
import { useState, useEffect } from "react";
import { CheckCircle } from "lucide-react";
import { ProductsGrid } from "@/components/molecules/ProductsGrid";
import { useCartStore } from "@/store/cart.store";
import { productApi } from "@/api/products";
import type { Product } from "@/types/api";

export default function ProductsPage() {
  const [filter, setFilter] = useState("all");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; show: boolean }>({
    message: "",
    show: false,
  });

  const { addToCart } = useCartStore();

  // Buscar produtos da API ao montar o componente
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const data = await productApi.getAll();
        setProducts(data);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Erro ao carregar produtos",
        );
        console.error("Erro ao buscar produtos:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const showToast = (message: string) => {
    setToast({ message, show: true });
    setTimeout(() => setToast({ message: "", show: false }), 3000);
  };

  const handleAddToCart = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    addToCart(product);
    showToast(`${product.name} adicionado ao carrinho!`);
  };

  const filteredProducts =
    filter === "all" ? products : products.filter((p) => p.category === filter);

  return (
    <div className="font-playfair text-marrom-800 bg-rosa-50 min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-32 pb-12 bg-rosa-50">
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute top-20 right-0 w-96 h-96 bg-rosa-200 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-pulse"></div>
          <div className="absolute bottom-0 left-20 w-72 h-72 bg-rosa-300 rounded-full mix-blend-multiply filter blur-3xl opacity-70"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <h1 className="font-serif text-5xl md:text-6xl font-bold text-brown-900 mb-4">
              Todos os Produtos
            </h1>
            <p className="text-marrom-600 text-lg max-w-2xl mx-auto">
              Explore nossa coleção completa de doces artesanais, feitos com
              ingredientes selecionados e muito amor para oferecer a melhor
              experiência de sabor.
            </p>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-20 bg-rosa-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Filters */}
          <div className="mb-12">
            <div className="flex gap-2 overflow-x-auto pb-2 w-full md:w-max md:mx-0">
              <button
                onClick={() => setFilter("all")}
                className={`px-6 py-2 rounded-full whitespace-nowrap transition-colors font-semibold ${
                  filter === "all"
                    ? "bg-rosa-800 text-white"
                    : "text-marrom-700 hover:bg-rosa-200"
                }`}
              >
                Todos
              </button>
              {["pascoa", "personalizados", "tradicionais", "gourmet"].map(
                (cat) => (
                  <button
                    key={cat}
                    onClick={() => setFilter(cat)}
                    className={`px-6 py-2 rounded-full whitespace-nowrap transition-colors font-semibold ${
                      filter === cat
                        ? "bg-rosa-800 text-white"
                        : "text-marrom-700 hover:bg-rosa-200"
                    }`}
                  >
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </button>
                ),
              )}
            </div>
          </div>

          {/* Products Grid */}
          {loading ? (
            <div className="text-center py-20">
              <p className="text-marrom-600 text-lg">Carregando produtos...</p>
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <p className="text-red-600 text-lg">
                Erro ao carregar produtos: {error}
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-8">
              <ProductsGrid
                products={filteredProducts}
                onAddToCart={handleAddToCart}
              />
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && filteredProducts.length === 0 && (
            <div className="text-center py-20">
              <p className="text-marrom-600 text-lg">
                Nenhum produto encontrado nesta categoria.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Toast Notification */}
      <div
        className={`fixed bottom-6 right-6 bg-marrom-800 text-white px-6 py-3 rounded-full shadow-2xl transform transition-all duration-300 z-50 flex items-center gap-3 ${
          toast.show ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0"
        }`}
      >
        <CheckCircle className="w-5 h-5 text-rosa-300" />
        <span>{toast.message}</span>
      </div>
    </div>
  );
}
