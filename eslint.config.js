import { defaultConfig } from "@caido/eslint-config";
import globals from "globals";

export default [
  ...defaultConfig({
    compat: false,
  }),
  {
    files: ["packages/frontend/**/*.{ts,vue}"],
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
  },
  {
    ignores: [
      "packages/backend/vitest.config.ts",
      "packages/frontend/vitest.config.ts",
    ],
  },
];
