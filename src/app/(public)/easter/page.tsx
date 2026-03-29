"use client";

import { CustomEasterEgg } from "@/components/organisms/CustomEasterEgg";

export default function EasterPage() {
  return (
    <div className="font-playfair text-marrom-800 bg-rosa-50 min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-32 pb-12 bg-rosa-50">
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute top-20 right-0 w-96 h-96 bg-rosa-200 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-pulse"></div>
          <div className="absolute bottom-0 left-20 w-72 h-72 bg-rosa-300 rounded-full mix-blend-multiply filter blur-3xl opacity-70"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 w-80 h-80 bg-amarelo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-60"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <div className="mb-6 inline-block">
              <span className="bg-rosa-900 text-white px-4 py-2 rounded-full text-sm font-semibold">
                ✨ Espaço Exclusivo Páscoa ✨
              </span>
            </div>

            <h1 className="font-serif text-5xl md:text-7xl font-bold text-marrom-900 mb-4">
              Monte seu Ovo de Páscoa Gourmet
            </h1>

            <p className="text-marrom-600 text-lg md:text-xl max-w-3xl mx-auto mb-8">
              Personalize seu ovo escolhendo entre 4 modelos impressionantes e 8
              sabores irresistíveis. Crie a combinação perfeita para celebrar a
              Páscoa com estilo e sabor.
            </p>

            <div className="flex flex-wrap justify-center gap-4 text-sm md:text-base">
              <div className="flex items-center gap-2 text-marrom-700">
                <span className="text-2xl">🥚</span>
                <span>4 Modelos</span>
              </div>
              <div className="flex items-center gap-2 text-marrom-700">
                <span className="text-2xl">🌈</span>
                <span>8 Sabores</span>
              </div>
              <div className="flex items-center gap-2 text-marrom-700">
                <span className="text-2xl">🎁</span>
                <span>100% Customizável</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Customization Section */}
      <section className="py-16 md:py-24 bg-rosa-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <CustomEasterEgg />
        </div>
      </section>

      {/* Info Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="text-center">
              <div className="text-5xl mb-4">🎨</div>
              <h3 className="text-xl font-bold text-marrom-800 mb-2">
                Crie Livremente
              </h3>
              <p className="text-marrom-600">
                Escolha quantos sabores quiser. Para Duos e Trios, podem ser
                iguais ou diferentes — você decide!
              </p>
            </div>

            {/* Card 2 */}
            <div className="text-center">
              <div className="text-5xl mb-4">📦</div>
              <h3 className="text-xl font-bold text-marrom-800 mb-2">
                4 Tamanhos
              </h3>
              <p className="text-marrom-600">
                150g, Duo 150g, Trio 50g ou o impressionante 400g. Diversas
                opções para cada ocasião.
              </p>
            </div>

            {/* Card 3 */}
            <div className="text-center">
              <div className="text-5xl mb-4">⭐</div>
              <h3 className="text-xl font-bold text-marrom-800 mb-2">
                Qualidade Premium
              </h3>
              <p className="text-marrom-600">
                Chocolate gourmet, ingredientes selecionados e muito cuidado em
                cada detalhe.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Models Showcase */}
      <section className="py-16 md:py-24 bg-rosa-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-marrom-800 text-center mb-12">
            Os 8 Sabores
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { name: "Dois Amores", color: "#A0522D" },
              { name: "Oreo", color: "#1C1C1C" },
              { name: "Ninho com Nutella", color: "#D4A574" },
              { name: "Brigadeirão", color: "#3D2817" },
              { name: "Ferreiro Rocher", color: "#D4AF37" },
              { name: "Fini Kids", color: "#FF69B4" },
              { name: "Surpresa de Uva", color: "#8B0000" },
              { name: "Laka Oreo", color: "#000000" },
            ].map((flavor) => (
              <div key={flavor.name} className="text-center">
                <div
                  className="w-24 h-24 rounded-full mx-auto mb-3 shadow-lg border-4 border-white transform hover:scale-110 transition-transform"
                  style={{ backgroundColor: flavor.color }}
                />
                <p className="font-semibold text-marrom-800 text-sm">
                  {flavor.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-marrom-800 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Já sabe qual é seu ovo?
          </h2>
          <p className="text-lg md:text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Volte ao topo, monte seu ovo perfeito e prepare-se para uma
            celebração memorável de Páscoa!
          </p>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="inline-block bg-rosa-800 hover:bg-rosa-900 text-white font-bold py-4 px-8 rounded-lg transition-colors"
          >
            🥚 Montar Meu Ovo Agora
          </a>
        </div>
      </section>
    </div>
  );
}
