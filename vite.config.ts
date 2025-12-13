import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { fileURLToPath } from "url";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import { metaImagesPlugin } from "./vite-plugin-meta-images";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Función para obtener plugins de Replit (solo en desarrollo)
async function getReplitPlugins() {
  if (process.env.NODE_ENV === "production" || !process.env.REPL_ID) {
    return [];
  }
  
  try {
    const cartographer = await import("@replit/vite-plugin-cartographer");
    const devBanner = await import("@replit/vite-plugin-dev-banner");
    return [
      cartographer.cartographer(),
      devBanner.devBanner(),
    ];
  } catch (err) {
    // Si los plugins de Replit no están disponibles, continuar sin ellos
    console.warn("Replit plugins not available, skipping");
    return [];
  }
}

export default defineConfig(async () => {
  const replitPlugins = await getReplitPlugins();
  
  return {
    plugins: [
      react(),
      runtimeErrorOverlay(),
      tailwindcss(),
      metaImagesPlugin(),
      ...replitPlugins,
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
        /**
         * Code-splitting strategy for optimal caching and mobile performance
         * 
         * CRITICAL RULE: Dependencies that require React at initialization MUST be in the same chunk
         * 
         * Safe to separate (load after React):
         * - react-helmet-async (uses React but doesn't need it at init)
         * - @tanstack/react-query (uses React but doesn't need it at init)
         * - wouter (router, independent)
         * - framer-motion (uses React but doesn't need it at init)
         * 
         * MUST be together (need React at initialization):
         * - react, react-dom (React core)
         * - @radix-ui/* (needs React.forwardRef at init)
         * - lucide-react (registers icons at init, needs React context)
         * - react-hook-form (may need React at init)
         * - react-markdown (may need React at init)
         * - react-syntax-highlighter (may need React at init)
         * - react-window (may need React at init)
         * - react-resizable-panels (may need React at init)
         * - react-day-picker (may need React at init)
         * - embla-carousel-react (may need React at init)
         * - recharts (may need React at init)
         * - next-themes (may need React at init)
         * - sonner (may need React at init)
         * - vaul (may need React at init)
         * 
         * Solution: Keep all React-dependent libraries in vendor chunk to ensure
         * React is available when they initialize. This prevents errors like:
         * - "Cannot read properties of undefined (reading 'forwardRef')"
         * - "Cannot set properties of undefined (setting 'Activity')"
         */
        manualChunks(id) {
          // Only split code from node_modules
          if (id.includes('node_modules')) {
            // Safe to separate - these don't need React at initialization
            // They can load after React is available
            
            // React ecosystem (safe to separate)
            if (id.includes('react-helmet') || id.includes('react-router')) {
              return 'react-ecosystem';
            }
            
            // Query library (safe to separate - uses React but doesn't need it at init)
            if (id.includes('@tanstack/react-query')) {
              return 'query-vendor';
            }
            
            // Router (safe to separate - independent)
            if (id.includes('wouter')) {
              return 'router-vendor';
            }
            
            // Animation library (safe to separate - uses React but doesn't need it at init)
            if (id.includes('framer-motion')) {
              return 'animation-vendor';
            }
            
            // Everything else goes to vendor chunk
            // This includes:
            // - react, react-dom (React core)
            // - All @radix-ui packages (need React.forwardRef)
            // - lucide-react (registers icons, needs React)
            // - All other React-dependent libraries
            // This ensures React is loaded first and available when other libs initialize
            return 'vendor';
          }
          
          // Separate heavy tools for lazy loading
          if (id.includes('/tools/')) {
            return 'tools';
          }
          
          // Separate common components
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
  };
});
