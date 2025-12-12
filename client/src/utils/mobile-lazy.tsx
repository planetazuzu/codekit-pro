/**
 * Mobile Lazy Loading Utilities
 * Lazy loading de componentes móviles
 */

import { lazy, ComponentType } from "react";

/**
 * Lazy load component only on mobile
 */
export function lazyMobile<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>
) {
  return lazy(async () => {
    const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
    if (isMobile) {
      return importFn();
    }
    // Return empty component for desktop
    return {
      default: (() => null) as unknown as T,
    };
  });
}

/**
 * Lazy load component only on desktop
 */
export function lazyDesktop<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>
) {
  return lazy(async () => {
    const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
    if (!isMobile) {
      return importFn();
    }
    // Return empty component for mobile
    return {
      default: (() => null) as unknown as T,
    };
  });
}

/**
 * Conditional lazy loading based on device
 */
export function conditionalLazy<T extends ComponentType<any>>(
  mobileImport: () => Promise<{ default: T }>,
  desktopImport: () => Promise<{ default: T }>
) {
  return lazy(async () => {
    const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
    return isMobile ? mobileImport() : desktopImport();
  });
}
