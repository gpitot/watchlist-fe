import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      providers: path.resolve("./src/providers"),
      components: path.resolve("./src/components"),
      api: path.resolve("./src/api"),
      pages: path.resolve("./src/pages"),
      interfaces: path.resolve("./src/interfaces"),
      assets: path.resolve("./src/assets"),
    },
  },
});
