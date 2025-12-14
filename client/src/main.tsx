import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App";
import "./index.css";

// Register Service Worker for PWA
// Safe check for browser environment and service worker support
if (
  typeof window !== "undefined" &&
  "serviceWorker" in navigator &&
  import.meta.env.PROD
) {
  // Use requestIdleCallback if available for better performance, otherwise use load event
  const registerSW = () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        console.log("Service Worker registered:", registration.scope);
        
        // Check for updates
        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener("statechange", () => {
              if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                // New service worker available
                console.log("New service worker available, clearing old caches and activating...");
                
                // Clear all old caches to avoid serving stale chunks
                if ('caches' in window) {
                  caches.keys().then(cacheNames => {
                    cacheNames.forEach(cacheName => {
                      // Only delete old caches (not the current one)
                      if (!cacheName.includes(registration.scope.replace(window.location.origin, ''))) {
                        caches.delete(cacheName).catch(() => {});
                      }
                    });
                  });
                }
                
                // Activate new service worker immediately
                // This ensures users get the latest chunks after redeploy
                newWorker.postMessage({ type: 'SKIP_WAITING' });
                
                // Reload page after a short delay to activate new SW
                setTimeout(() => {
                  window.location.reload();
                }, 500);
              }
            });
          }
        });
        
        // Listen for controller change (when new SW takes control)
        navigator.serviceWorker.addEventListener("controllerchange", () => {
          console.log("Service worker controller changed, reloading page...");
          window.location.reload();
        });
      })
      .catch((error) => {
        // Silently fail - don't interrupt user experience
        console.warn("Service Worker registration failed:", error);
      });
  };

  if (window.requestIdleCallback) {
    window.requestIdleCallback(registerSW, { timeout: 2000 });
  } else if (document.readyState === "complete") {
    // If already loaded, register immediately
    registerSW();
  } else {
    window.addEventListener("load", registerSW);
  }
}

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <App />
  </HelmetProvider>
);
