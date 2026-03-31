"use client";

import { MercadoPagoCheckoutForm } from "@/components/forms/MercadoPagoCheckoutForm";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";

/**
 * Página de Checkout - Exemplo de integração
 *
 * Esta página demonstra como usar o MercadoPagoCheckoutForm
 * para criar um fluxo de checkout completo
 */
export default function CheckoutPage() {
  return (
    <div className="font-playfair text-marrom-800 bg-rosa-50 min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-16 sm:pt-24 pb-12 bg-rosa-50">
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute top-20 right-0 w-96 h-96 bg-rosa-200 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-pulse"></div>
          <div className="absolute bottom-0 left-20 w-72 h-72 bg-rosa-300 rounded-full mix-blend-multiply filter blur-3xl opacity-70"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex items-center gap-4 mb-6">
            <ShoppingCart className="w-8 h-8 text-rosa-800" />
            <div>
              <h1 className="font-serif text-4xl md:text-5xl font-bold text-marrom-900">
                Checkout
              </h1>
              <p className="text-marrom-600 mt-2">
                Finalize sua compra de forma segura
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Checkout Form */}
      <section className="py-20 bg-rosa-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <MercadoPagoCheckoutForm />

          {/* Info Box */}
          <div className="mt-12 bg-white rounded-2xl p-6 border-l-4 border-rosa-600">
            <h3 className="font-semibold text-marrom-900 mb-3">
              💡 Como funciona?
            </h3>
            <ol className="space-y-2 text-sm text-marrom-600">
              <li>
                <strong>1.</strong> Preencha seus dados pessoais
              </li>
              <li>
                <strong>2.</strong> Revise o resumo do seus produtos
              </li>
              <li>
                <strong>3.</strong> Clique em &quot;Pagar com Mercado Pago&quot;
              </li>
              <li>
                <strong>4.</strong> Você será redirecionado para o checkout
                seguro
              </li>
              <li>
                <strong>5.</strong> Insira os dados do seu cartão
              </li>
              <li>
                <strong>6.</strong> Confirmação instantânea da compra
              </li>
            </ol>
          </div>

          {/* Security Info */}
          <div className="mt-8 grid md:grid-cols-3 gap-6">
            {[
              {
                title: "🔒 Seguro",
                description: "Transações protegidas por criptografia SSL",
              },
              {
                title: "⚡ Rápido",
                description: "Processamento instantâneo de pagamentos",
              },
              {
                title: "✅ Confiável",
                description: "Integração oficial com Mercado Pago",
              },
            ].map((item, index) => (
              <div
                key={index}
                className="bg-white rounded-lg p-6 text-center border border-rosa-200"
              >
                <p className="text-2xl mb-2">{item.title.split(" ")[0]}</p>
                <h4 className="font-semibold text-marrom-900 mb-2">
                  {item.title.split(" ").slice(1).join(" ")}
                </h4>
                <p className="text-sm text-marrom-600">{item.description}</p>
              </div>
            ))}
          </div>

          {/* Back Button */}
          <div className="mt-12 text-center">
            <Link
              href="/"
              className="bg-rosa-800 text-white px-8 py-4 rounded-full hover:bg-vermelho-700 transition-colors font-semibold shadow-lg"
            >
              Continuar Comprando
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-serif text-3xl font-bold text-marrom-900 mb-12 text-center">
            Perguntas Frequentes
          </h2>

          <div className="space-y-6">
            {[
              {
                q: "Quais formas de pagamento vocês aceitam?",
                a: "Aceitamos cartões de crédito, débito e Mercado Pago (dinheiro, carteira, etc)",
              },
              {
                q: "Posso parcelar minha compra?",
                a: "Sim! O Mercado Pago oferece parcelamento em até 12x sem juros em alguns cartões",
              },
              {
                q: "Meu pagamento foi recusado, e agora?",
                a: "Tente novamente com outro cartão. Se o problema persistir, entre em contato com seu banco",
              },
              {
                q: "Quanto tempo leva para processar?",
                a: "O pagamento é processado instantaneamente. Você receberá confirmação por e-mail",
              },
              {
                q: "Meus dados são seguros?",
                a: "Sim! Usamos criptografia de nível bancário e nunca armazenamos dados do cartão",
              },
            ].map((faq, index) => (
              <div
                key={index}
                className="border-b border-marrom-200 pb-6 last:border-b-0 last:pb-0"
              >
                <h3 className="font-semibold text-marrom-900 mb-2">{faq.q}</h3>
                <p className="text-marrom-600 text-sm">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
