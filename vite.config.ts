// vite.config.ts
import { defineConfig } from "vite"
import solidPlugin from "vite-plugin-solid"
import mkcert from "vite-plugin-mkcert"

export default defineConfig({
  base: "/SimpleFinance/",
  plugins: [solidPlugin(), mkcert()],
  resolve: {
    conditions: ["development", "browser"],
  },
})
