/**
 * Mobile Lazy Loading Utilities
 * 
 * ⚠️ DEPRECATED: These utilities change the React tree based on viewport, which can cause
 * removeChild errors and React reconciliation issues. Use CSS-based responsive patterns instead.
 * 
 * ❌ DO NOT USE for page-level components or root-level components.
 * ✅ ONLY use for non-critical UI elements that don't affect tree structure.
 * 
 * RECOMMENDED ALTERNATIVE:
 * - Use CSS classes (hidden md:block, block md:hidden) instead
 * - Always render both mobile and desktop, let CSS control visibility
 * - See page-router.tsx for the correct pattern
 * 
 * @deprecated Use CSS-based responsive patterns instead
 */

import { lazy, ComponentType } from "react";

/**
 * Lazy load component only on mobile
 * 
 * @deprecated Use CSS classes instead. Always render both mobile/desktop versions.
 * 
 * ❌ PROBLEM: Changes React tree structure based on viewport
 * ✅ SOLUTION: Render both, use className="block md:hidden" for mobile
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
 * 
 * @deprecated Use CSS classes instead. Always render both mobile/desktop versions.
 * 
 * ❌ PROBLEM: Changes React tree structure based on viewport
 * ✅ SOLUTION: Render both, use className="hidden md:block" for desktop
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
 * 
 * @deprecated Use CSS classes instead. Use createAdaptivePage from page-router.tsx instead.
 * 
 * ❌ PROBLEM: Changes React tree structure based on viewport - causes removeChild errors
 * ✅ SOLUTION: Use createAdaptivePage which always renders both with CSS visibility
 * 
 * NEVER USE THIS FOR PAGE-LEVEL COMPONENTS!
 * This changes the root component tree and will cause React reconciliation errors.
 */
export function conditionalLazy<T extends ComponentType<any>>(
  mobileImport: () => Promise<{ default: T }>,
  desktopImport: () => Promise<{ default: T }>
) {
  console.warn(
    'conditionalLazy is deprecated. Use createAdaptivePage from page-router.tsx instead. ' +
    'conditionalLazy changes React tree structure and can cause removeChild errors.'
  );
  
  return lazy(async () => {
    const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
    return isMobile ? mobileImport() : desktopImport();
  });
}
