import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { fileURLToPath } from "url";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import { metaImagesPlugin } from "./vite-plugin-meta-images";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    tailwindcss(),
    metaImagesPlugin(),
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer(),
          ),
          await import("@replit/vite-plugin-dev-banner").then((m) =>
            m.devBanner(),
          ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared"),
      "@assets": path.resolve(__dirname, "attached_assets"),
    },
  },
  css: {
    postcss: {
      plugins: [],
    },
  },
  root: path.resolve(__dirname, "client"),
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Separar vendor chunks para mejor caching y rendimiento móvil
          // FIX: Desactivar code-splitting para React y dependencias para evitar errores
          // El problema parece ser el orden de carga de chunks
          if (id.includes('node_modules')) {
            // NO separar React, Radix UI ni lucide-react - dejarlos en vendor principal
            // Esto asegura que se carguen en el orden correcto sin problemas de inicialización
            // React ecosystem (puede estar separado, no causa problemas)
            if (id.includes('react-helmet') || id.includes('react-router')) {
              return 'react-ecosystem';
            }
            // Query library (puede estar separado)
            if (id.includes('@tanstack/react-query')) {
              return 'query-vendor';
            }
            // Router (puede estar separado)
            if (id.includes('wouter')) {
              return 'router-vendor';
            }
            // Framer motion (puede estar separado)
            if (id.includes('framer-motion')) {
              return 'animation-vendor';
            }
            // Todo lo demás (incluyendo React, Radix UI, lucide-react) va al vendor principal
            return 'vendor';
          }
          // Separar herramientas pesadas
          if (id.includes('/tools/')) {
            return 'tools';
          }
          // Separar componentes comunes
          if (id.includes('/components/common/')) {
            return 'common-components';
          }
        },
      },
    },
  },
  server: {
    host: "0.0.0.0",
    allowedHosts: true,
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
