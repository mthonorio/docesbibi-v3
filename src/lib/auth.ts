import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { query } from "@/lib/db";
import type { UserRole } from "@/types/next-auth";

interface StaffUser {
  id: string;
  email: string;
  password_hash: string;
  name: string | null;
}

interface CustomerUser {
  id: string;
  email: string;
  password_hash: string;
  name: string;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  // Sessão via JWT (cookie assinado, sem tabela de sessão) — não precisamos
  // de um Adapter só para autenticar a gestora em /admin ou o comprador em
  // /pedidos.
  session: { strategy: "jwt" },
  // O Railway não é a Vercel: NextAuth não confia no header Host por padrão
  // fora dela. Confiamos porque a origem pública já é controlada por
  // NEXT_PUBLIC_BASE_URL/CORS (src/lib/cors.ts).
  trustHost: true,
  pages: {
    signIn: "/admin/login",
  },
  providers: [
    // Gestora — autentica contra `users`. Mantém o id "credentials" (não
    // renomeado) porque src/app/admin/login/page.tsx já chama
    // signIn("credentials", ...).
    Credentials({
      id: "credentials",
      credentials: {
        email: { label: "E-mail", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email;
        const password = credentials?.password;
        if (typeof email !== "string" || typeof password !== "string") {
          return null;
        }

        const result = await query(
          `SELECT id, email, password_hash, name FROM users WHERE email = $1`,
          [email.toLowerCase().trim()],
        );
        const user = result.rows[0] as StaffUser | undefined;
        if (!user) return null;

        const passwordMatches = await bcrypt.compare(
          password,
          user.password_hash,
        );
        if (!passwordMatches) return null;

        return { id: user.id, email: user.email, name: user.name, role: "staff" };
      },
    }),
    // Comprador — autentica contra `customers`. Ver
    // src/app/api/auth/register/route.ts para o cadastro.
    Credentials({
      id: "customer",
      credentials: {
        email: { label: "E-mail", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email;
        const password = credentials?.password;
        if (typeof email !== "string" || typeof password !== "string") {
          return null;
        }

        const result = await query(
          `SELECT id, email, password_hash, name FROM customers WHERE email = $1`,
          [email.toLowerCase().trim()],
        );
        const customer = result.rows[0] as CustomerUser | undefined;
        if (!customer) return null;

        const passwordMatches = await bcrypt.compare(
          password,
          customer.password_hash,
        );
        if (!passwordMatches) return null;

        return {
          id: customer.id,
          email: customer.email,
          name: customer.name,
          role: "customer",
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      // "next-auth/jwt" re-exporta a interface JWT via `export * from
      // "@auth/core/jwt"` — nesse pacote isso não faz merge com o module
      // augmentation em src/types/next-auth.d.ts (o TS não propaga a
      // interface aumentada através de um re-export coringa), então
      // `token.id`/`token.role` chegam aqui tipados como `unknown` (o
      // index signature de JWT). Os valores são os que a gente mesmo
      // gravou no callback `jwt` acima, então o cast é seguro.
      session.user.id = token.id as string;
      session.user.role = token.role as UserRole;
      return session;
    },
  },
});
