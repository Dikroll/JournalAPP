import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import path from "node:path"
import { defineConfig } from "vite"

export default defineConfig({
	plugins: [react(), tailwindcss()],
	resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
	},
	server: {
  host: true,
  port: 5173,
  proxy: {
  "^/(auth|user|schedule|dashboard|homework|news|payment|feedback|market|library|health)": {
    target: "http://backend:8000",
    changeOrigin: true,
  },
},
},
});
