import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("/node_modules/")) return undefined;

          const packagePath = id.match(/\.pnpm\/([^/]+)\//)?.[1] ?? "";
          const packageName = packagePath.split("@")[0];
          if (["react", "react-dom", "scheduler"].includes(packageName)) {
            return "react-runtime";
          }
          if (packageName === "zod") return "validation";
          return "vendor";
        },
      },
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
