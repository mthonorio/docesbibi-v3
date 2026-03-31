"use client";
import { useEffect, useState } from "react";
import {
  CheckCircle,
  Package,
  Mail,
  Clock,
  Truck,
  BarChart3,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

export default function SuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [orderNumber, setOrderNumber] = useState<string>("");
  const [email, setEmail] = useState<string>("");

  useEffect(() => {
    // Pega os parâmetros da URL
    const number =
      searchParams.get("orderNumber") ||
      "DOC-" + Math.random().toString(36).substr(2, 9).toUpperCase();
    const customerEmail = searchParams.get("email") || "";
    setOrderNumber(number);
    setEmail(customerEmail);
  }, [searchParams]);

  const estimatedDate = new Date();
  estimatedDate.setDate(estimatedDate.getDate() + 3);
  const formattedDate = estimatedDate.toLocaleDateString("pt-BR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="font-playfair text-marrom-800 bg-rosa-50 min-h-screen">
      {/* Hero Section - Success */}
      <section className="relative pt-16 sm:pt-24 pb-3 min-h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-20 right-0 w-96 h-96 bg-rosa-200 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-pulse"></div>
          <div className="absolute bottom-0 left-20 w-72 h-72 bg-rosa-300 rounded-full mix-blend-multiply filter blur-3xl opacity-70"></div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full text-center">
          {/* Success Icon */}
          <div className="mb-8 flex justify-center">
            <div className="relative w-24 h-24 md:w-28 md:h-28">
              <div className="absolute inset-0 bg-rosa-200 rounded-full animate-pulse"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <CheckCircle className="w-20 h-20 md:w-24 md:h-24 text-rosa-800 animate-bounce" />
              </div>
            </div>
          </div>

          {/* Main Heading */}
          <h1 className="font-serif text-4xl md:text-6xl font-bold text-marrom-900 mb-4">
            Compra Confirmada! 🎉
          </h1>

          <p className="text-marrom-600 text-lg mb-8 leading-relaxed max-w-2xl mx-auto">
            Obrigado pela sua compra! Seus doces artesanais estão sendo
            preparados com todo o cuidado e carinho.
          </p>

          {/* Order Number */}
          {orderNumber && (
            <div className="bg-white rounded-3xl shadow-lg p-8 mb-12 border-2 border-rosa-200">
              <p className="text-marrom-600 text-sm font-semibold mb-2">
                NÚMERO DO PEDIDO
              </p>
              <p className="text-2xl md:text-3xl font-bold text-rosa-800 font-mono">
                {orderNumber}
              </p>
              {email && (
                <p className="text-marrom-600 text-sm mt-4">
                  Um e-mail de confirmação foi enviado para{" "}
                  <span className="font-semibold">{email}</span>
                </p>
              )}
            </div>
          )}

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="bg-rosa-800 text-white px-8 py-4 rounded-full hover:bg-vermelho-700 transition-colors font-semibold shadow-lg"
            >
              Continuar Comprando
            </Link>
            {/* <Link
              href="/orders"
              className="bg-rosa-800 text-white px-8 py-4 rounded-full hover:bg-vermelho-700 transition-colors font-semibold shadow-lg"
            >
              Rastrear Pedido
            </Link>
            <Link
              href="/"
              className="border-2 border-marrom-400 text-marrom-800 px-8 py-4 rounded-full hover:bg-marrom-800 hover:text-white transition-all duration-300 font-semibold"
            >
              Continuar Comprando
            </Link> */}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl font-bold text-marrom-900 mb-4">
              Próximos Passos
            </h2>
            <div className="w-24 h-1 bg-rosa-600 mx-auto rounded-full"></div>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              {
                icon: CheckCircle,
                title: "Pedido Confirmado",
                description: "Seu pedido foi recebido com sucesso",
                status: "completed",
              },
              {
                icon: Package,
                title: "Em Preparação",
                description: "Estamos montando seus doces fresquinhos",
                status: "in-progress",
              },
              {
                icon: Truck,
                title: "Enviado",
                description: `Saída prevista para ${formattedDate}`,
                status: "pending",
              },
              {
                icon: BarChart3,
                title: "Entregue",
                description: "Aproveite seus doces artesanais!",
                status: "pending",
              },
            ].map((step, index) => {
              const Icon = step.icon;
              const isCompleted = step.status === "completed";
              const isInProgress = step.status === "in-progress";

              return (
                <div key={index} className="relative">
                  {/* Connecting Line - Desktop (Horizontal) */}
                  {index < 3 && (
                    <div
                      className={`hidden md:block absolute top-12 left-[calc(50%+2rem)] right-[calc(-100%-2rem)] h-1 ${
                        isCompleted || isInProgress
                          ? "bg-rosa-600"
                          : "bg-marrom-200"
                      }`}
                    ></div>
                  )}

                  {/* Connecting Line - Mobile (Vertical) */}
                  {index < 3 && (
                    <div
                      className={`md:hidden absolute left-1/2 transform -translate-x-1/2 top-20 w-1 h-16 ${
                        isCompleted || isInProgress
                          ? "bg-rosa-600"
                          : "bg-marrom-200"
                      }`}
                    ></div>
                  )}

                  {/* Card */}
                  <div className="relative z-10 bg-white rounded-2xl p-6 text-center shadow-md hover:shadow-lg transition-shadow">
                    <div
                      className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                        isCompleted
                          ? "bg-rosa-200"
                          : isInProgress
                            ? "bg-rosa-100 animate-pulse"
                            : "bg-marrom-100"
                      }`}
                    >
                      <Icon
                        className={`w-8 h-8 ${
                          isCompleted || isInProgress
                            ? "text-rosa-800"
                            : "text-marrom-400"
                        }`}
                      />
                    </div>
                    <h3 className="font-semibold text-marrom-900 mb-2">
                      {step.title}
                    </h3>
                    <p className="text-sm text-marrom-600 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Info Section */}
      <section className="py-20 bg-rosa-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl shadow-lg p-8 md:p-12">
            <h2 className="font-serif text-3xl font-bold text-marrom-900 mb-8 text-center">
              Informações Importantes
            </h2>

            <div className="grid md:grid-cols-2 gap-12">
              {[
                {
                  icon: Clock,
                  title: "Tempo de Preparação",
                  content:
                    "Nossos doces são feitos sob encomenda para garantir máxima frescura e qualidade.",
                },
                {
                  icon: Truck,
                  title: "Entrega",
                  content:
                    "Entregamos em toda a região. O prazo estimado é de 3 a 5 dias úteis.",
                },
                {
                  icon: Mail,
                  title: "Atualizações",
                  content:
                    "Você receberá e-mails com atualizações do seu pedido. Confira seu spam se necessário!",
                },
                {
                  icon: Package,
                  title: "Qualidade",
                  content:
                    "Todos os produtos são embalados com cuidado para chegar em perfeito estado.",
                },
              ].map((info, index) => {
                const Icon = info.icon;
                return (
                  <div key={index} className="flex gap-4">
                    <div className="shrink-0">
                      <div className="w-12 h-12 bg-rosa-200 rounded-full flex items-center justify-center">
                        <Icon className="w-6 h-6 text-rosa-800" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-marrom-900 mb-2">
                        {info.title}
                      </h3>
                      <p className="text-marrom-600 text-sm leading-relaxed">
                        {info.content}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20 bg-marrom-800 text-white relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <Mail className="w-16 h-16 text-rosa-600 mx-auto mb-6" />
          <h2 className="font-serif text-4xl font-bold mb-4">
            Não perca novidades e ofertas
          </h2>
          <p className="text-marrom-200 mb-8 text-lg">
            Cadastre-se para receber receitas exclusivas, lançamentos e
            descontos especiais para seus próximos pedidos.
          </p>

          <form
            className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto"
            onSubmit={(e) => {
              e.preventDefault();
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

      {/* Contact Section */}
      <section className="py-20 bg-white border-t-2 border-rosa-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl font-bold text-marrom-900 mb-4">
              Precisa de Ajuda?
            </h2>
            <p className="text-marrom-600 text-lg">
              Entre em contato conosco através de qualquer canal abaixo
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 text-center">
            {[
              {
                title: "E-mail",
                value: "docesbibii@gmail.com",
                link: "mailto:docesbibii@gmail.com",
              },
              {
                title: "WhatsApp",
                value: "(83) 9 8651-3392",
                link: "https://wa.me/5583986513392",
              },
              {
                title: "Instagram",
                value: "@doce_sbibi",
                link: "https://instagram.com/doce_sbibi",
              },
            ].map((contact, index) => (
              <div key={index}>
                <h3 className="font-semibold text-marrom-900 mb-2">
                  {contact.title}
                </h3>
                <a
                  href={contact.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-rosa-800 hover:text-vermelho-700 font-semibold transition-colors"
                >
                  {contact.value}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
