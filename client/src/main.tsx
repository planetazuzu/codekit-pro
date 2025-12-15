import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App";
import "./index.css";
import { isChunkLoadError, getReloadAttemptStatus, handleChunkLoadError } from "./lib/chunk-error-handler";

// Global error handler to catch errors outside React
// This prevents infinite error loops and handles removeChild errors
if (typeof window !== "undefined") {
  let errorHandlerActive = false;
  
  window.addEventListener('error', (event) => {
    // Prevent infinite loops
    if (errorHandlerActive) {
      return;
    }
    
    const error = event.error || new Error(event.message);
    const errorMessage = error.message || String(error);
    const errorString = String(error).toLowerCase();
    
    // Check for React Error #31, removeChild errors, or chunk errors
    const isReactError31 = errorMessage.includes('react error #31') ||
      errorMessage.includes('$$typeof') ||
      (errorMessage.includes('displayName') && errorMessage.includes('render')) ||
      errorMessage.includes('Objects are not valid');
    
    const isRemoveChildError = errorMessage.includes('removeChild') || 
      errorMessage.includes('not a child of this node');
    
    const chunkError = isChunkLoadError(error);
    const isCriticalError = isReactError31 || chunkError.isChunkError;
    
    // For removeChild errors during error recovery, ignore them
    // They're a symptom, not the root cause
    if (isRemoveChildError) {
      console.warn('Ignoring removeChild error during recovery:', errorMessage);
      event.preventDefault(); // Prevent default error handling
      return;
    }
    
    // For critical errors, trigger reload if not already attempted
    if (isCriticalError) {
      const reloadStatus = getReloadAttemptStatus();
      if (!reloadStatus.inCooldown) {
        errorHandlerActive = true;
        console.warn('Global error handler: Critical error detected, initiating reload...');
        event.preventDefault();
        handleChunkLoadError(error, 0);
      }
    }
  }, true); // Use capture phase to catch errors early
  
  // Also catch unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    const error = event.reason;
    const chunkError = isChunkLoadError(error);
    
    if (chunkError.isChunkError) {
      const reloadStatus = getReloadAttemptStatus();
      if (!reloadStatus.inCooldown && !errorHandlerActive) {
        errorHandlerActive = true;
        console.warn('Global error handler: Unhandled chunk error in promise, initiating reload...');
        event.preventDefault();
        handleChunkLoadError(error, 0);
      }
    }
  });
}

// Service Worker Registration (COMPLETELY DISABLED)
// ===================================================
// 
// 🚨 CRITICAL: Service Worker is COMPLETELY DISABLED to prevent removeChild errors.
// 
// ⚠️ DO NOT RE-ENABLE until:
// 1. All responsive components use CSS (not conditional rendering)
// 2. All Suspense boundaries are stable (no viewport-based conditionals)
// 3. ErrorBoundary auto-reload is removed
// 4. Thoroughly tested on mobile devices
//
// Service Worker auto-reloads combined with React tree instability cause:
// - removeChild errors
// - ChunkLoadError loops
// - React Error #31 / #185
// - Infinite error loops
//
// Current status: COMPLETELY DISABLED for stability.
// PWA install prompt still works (browser native feature).

// COMPLETELY DISABLED - Unregister any existing Service Workers
// This prevents all SW-related errors and reload loops
if (typeof window !== "undefined" && "serviceWorker" in navigator) {
  // Unregister all existing service workers to prevent issues
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    if (registrations.length > 0) {
      console.log(`Unregistering ${registrations.length} existing service worker(s)...`);
      registrations.forEach((registration) => {
        registration.unregister().then((success) => {
          if (success) {
            console.log("Service worker unregistered successfully");
          }
        }).catch((error) => {
          console.warn("Error unregistering service worker:", error);
        });
      });
    }
  }).catch((error) => {
    console.warn("Error getting service worker registrations:", error);
  });
}

// DO NOT REGISTER NEW SERVICE WORKER - FORCE DISABLED
// Change to true ONLY after fixing all tree stability issues
if (false && // FORCE DISABLED
  typeof window !== "undefined" &&
  "serviceWorker" in navigator &&
  import.meta.env.PROD &&
  import.meta.env.VITE_ENABLE_SW === "true"
) {
  const registerSW = () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        console.log("Service Worker registered:", registration.scope);
        
        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener("statechange", () => {
              if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                console.log("New service worker available, clearing old caches...");
                
                // Clear old caches
                if ('caches' in window) {
                  caches.keys().then(cacheNames => {
                    cacheNames.forEach(cacheName => {
                      if (!cacheName.includes(registration.scope.replace(window.location.origin, ''))) {
                        caches.delete(cacheName).catch(() => {});
                      }
                    });
                  });
                }
                
                // Activate new service worker
                newWorker.postMessage({ type: 'SKIP_WAITING' });
                
                // Reload after delay (consider user experience)
                setTimeout(() => {
                  window.location.reload();
                }, 500);
              }
            });
          }
        });
        
        navigator.serviceWorker.addEventListener("controllerchange", () => {
          console.log("Service worker controller changed, reloading page...");
          window.location.reload();
        });
      })
      .catch((error) => {
        console.warn("Service Worker registration failed:", error);
      });
  };

  if (window.requestIdleCallback) {
    window.requestIdleCallback(registerSW, { timeout: 2000 });
  } else if (document.readyState === "complete") {
    registerSW();
  } else {
    window.addEventListener("load", registerSW);
  }
} else if (import.meta.env.PROD && typeof window !== "undefined") {
  // Log when SW is intentionally disabled (only in production to avoid console noise in dev)
  // This helps with debugging if SW features are expected but not working
  console.debug("Service Worker disabled (set VITE_ENABLE_SW=true to enable)");
}

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <App />
  </HelmetProvider>
);
