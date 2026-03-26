"use client";
import { useState, useEffect } from "react";
import { Mail, CheckCircle } from "lucide-react";
import { Header } from "@/components/molecules/Header";
import { CartSheet } from "@/components/molecules/CartSheet";
import { ProductsGrid } from "@/components/molecules/ProductsGrid";
import Footer from "@/components/molecules/Footer";

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  image: string;
  description: string;
}

interface CartItem extends Product {
  quantity: number;
}

const categoryImages: Record<string, string> = {
  chocolates: "https://static.photos/food/400x400/1",
  bolos: "https://static.photos/food/400x400/2",
  doces: "https://static.photos/food/400x400/3",
  presentes: "https://static.photos/workspace/400x400/13",
};

const products: Product[] = [
  {
    id: 1,
    name: "Barra de Chocolate Orgânico 70%",
    category: "chocolates",
    price: 28.9,
    image: "https://static.photos/food/400x400/6",
    description: "Cacau orgânico selecionado",
  },
  {
    id: 2,
    name: "Trufas Sortidas - Caixa com 12",
    category: "chocolates",
    price: 45.0,
    image: "https://static.photos/food/400x400/7",
    description: "Sabores variados artesanais",
  },
  {
    id: 3,
    name: "Bolo de Chocolate Belga",
    category: "bolos",
    price: 120.0,
    image: "https://static.photos/food/400x400/8",
    description: "Cobertura de ganache orgânico",
  },
  {
    id: 4,
    name: "Macarons Franceses - 6 unidades",
    category: "doces",
    price: 35.0,
    image: "https://static.photos/food/400x400/9",
    description: "Sabores sortidos tradicionais",
  },
  {
    id: 5,
    name: "Cesta Café da Manhã Premium",
    category: "presentes",
    price: 189.9,
    image: "https://static.photos/workspace/400x400/13",
    description: "Itens orgânicos selecionados",
  },
  {
    id: 6,
    name: "Brigadeiros Gourmet - 15 unid.",
    category: "doces",
    price: 42.0,
    image: "https://static.photos/food/400x400/14",
    description: "Chocolate belga e cacau orgânico",
  },
  {
    id: 7,
    name: "Barra Chocolate ao Leite c/ Nuts",
    category: "chocolates",
    price: 32.5,
    image: "https://static.photos/food/400x400/15",
    description: "Castanhas orgânicas crocantes",
  },
  {
    id: 8,
    name: "Bolo Red Velvet",
    category: "bolos",
    price: 135.0,
    image: "https://static.photos/food/400x400/16",
    description: "Cream cheese e baunilha natural",
  },
];

export default function Home() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [filter, setFilter] = useState("all");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; show: boolean }>({
    message: "",
    show: false,
  });
  const [scrollShadow, setScrollShadow] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrollShadow(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const showToast = (message: string) => {
    setToast({ message, show: true });
    setTimeout(() => setToast({ message: "", show: false }), 3000);
  };

  const addToCart = (productId: number) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === productId);
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === productId
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
    showToast(`${product.name} adicionado ao carrinho!`);
  };

  const updateQuantity = (productId: number, change: number) => {
    setCart((prevCart) => {
      const updated = prevCart.map((item) =>
        item.id === productId
          ? { ...item, quantity: Math.max(0, item.quantity + change) }
          : item,
      );
      return updated.filter((item) => item.quantity > 0);
    });
  };

  const removeFromCart = (productId: number) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  };

  const filteredProducts =
    filter === "all" ? products : products.filter((p) => p.category === filter);

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  return (
    <div className="font-playfair text-marrom-800 bg-rosa-50">
      {/* Navigation */}
      <Header
        scrollShadow={scrollShadow}
        onCartOpen={() => setCartOpen(true)}
        mobileMenuOpen={mobileMenuOpen}
        onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
        onMobileMenuClose={() => setMobileMenuOpen(false)}
        totalItems={totalItems}
      />

      {/* Hero Section */}
      <section
        id="home"
        className="relative pt-20 min-h-screen flex items-center overflow-hidden"
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
            {["chocolates", "bolos", "doces", "presentes"].map((category) => (
              <div
                key={category}
                className="group cursor-pointer hover-lift"
                onClick={() => {
                  setFilter(category);
                  document
                    .getElementById("produtos")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
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
            ))}
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
              {["chocolates", "bolos", "doces", "presentes"].map((cat) => (
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
            <ProductsGrid products={filteredProducts} onAddToCart={addToCart} />
          </div>

          <div className="text-center mt-12">
            <button className="border-2 border-marrom-400 text-marrom-800 px-8 py-3 rounded-full hover:bg-marrom-800 hover:text-white transition-all duration-300 font-semibold">
              Ver Mais Produtos
            </button>
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
                Confeitaria Artesanal
              </span>
              <h2 className="font-serif text-4xl font-bold text-marrom-900 mb-6">
                Nossa História
              </h2>
              <p className="text-marrom-600 mb-4 leading-relaxed">
                Fundada em 2019, a Doces Bibi nasceu do sonho de criar doces que
                não apenas satisfaçam o paladar, mas também proporcionem
                momentos memóveis e especiais.
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

      {/* Footer */}
      <Footer />

      {/* Cart Sheet */}
      <CartSheet
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        items={cart}
        totalPrice={totalPrice}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeFromCart}
      />

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
