/**
 * Page Router Utility
 * 
 * Provides responsive page loading that maintains a stable React tree structure.
 * Uses CSS (Tailwind) for responsive display instead of conditional component rendering.
 * 
 * ⚠️ ANTI-REGRESSION WARNING ⚠️
 * ==============================
 * 
 * CRITICAL: This utility NEVER changes the React tree based on viewport size.
 * Both mobile and desktop components are always mounted - CSS controls visibility.
 * 
 * ❌ FORBIDDEN PATTERN (causes removeChild errors):
 *   const SelectedPage = isMobile ? MobilePage : DesktopPage;
 *   return <SelectedPage />;
 * 
 * ✅ REQUIRED PATTERN (stable tree):
 *   return (
 *     <>
 *       <div className="hidden md:block"><DesktopPage /></div>
 *       <div className="block md:hidden"><MobilePage /></div>
 *     </>
 *   );
 * 
 * WHY THIS MATTERS:
 * - React reconciliation expects stable tree structure
 * - Changing root components causes unmount/remount cycles
 * - Suspense boundaries break when parent changes
 * - Service Worker reloads trigger errors during transitions
 * - Mobile viewport changes during initial render cause DOM inconsistencies
 * 
 * IF YOU CHANGE THIS TO USE CONDITIONAL RENDERING:
 * - removeChild errors will return
 * - React Error #31/#185 will return
 * - Mobile app will crash
 * - You will break production
 * 
 * This pattern matches Layout.tsx (CSS-based responsive, not JS-based).
 */

import { ComponentType, lazy, Suspense } from "react";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { isChunkLoadError, handleChunkLoadError } from "@/lib/chunk-error-handler";

/**
 * Creates a component that automatically loads mobile or desktop version
 * @param desktopImport - Import function for desktop version
 * @param mobileImport - Import function for mobile version (optional)
 */
export function createAdaptivePage<T extends ComponentType<any>>(
  desktopImport: () => Promise<{ default: T }>,
  mobileImport?: () => Promise<{ default: T }>
) {
  // Wrap imports with error handling and validation
  // CRITICAL: Ensure imports always resolve to valid React components
  const safeDesktopImport = async () => {
    try {
      const module = await desktopImport();
      
      // Validate that we got a valid module with a default export
      if (!module || typeof module !== 'object') {
        throw new Error('Desktop import returned invalid module');
      }
      
      // Validate default export exists and is a function (component)
      if (!module.default) {
        throw new Error('Desktop import missing default export');
      }
      
      if (typeof module.default !== 'function') {
        throw new Error('Desktop import default export is not a component');
      }
      
      return module;
    } catch (error) {
      console.error('Failed to load desktop page:', error);
      
      const chunkError = isChunkLoadError(error);
      if (chunkError.isChunkError) {
        handleChunkLoadError(error);
        // Re-throw to let ErrorBoundary handle it
        throw error;
      }
      
      // For other errors, throw with context
      throw new Error(`Failed to load desktop page: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const safeMobileImport = mobileImport ? async () => {
    try {
      const module = await mobileImport();
      
      // Validate that we got a valid module with a default export
      if (!module || typeof module !== 'object') {
        throw new Error('Mobile import returned invalid module');
      }
      
      if (!module.default) {
        throw new Error('Mobile import missing default export');
      }
      
      if (typeof module.default !== 'function') {
        throw new Error('Mobile import default export is not a component');
      }
      
      return module;
    } catch (error) {
      console.error('Failed to load mobile page:', error);
      
      const chunkError = isChunkLoadError(error);
      if (chunkError.isChunkError) {
        handleChunkLoadError(error);
        throw error;
      }
      
      // If mobile fails, fallback to desktop
      console.warn('Mobile page failed to load, falling back to desktop');
      return await safeDesktopImport();
    }
  } : undefined;

  // Wrap lazy components with additional validation
  // This ensures React.lazy never returns an invalid component
  const createSafeLazy = (importFn: () => Promise<{ default: T }>) => {
    return lazy(async () => {
      try {
        const module = await importFn();
        
        // CRITICAL: Validate module structure first
        if (!module) {
          throw new Error('Import returned null or undefined');
        }
        
        if (typeof module !== 'object') {
          throw new Error(`Import returned non-object: ${typeof module}`);
        }
        
        // CRITICAL: Validate default export exists
        if (!('default' in module)) {
          throw new Error('Module missing default export');
        }
        
        const component = module.default;
        
        // CRITICAL: Validate default is a function (React component)
        if (!component) {
          throw new Error('Default export is null or undefined');
        }
        
        // CRITICAL: Validate default is a function (React component)
        if (typeof component !== 'function') {
          throw new Error(`Default export is not a function: ${typeof component}, value: ${String(component).substring(0, 100)}`);
        }
        
        // Additional validation: check if it looks like a React component
        // React components have $$typeof in production, but functions can still be valid
        // Just ensure it's callable (already checked above, but explicit for clarity)
        
        return module as { default: T };
      } catch (error) {
        console.error('SafeLazy import failed:', error);
        // Re-throw to let ErrorBoundary handle it
        // CRITICAL: Never return invalid modules that could cause React Error #31
        throw error;
      }
    });
  };

  const DesktopPage = createSafeLazy(safeDesktopImport);
  const MobilePage = safeMobileImport ? createSafeLazy(safeMobileImport) : DesktopPage;

  /**
   * ResponsivePageWrapper Component
   * 
   * CRITICAL ARCHITECTURAL DECISION:
   * =================================
   * 
   * This component ALWAYS renders both DesktopPage and MobilePage in the React tree.
   * CSS (Tailwind classes) controls visibility, NOT conditional rendering.
   * 
   * ❌ NEVER DO THIS (causes removeChild errors):
   *   const SelectedPage = isMobile ? MobilePage : DesktopPage;
   *   return <SelectedPage /> // ❌ Changes tree structure = DOM inconsistencies
   * 
   * ✅ ALWAYS DO THIS (stable tree):
   *   return (
   *     <>
   *       <div className="hidden md:block"><DesktopPage /></div>
   *       <div className="block md:hidden"><MobilePage /></div>
   *     </>
   *   ); // ✅ Same tree always, CSS handles visibility
   * 
   * WHY THIS MATTERS:
   * - React's reconciliation algorithm expects stable tree structure
   * - Changing root components based on viewport causes unmount/remount cycles
   * - Suspense boundaries get confused when parent changes
   * - Service Worker reloads trigger errors during tree transitions
   * - Mobile viewport can change during initial render (orientation, zoom, etc.)
   * 
   * This pattern matches our Layout.tsx approach (CSS-based responsive, not JS-based).
   */
  function ResponsivePageWrapper(props: any) {
    return (
      <>
        {/* Desktop: Hidden below md breakpoint (768px), visible above */}
        <div className="hidden md:block">
          <Suspense fallback={<LoadingSpinner />}>
            <DesktopPage {...props} />
          </Suspense>
        </div>

        {/* Mobile: Visible below md breakpoint (768px), hidden above */}
        <div className="block md:hidden">
          <Suspense fallback={<LoadingSpinner />}>
            <MobilePage {...props} />
          </Suspense>
        </div>
      </>
    );
  }

  /**
   * AdaptivePage Component
   * 
   * Returns a component that adapts to mobile/desktop using CSS, not conditional rendering.
   * The React tree structure NEVER changes - this is key to preventing removeChild errors.
   */
  return function AdaptivePage(props: any) {
    // Always return the same component structure - React tree is stable
    // CSS handles responsive display via Tailwind's md: breakpoint
    return <ResponsivePageWrapper {...props} />;
  };
}

/**
 * Helper to create mobile import path
 */
export function getMobilePagePath(basePath: string): string {
  return basePath.replace("/pages/", "/pages/mobile/");
}

/**
 * Helper to create lazy import with mobile fallback
 */
export function lazyPage<T extends ComponentType<any>>(
  desktopPath: string,
  mobilePath?: string
) {
  const desktopImport = () => import(desktopPath);
  
  if (mobilePath) {
    return createAdaptivePage(
      desktopImport,
      () => import(mobilePath)
    );
  }
  
  return lazy(desktopImport);
}
