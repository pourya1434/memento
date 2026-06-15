import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// On GitHub Pages project sites the app is served from "/<repo>/", so the
// build needs a matching base path. The deploy workflow sets VITE_BASE; locally
// it defaults to "/".
export default defineConfig({
  base: process.env.VITE_BASE || "/",
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
  },
});
