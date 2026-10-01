import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Component tests run without vinext, a Worker, or a database binding.
export default defineConfig({
  resolve: { alias: { "@": fileURLToPath(new URL("./", import.meta.url)) } },
  test: {
    environment: "jsdom",
    // Keep one DOM runtime active on constrained local machines and CI runners.
    fileParallelism: false,
    include: ["tests/components/**/*.test.tsx", "tests/server/**/*.test.ts"],
    setupFiles: ["./tests/components/setup.ts"],
    clearMocks: true,
    restoreMocks: true,
  },
});
