"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { User, Mail, Phone, Lock } from "lucide-react";

export default function CadastroPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone || undefined,
          password: formData.password,
        }),
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Erro ao criar conta");
      }

      const signInResult = await signIn("customer", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (!signInResult || signInResult.error) {
        // Conta criada, mas o login automático falhou — manda pro /entrar
        // em vez de deixar a pessoa presa numa tela sem saída.
        router.push("/entrar");
        return;
      }

      router.push("/pedidos");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar conta");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-4 py-16 font-playfair sm:px-6">
      <h1 className="mb-1.5 text-center font-serif text-3xl text-marrom-900">
        Criar conta
      </h1>
      <p className="mb-8 text-center text-sm text-marrom-500">
        Acompanhe seus pedidos com facilidade.
      </p>

      <form
        onSubmit={handleSubmit}
        className="rounded-3xl bg-white p-8 shadow-[0_8px_22px_-14px_rgba(62,39,35,0.15)]"
      >
        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="mb-4">
          <label className="mb-1.5 block text-xs font-bold text-marrom-900">
            <User className="mr-1.5 -mt-0.5 inline h-3.5 w-3.5" />
            Nome completo
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            disabled={loading}
            className="w-full rounded-xl border border-rosa-100 px-4 py-3 text-sm focus:border-rosa-800 focus:outline-none"
            placeholder="Maria Silva"
          />
        </div>

        <div className="mb-4">
          <label className="mb-1.5 block text-xs font-bold text-marrom-900">
            <Mail className="mr-1.5 -mt-0.5 inline h-3.5 w-3.5" />
            E-mail
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            autoComplete="username"
            disabled={loading}
            className="w-full rounded-xl border border-rosa-100 px-4 py-3 text-sm focus:border-rosa-800 focus:outline-none"
            placeholder="seu@email.com"
          />
        </div>

        <div className="mb-4">
          <label className="mb-1.5 block text-xs font-bold text-marrom-900">
            <Phone className="mr-1.5 -mt-0.5 inline h-3.5 w-3.5" />
            Telefone (opcional)
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            disabled={loading}
            className="w-full rounded-xl border border-rosa-100 px-4 py-3 text-sm focus:border-rosa-800 focus:outline-none"
            placeholder="(11) 99999-9999"
          />
        </div>

        <div className="mb-2">
          <label className="mb-1.5 block text-xs font-bold text-marrom-900">
            <Lock className="mr-1.5 -mt-0.5 inline h-3.5 w-3.5" />
            Senha
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            minLength={6}
            autoComplete="new-password"
            disabled={loading}
            className="w-full rounded-xl border border-rosa-100 px-4 py-3 text-sm focus:border-rosa-800 focus:outline-none"
            placeholder="Mínimo 6 caracteres"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full rounded-full bg-gradient-to-br from-rosa-800 to-rosa-700 py-3.5 text-sm font-bold text-white shadow-md disabled:opacity-60"
        >
          {loading ? "Criando conta..." : "Criar conta"}
        </button>

        <p className="mt-5 text-center text-sm text-marrom-600">
          Já tem conta?{" "}
          <Link href="/entrar" className="font-bold text-rosa-800 hover:underline">
            Entrar
          </Link>
        </p>
      </form>
    </div>
  );
}
