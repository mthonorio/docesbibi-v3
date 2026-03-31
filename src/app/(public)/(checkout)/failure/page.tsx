"use client";
import { useEffect, useState } from "react";
import {
  XCircle,
  AlertCircle,
  Mail,
  Phone,
  Home,
  HelpCircle,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

export default function FailurePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [orderNumber, setOrderNumber] = useState<string>("");
  const [email, setEmail] = useState<string>("");

  useEffect(() => {
    const number =
      searchParams.get("orderNumber") ||
      "DOC-" + Math.random().toString(36).substr(2, 9).toUpperCase();
    const customerEmail = searchParams.get("email") || "";
    setOrderNumber(number);
    setEmail(customerEmail);
  }, [searchParams]);

  return (
    <div className="font-playfair text-marrom-800 bg-rosa-50 min-h-screen">
      {/* Hero Section - Failure */}
      <section className="relative pt-16 sm:pt-24 pb-3 min-h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-20 right-0 w-96 h-96 bg-rosa-200 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-pulse"></div>
          <div className="absolute bottom-0 left-20 w-72 h-72 bg-rosa-300 rounded-full mix-blend-multiply filter blur-3xl opacity-70"></div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full text-center">
          {/* Error Icon */}
          <div className="mb-8 flex justify-center">
            <div className="relative w-24 h-24 md:w-28 md:h-28">
              <div className="absolute inset-0 bg-red-200 rounded-full animate-pulse"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <XCircle className="w-20 h-20 md:w-24 md:h-24 text-red-600" />
              </div>
            </div>
          </div>

          {/* Main Heading */}
          <h1 className="font-serif text-4xl md:text-6xl font-bold text-marrom-900 mb-4">
            Pagamento Recusado
          </h1>

          <p className="text-marrom-600 text-lg mb-8 leading-relaxed max-w-2xl mx-auto">
            Desculpe, não conseguimos processar seu pagamento. Isso pode ter
            ocorrido por diversos motivos como cartão expirado, saldo
            insuficiente ou dados incorretos.
          </p>

          {/* Order Number */}
          {orderNumber && (
            <div className="bg-white rounded-3xl shadow-lg p-8 mb-12 border-2 border-red-200">
              <p className="text-marrom-600 text-sm font-semibold mb-2">
                NÚMERO DA TENTATIVA
              </p>
              <p className="text-2xl md:text-3xl font-bold text-red-600 font-mono">
                {orderNumber}
              </p>
              {email && (
                <p className="text-marrom-600 text-sm mt-4">
                  E-mail registrado:{" "}
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
              Tentar Novamente
            </Link>
            <Link
              href="/"
              className="border-2 border-marrom-400 text-marrom-800 px-8 py-4 rounded-full hover:bg-marrom-800 hover:text-white transition-all duration-300 font-semibold"
            >
              Voltar para Home
            </Link>
          </div>
        </div>
      </section>

      {/* Reasons Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl font-bold text-marrom-900 mb-4">
              Por que meu pagamento foi recusado?
            </h2>
            <div className="w-24 h-1 bg-rosa-600 mx-auto rounded-full"></div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                icon: AlertCircle,
                title: "Dados do Cartão Incorretos",
                description:
                  "Verifique se o número do cartão, validade e CVV estão corretos.",
              },
              {
                icon: Phone,
                title: "Saldo Insuficiente",
                description:
                  "Seu cartão não possui saldo disponível para completar a compra.",
              },
              {
                icon: HelpCircle,
                title: "Cartão Expirado",
                description:
                  "Seu cartão pode estar expirado. Tente utilizar outro cartão.",
              },
              {
                icon: AlertCircle,
                title: "Transação Bloqueada",
                description:
                  "Seu banco pode ter bloqueado a transação como medida de segurança.",
              },
            ].map((reason, index) => {
              const Icon = reason.icon;
              return (
                <div
                  key={index}
                  className="bg-rosa-50 rounded-2xl p-6 border border-rosa-200"
                >
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-red-200 rounded-full flex items-center justify-center">
                        <Icon className="w-6 h-6 text-red-600" />
                      </div>
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold text-marrom-900 mb-2">
                        {reason.title}
                      </h3>
                      <p className="text-marrom-600 text-sm leading-relaxed">
                        {reason.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Solutions Section */}
      <section className="py-20 bg-rosa-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl shadow-lg p-8 md:p-12">
            <h2 className="font-serif text-3xl font-bold text-marrom-900 mb-8 text-center">
              O que você pode fazer?
            </h2>

            <div className="space-y-6">
              {[
                {
                  step: "1",
                  title: "Verifique os dados",
                  description:
                    "Confirme se todos os dados do seu cartão estão preenchidos corretamente.",
                },
                {
                  step: "2",
                  title: "Tente outro cartão",
                  description:
                    "Se disponível, utilize outro cartão de crédito ou débito para a compra.",
                },
                {
                  step: "3",
                  title: "Entre em contato com seu banco",
                  description:
                    "Seu banco pode ter bloqueado a transação. Entre em contato para autorizar.",
                },
                {
                  step: "4",
                  title: "Fale conosco",
                  description:
                    "Se o problema persistir, não hesite em nos contatar para assistência.",
                },
              ].map((solution) => (
                <div
                  key={solution.step}
                  className="flex gap-4 pb-6 border-b border-marrom-200 last:border-b-0 last:pb-0"
                >
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-rosa-200 rounded-full flex items-center justify-center">
                      <span className="font-bold text-rosa-800">
                        {solution.step}
                      </span>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-marrom-900 mb-1">
                      {solution.title}
                    </h3>
                    <p className="text-marrom-600 text-sm">
                      {solution.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
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
              Nossa equipe está aqui para ajudar você a resolver qualquer
              problema
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 text-center">
            {[
              {
                icon: Mail,
                title: "E-mail",
                value: "docesbibii@gmail.com",
                link: "mailto:docesbibii@gmail.com",
              },
              {
                icon: Phone,
                title: "WhatsApp",
                value: "(83) 9 8651-3392",
                link: "https://wa.me/5583986513392",
              },
              {
                icon: Home,
                title: "Voltar",
                value: "Ir para Home",
                link: "/",
              },
            ].map((contact, index) => (
              <div key={index}>
                <div className="mb-4 flex justify-center">
                  <div className="w-16 h-16 bg-rosa-200 rounded-full flex items-center justify-center">
                    <contact.icon className="w-8 h-8 text-rosa-800" />
                  </div>
                </div>
                <h3 className="font-semibold text-marrom-900 mb-2">
                  {contact.title}
                </h3>
                {contact.link.startsWith("mailto:") ||
                contact.link.startsWith("https://") ? (
                  <a
                    href={contact.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-rosa-800 hover:text-vermelho-700 font-semibold transition-colors"
                  >
                    {contact.value}
                  </a>
                ) : (
                  <Link
                    href={contact.link}
                    className="text-rosa-800 hover:text-vermelho-700 font-semibold transition-colors"
                  >
                    {contact.value}
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
