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
                // New service worker available, prompt user to refresh
                console.log("New service worker available");
              }
            });
          }
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
