import { defineConfig } from "vitest/config";
import path from "path";

// Espelha o alias `@/*` -> `src/*` de tsconfig.json — Vitest não lê o
// tsconfig sozinho pra isso.
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
  test: {
    environment: "node",
  },
});
