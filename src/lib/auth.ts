import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { query } from "@/lib/db";

interface StaffUser {
  id: string;
  email: string;
  password_hash: string;
  name: string | null;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  // Sessão via JWT (cookie assinado, sem tabela de sessão) — não precisamos
  // de um Adapter só para autenticar a gestora em /orders.
  session: { strategy: "jwt" },
  // O Railway não é a Vercel: NextAuth não confia no header Host por padrão
  // fora dela. Confiamos porque a origem pública já é controlada por
  // NEXT_PUBLIC_BASE_URL/CORS (src/lib/cors.ts).
  trustHost: true,
  pages: {
    signIn: "/admin/login",
  },
  providers: [
    Credentials({
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

        return { id: user.id, email: user.email, name: user.name };
      },
    }),
  ],
});
