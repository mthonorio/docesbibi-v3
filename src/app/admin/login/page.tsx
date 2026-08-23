"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/admin/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
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
    <div className="relative flex min-h-screen overflow-hidden bg-gradient-to-br from-marrom-900 to-marrom-700">
      <div className="pointer-events-none absolute -right-32 -top-32 h-[400px] w-[400px] rounded-full bg-rosa-800/15" />
      <div className="pointer-events-none absolute bottom-[-150px] left-[280px] h-[380px] w-[380px] rounded-full bg-rosa-800/10" />

      {/* Left brand panel */}
      <div className="relative z-10 hidden w-[640px] flex-col justify-center px-20 lg:flex">
        <span className="mb-6 font-serif text-2xl font-bold text-white">
          Doces Bibi
        </span>
        <h1 className="mb-4 font-serif text-4xl leading-tight text-white">
          Área da
          <br />
          <em className="text-rosa-600 not-italic italic">gestora</em>
        </h1>
        <p className="max-w-sm text-[15px] leading-relaxed text-marrom-100">
          Acompanhe pedidos, vendas e a operação da confeitaria em um só
          lugar.
        </p>
      </div>

      {/* Right form panel */}
      <div className="relative z-10 flex flex-1 items-center justify-center rounded-l-[32px] bg-white px-6">
        <form onSubmit={handleSubmit} className="w-full max-w-[360px]">
          <h2 className="mb-1.5 font-serif text-2xl text-marrom-900">
            Bem-vinda de volta
          </h2>
          <p className="mb-8 text-[13.5px] text-marrom-500">
            Entre para gerenciar os pedidos da Doces Bibi.
          </p>

          {error && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="mb-[18px]">
            <label className="mb-1.5 block text-xs font-bold text-marrom-900">
              E-mail
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="username"
              disabled={loading}
              className="w-full rounded-xl border border-rosa-100 px-4 py-3.5 text-sm text-marrom-900 focus:border-rosa-800 focus:outline-none"
              placeholder="voce@docesbibi.com.br"
            />
          </div>

          <div className="mb-2.5">
            <label className="mb-1.5 block text-xs font-bold text-marrom-900">
              Senha
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              disabled={loading}
              className="w-full rounded-xl border border-rosa-100 px-4 py-3.5 text-sm text-marrom-900 focus:border-rosa-800 focus:outline-none"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full rounded-full bg-gradient-to-br from-rosa-800 to-rosa-700 py-4 text-[15px] font-bold text-white shadow-[0_10px_24px_-8px_rgba(224,122,143,0.5)] disabled:opacity-60"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginPageContent />
    </Suspense>
  );
}
