import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "dist/**",
    "dist-pages/**",
    ".wrangler/**",
    "worker/worker-configuration.d.ts",
    "outputs/**",
    "work/**",
  ]),
  {
    files: ["features/**/*.{ts,tsx}", "shared/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": ["error", {
        patterns: [{ group: ["@/app/**", "**/app/**"], message: "Features must not depend on route entry points. Move reusable code into its owning feature." }],
      }],
    },
  },
  {
    files: ["shared/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": ["error", {
        patterns: [{ group: ["@/app/**", "**/app/**", "@/features/**", "**/features/**", "@/db/**", "**/db/**"], message: "Shared infrastructure cannot depend on application features, routes, or database bindings." }],
      }],
    },
  },
]);

export default eslintConfig;
