import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
  resolve: {
    alias: {
      "caido:plugin": path.resolve(__dirname, "src/__mocks__/caido-plugin.ts"),
      "caido:utils": path.resolve(__dirname, "src/__mocks__/caido-utils.ts"),
    },
  },
});
