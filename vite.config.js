import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// GitHub Pages serves this site from https://<username>.github.io/Realestate_Website/.
// In CI (GitHub Actions) we bake in the absolute base so asset URLs resolve under
// the repo sub-path. Everywhere else we emit relative paths ("./") so the exact
// same dist/ folder also works when served from any other location (locally,
// `vite preview`, or branch-based Pages deploys).
const base = process.env.GITHUB_ACTIONS ? "/Realestate_Website/" : "./";

export default defineConfig({
  base,
  plugins: [react(), tailwindcss()],
  server: {
    host: "0.0.0.0",
    port: 3000,
    strictPort: true,
    hmr: {
      port: 3000,
    },
  },
});
