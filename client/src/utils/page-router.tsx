/**
 * Page Router Utility
 * Automatically loads mobile or desktop version of pages based on device detection
 */

import { ComponentType, lazy, Suspense, useState, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
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

  const DesktopPage = lazy(safeDesktopImport);
  const MobilePage = safeMobileImport ? lazy(safeMobileImport) : DesktopPage;

  return function AdaptivePage(props: any) {
    const isMobile = useIsMobile();
    const [mounted, setMounted] = useState(false);
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
      // Only render after mount and when we know device type
      if (isMobile !== undefined) {
        setMounted(true);
        setHasError(false);
      }
    }, [isMobile]);

    // Show loading state while determining device type
    if (isMobile === undefined || !mounted) {
      return <LoadingSpinner />;
    }

    // Select the correct component based on device
    const SelectedPage = isMobile ? MobilePage : DesktopPage;

    // CRITICAL: Always wrap in Suspense to catch loading errors
    // And ensure we never try to render an undefined component
    return (
      <Suspense fallback={<LoadingSpinner />}>
        <SelectedPage {...props} />
      </Suspense>
    );
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
