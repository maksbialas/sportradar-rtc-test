import { defineConfig } from "vitest/config";
import * as path from "node:path";

export default defineConfig({
  base: path.resolve(__dirname),
  resolve: {
    alias: {
      $: path.resolve(__dirname, "src"),
    },
  },
  test: {
    clearMocks: true,
    coverage: {
      reporter: ["text", "lcov"],
    },
  },
});
