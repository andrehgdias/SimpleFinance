import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    coverage: {
      enabled: true,
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: ["src/**/*.{ts,tsx}"],
      exclude: ["node_modules/", "tests/", "**/*.test.ts", "**/*.spec.ts"],
      reportOnFailure: true,
    },
  },
})
