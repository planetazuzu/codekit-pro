/**
 * Page Router Utility
 * Automatically loads mobile or desktop version of pages based on device detection
 */

import { ComponentType, lazy, Suspense } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

/**
 * Creates a component that automatically loads mobile or desktop version
 * @param desktopImport - Import function for desktop version
 * @param mobileImport - Import function for mobile version (optional)
 */
export function createAdaptivePage<T extends ComponentType<any>>(
  desktopImport: () => Promise<{ default: T }>,
  mobileImport?: () => Promise<{ default: T }>
) {
  const DesktopPage = lazy(desktopImport);
  const MobilePage = mobileImport ? lazy(mobileImport) : DesktopPage;

  return function AdaptivePage(props: any) {
    const isMobile = useIsMobile();

    // Show loading state while determining device type
    if (isMobile === undefined) {
      return (
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>}>
          <DesktopPage {...props} />
        </Suspense>
      );
    }

    const PageComponent = isMobile ? MobilePage : DesktopPage;

    return (
      <Suspense fallback={<div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>}>
        <PageComponent {...props} />
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
