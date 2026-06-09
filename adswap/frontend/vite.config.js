import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Proxy API + media requests to the FastAPI backend during development.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/jobs": "http://localhost:8000",
      "/files": "http://localhost:8000",
      "/health": "http://localhost:8000",
    },
  },
});
