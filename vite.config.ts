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
          // FIX: React y @radix-ui deben estar juntos para evitar error "forwardRef undefined"
          if (id.includes('node_modules')) {
            // React core y UI libraries que lo necesitan - mantener juntos
            if (id.includes('react') && (id.includes('/react/') || id.includes('/react-dom/'))) {
              return 'react-vendor';
            }
            // @radix-ui necesita React.forwardRef - incluir en react-vendor o asegurar que React se carga primero
            // Por ahora, mantener separado pero Rollup debería manejar las dependencias
            if (id.includes('@radix-ui')) {
              return 'ui-vendor';
            }
            // React ecosystem
            if (id.includes('react-helmet') || id.includes('react-router')) {
              return 'react-ecosystem';
            }
            // Query library (depende de React)
            if (id.includes('@tanstack/react-query')) {
              return 'query-vendor';
            }
            // Router
            if (id.includes('wouter')) {
              return 'router-vendor';
            }
            // Icons (puede ser grande)
            if (id.includes('lucide-react')) {
              return 'icons-vendor';
            }
            // Framer motion (si se usa, depende de React)
            if (id.includes('framer-motion')) {
              return 'animation-vendor';
            }
            // Otros vendor más pequeños
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
