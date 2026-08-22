import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Necessário para o build Docker (Railway): gera .next/standalone com
  // apenas os arquivos rastreados como necessários para rodar `node server.js`,
  // sem precisar copiar node_modules inteiro pra imagem final.
  output: "standalone",
  // `sharp` é optionalDependency do `next` (usada por next/image em runtime);
  // o tracing do output standalone às vezes deixa os binários nativos de fora.
  // Ver node_modules/next/dist/docs/.../output.md.
  outputFileTracingIncludes: {
    "/*": ["node_modules/sharp/**/*"],
  },
  images: {
    remotePatterns: [
      // URL pública padrão de bucket do Cloudflare R2 (pub-<hash>.r2.dev).
      // Se um domínio próprio for configurado pro bucket (recomendado em
      // produção — ver src/docs/RAILWAY_DEPLOY.md), adicionar o hostname
      // exato aqui também.
      {
        protocol: "https",
        hostname: "*.r2.dev",
      },
    ],
  },
};

export default nextConfig;
