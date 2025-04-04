import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    silent: "passed-only",
    clearMocks: true,
    coverage: {
      reporter: ["text", "lcov"],
      include: ["src/**/*.ts"],
      exclude: ["src/index.ts"],
    },
  },
});
