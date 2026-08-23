"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { Mail, Lock } from "lucide-react";

function EntrarPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/pedidos";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("customer", {
        email,
        password,
        redirect: false,
      });

      if (!result || result.error) {
        setError("E-mail ou senha inválidos.");
        return;
      }

      router.push(redirectTo);
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao entrar. Tente novamente.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-4 py-16 font-playfair sm:px-6">
      <h1 className="mb-1.5 text-center font-serif text-3xl text-marrom-900">
        Entrar
      </h1>
      <p className="mb-8 text-center text-sm text-marrom-500">
        Acesse sua conta para ver seus pedidos.
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
            <Mail className="mr-1.5 -mt-0.5 inline h-3.5 w-3.5" />
            E-mail
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="username"
            disabled={loading}
            className="w-full rounded-xl border border-rosa-100 px-4 py-3 text-sm focus:border-rosa-800 focus:outline-none"
            placeholder="seu@email.com"
          />
        </div>

        <div className="mb-2">
          <label className="mb-1.5 block text-xs font-bold text-marrom-900">
            <Lock className="mr-1.5 -mt-0.5 inline h-3.5 w-3.5" />
            Senha
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            disabled={loading}
            className="w-full rounded-xl border border-rosa-100 px-4 py-3 text-sm focus:border-rosa-800 focus:outline-none"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full rounded-full bg-gradient-to-br from-rosa-800 to-rosa-700 py-3.5 text-sm font-bold text-white shadow-md disabled:opacity-60"
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>

        <p className="mt-5 text-center text-sm text-marrom-600">
          Ainda não tem conta?{" "}
          <Link href="/cadastro" className="font-bold text-rosa-800 hover:underline">
            Cadastre-se
          </Link>
        </p>
      </form>
    </div>
  );
}

export default function EntrarPage() {
  return (
    <Suspense fallback={null}>
      <EntrarPageContent />
    </Suspense>
  );
}
