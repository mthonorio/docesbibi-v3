"use client";
import { useState, useEffect } from "react";
import { Mail, CheckCircle } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { ProductsGrid } from "@/components/molecules/ProductsGrid";
import { useCartStore } from "@/store/cart.store";
import { productApi } from "@/api/products";
import { categoryImages } from "@/constants/products";
import type { Product } from "@/types/api";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [filter, setFilter] = useState("all");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; show: boolean }>({
    message: "",
    show: false,
  });

  // Easter promotional banners
  const easterBanners = [
    {
      id: 1,
      title: "Coleção Especial de Páscoa",
      image:
        "https://nibzwcpdpqzwigkocgio.supabase.co/storage/v1/object/public/images/banner_easter.png",
      link: "/easter",
    },
    {
      id: 2,
      title: "Coleção Especial de Páscoa 2",
      image:
        "https://nibzwcpdpqzwigkocgio.supabase.co/storage/v1/object/public/images/banner_easter_2.png",
      link: "/easter",
    },
  ];

  // Use global stores
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

  const handleCategoryFilter = (category: string) => {
    if (category === "pascoa") {
      router.push("/easter");
      return;
    }

    setFilter(category);
    const el = document.getElementById("produtos");
    el?.scrollIntoView({ behavior: "smooth" });
  };

  const filteredProducts =
    filter === "all" ? products : products.filter((p) => p.category === filter);

  return (
    <div className="font-playfair text-marrom-800 bg-rosa-50">
      {/* Hero Section */}
      <section
        id="home"
        className="relative pt-20 pb-3 min-h-screen flex items-center overflow-hidden"
      >
        <div className="absolute inset-0 z-0">
          <div className="absolute top-20 right-0 w-96 h-96 bg-rosa-200 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-pulse"></div>
          <div className="absolute bottom-0 left-20 w-72 h-72 bg-rosa-300 rounded-full mix-blend-multiply filter blur-3xl opacity-70"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="fade-in-section is-visible">
              <span className="text-vermelho-700 font-semibold tracking-wider uppercase text-sm mb-4 block">
                Confeitaria Artesanal
              </span>
              <h1 className="font-serif text-5xl md:text-7xl font-bold text-brown-900 mb-6 leading-tight">
                Doçura em sua forma mais{" "}
                <span className="text-gradient italic">pura</span>
              </h1>
              <p className="text-marrom-600 text-lg mb-8 leading-relaxed">
                Confeitaria artesanal com ingredientes selecionados. Cada
                produto é feito com amor e dedicação para oferecer a melhor
                experiência de sabor.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => {
                    const el = document.getElementById("produtos");
                    el?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="bg-rosa-800 text-white px-8 py-4 rounded-full hover:bg-vermelho-700 transition-colors font-semibold shadow-lg"
                >
                  Explorar Produtos
                </button>
                <button
                  onClick={() => {
                    const el = document.getElementById("sobre");
                    el?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="border-2 border-marrom-400 text-marrom-800 px-8 py-4 rounded-full hover:bg-marrom-800 hover:text-white transition-all duration-300 font-semibold"
                >
                  Conheça Nossa História
                </button>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 from-rosa-200 to-rosa-100 rounded-3xl blur-3xl opacity-50"></div>
              <img
                src="https://static.photos/food/400x400/18"
                alt="Doces premium"
                className="relative rounded-3xl blob-shape shadow-2xl w-full h-auto hover-lift"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Easter Banner Carousel */}
      <section className="py-8 bg-gradient-to-r from-rosa-600 to-rosa-800">
        <div className="max-w-7xl mx-auto px-0 sm:px-6 lg:px-8">
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            navigation
            pagination={{ clickable: true }}
            autoplay={{
              delay: 5000,
              disableOnInteraction: false,
            }}
            className="rounded-2xl shadow-xl"
            style={
              {
                "--swiper-navigation-color": "white",
                "--swiper-pagination-bullet-inactive-color":
                  "rgba(255, 255, 255, 0.5)",
                "--swiper-pagination-bullet-inactive-width": "8px",
                "--swiper-pagination-bullet-width": "8px",
              } as React.CSSProperties
            }
          >
            {easterBanners.map((banner) => (
              <SwiperSlide key={banner.id} className="!h-auto">
                <Link
                  href={banner.link}
                  className="block group overflow-hidden rounded-2xl"
                >
                  <img
                    src={banner.image}
                    alt={banner.title}
                    className="w-full h-auto object-cover transition-transform duration-500"
                  />
                </Link>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Easter CTA */}
          <div className="mt-8 text-center">
            <Link
              href="/easter"
              className="inline-block bg-white text-rosa-800 px-8 py-4 rounded-full font-semibold hover:bg-rosa-50 transition-colors duration-300 shadow-lg"
            >
              Explorar Páscoa
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl font-bold text-marrom-900 mb-4">
              Categorias Especiais
            </h2>
            <div className="w-24 h-1 bg-rosa-600 mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {["pascoa", "personalizados", "tradicionais", "gourmet"].map(
              (category) => (
                <div
                  key={category}
                  className="group cursor-pointer hover-lift"
                  onClick={() => handleCategoryFilter(category)}
                >
                  <div className="relative overflow-hidden rounded-2xl mb-4">
                    <img
                      src={
                        categoryImages[category as keyof typeof categoryImages]
                      }
                      alt={category}
                      className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500 rounded-2xl"
                    />
                  </div>
                  <h3 className="font-serif text-xl font-semibold text-marrom-900 text-center group-hover:text-rosa-800 transition-colors">
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </h3>
                </div>
              ),
            )}
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section id="produtos" className="py-20 bg-rosa-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center mb-12">
            <div className="mb-6 md:mb-0">
              <h2 className="font-serif text-4xl font-bold text-marrom-900">
                Produtos
              </h2>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 w-full md:w-auto">
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
              {["personalizados", "tradicionais", "gourmet"].map((cat) => (
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
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-8">
            {loading ? (
              <div className="col-span-full text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rosa-600"></div>
                <p className="text-marrom-600 text-lg">
                  Carregando produtos...
                </p>
              </div>
            ) : error ? (
              <div className="col-span-full text-center py-12">
                <p className="text-red-600 text-lg">
                  Erro ao carregar produtos: {error}
                </p>
              </div>
            ) : (
              <ProductsGrid
                products={filteredProducts}
                onAddToCart={handleAddToCart}
              />
            )}
          </div>

          <div className="text-center mt-12">
            <Link
              href="/products"
              className="border-2 border-marrom-400 text-marrom-800 px-8 py-3 rounded-full hover:bg-marrom-800 hover:text-white transition-all duration-300 font-semibold"
            >
              Ver Mais Produtos
            </Link>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="sobre" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <img
                src="https://static.photos/food/400x400/20"
                alt="Nossa história"
                className="rounded-3xl shadow-2xl w-full h-auto hover-lift"
              />
            </div>

            <div>
              <span className="text-vermelho-700 font-semibold tracking-wider uppercase text-sm mb-4 block">
                Sobre nós
              </span>
              <h2 className="font-serif text-4xl font-bold text-marrom-900 mb-6">
                Arte e paixão em cada detalhe
              </h2>
              <p className="text-marrom-600 mb-4 leading-relaxed">
                Fundada em 2019, a{" "}
                <span className="font-semibold text-rosa-900">Doces Bibi</span>{" "}
                nasceu do sonho de criar doces que não apenas satisfaçam o
                paladar, mas também proporcionem momentos memóveis e especiais.
              </p>
              <p className="text-sm text-marrom-600 mb-6 leading-relaxed">
                Nossa missão é levar alegria e doçura para a vida das pessoas
                através de produtos artesanais feitos com ingredientes
                selecionados e muito amor. Cada produto é uma celebração do
                artesanato e da qualidade.
              </p>
              <div className="space-y-4">
                {[
                  "✓ Ingredientes 100% selecionados",
                  "✓ Produção artesanal",
                  "✓ Compromisso com a qualidade",
                  "✓ Receitas tradicionais e com sabor autêntico",
                ].map((item, i) => (
                  <p key={i} className="text-marrom-700 font-semibold">
                    {item}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-rosa-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl font-bold text-marrom-900 mb-4">
              O que nossos clientes dizem
            </h2>
            <div className="w-24 h-1 bg-rosa-600 mx-auto rounded-full"></div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Maria Silva",
                text: "Os doces da Doces Bibi transformaram meu aniversário! Qualidade de excelente e sabor incomparável.",
                rating: 5,
              },
              {
                name: "João Santos",
                text: "Presentei minha esposa com a cesta premium e ela ficou encantada. Voltarei a comprar com certeza!",
                rating: 5,
              },
              {
                name: "Ana Costa",
                text: "Ingredientes orgânicos de verdade! Posso saborear a diferença em cada produto. Muito bom!",
                rating: 5,
              },
            ].map((testimonial, i) => (
              <div
                key={i}
                className="bg-white p-8 rounded-3xl shadow-lg hover-lift"
              >
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, j) => (
                    <span key={j} className="text-rosa-800 text-lg">
                      ★
                    </span>
                  ))}
                </div>
                <p className="text-marrom-600 mb-6 italic">
                  "{testimonial.text}"
                </p>
                <p className="font-semibold text-marrom-900">
                  {testimonial.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-20 bg-marrom-800 text-white relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <Mail className="w-16 h-16 text-rosa-600 mx-auto mb-6" />
          <h2 className="font-serif text-4xl font-bold mb-4">
            Receba novidades e ofertas especiais
          </h2>
          <p className="text-marrom-200 mb-8 text-lg">
            Cadastre-se para receber receitas exclusivas, lançamentos e
            descontos especiais.
          </p>

          <form
            className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto"
            onSubmit={(e) => {
              e.preventDefault();
              showToast("Cadastro realizado com sucesso!");
              (e.target as HTMLFormElement).reset();
            }}
          >
            <input
              type="email"
              placeholder="Seu melhor e-mail"
              required
              className="flex-1 px-6 py-4 rounded-full text-marrom-900 bg-white focus:outline-none focus:ring-2 focus:ring-rosa-600"
            />
            <button
              type="submit"
              className="bg-rosa-800 hover:bg-vermelho-700 text-white px-8 py-4 rounded-full font-semibold transition-all duration-300 shadow-lg"
            >
              Inscrever
            </button>
          </form>
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
