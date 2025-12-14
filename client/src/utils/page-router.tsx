/**
 * Page Router Utility
 * Automatically loads mobile or desktop version of pages based on device detection
 */

import { ComponentType, lazy, Suspense, useState, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";

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
    const [PageComponent, setPageComponent] = useState<typeof DesktopPage | typeof MobilePage | null>(null);

    useEffect(() => {
      // Only set component after we know if it's mobile or not
      if (isMobile !== undefined) {
        setPageComponent(isMobile ? MobilePage : DesktopPage);
      }
    }, [isMobile]);

    // Show loading state while determining device type or loading component
    if (isMobile === undefined || PageComponent === null) {
      return <LoadingSpinner />;
    }

    return (
      <Suspense fallback={<LoadingSpinner />}>
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
