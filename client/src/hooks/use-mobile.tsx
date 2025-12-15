import * as React from "react"

const MOBILE_BREAKPOINT = 768
const TABLET_BREAKPOINT = 1024

/**
 * Hook para detectar si es móvil
 * Safe para SSR - retorna false inicialmente si window no está disponible
 * 
 * ⚠️ ANTI-REGRESSION WARNING ⚠️
 * ==============================
 * 
 * DO NOT use this hook to conditionally render different root components.
 * 
 * ❌ FORBIDDEN:
 *   const SelectedPage = isMobile ? MobilePage : DesktopPage;
 *   return <SelectedPage />;
 * 
 * ✅ CORRECT:
 *   - Use CSS classes: className="hidden md:block" / "block md:hidden"
 *   - Use for props or styles only, never for component tree structure
 *   - See page-router.tsx for the correct responsive pattern
 * 
 * Using this for conditional rendering causes removeChild errors and React reconciliation issues.
 */
export function useIsMobile() {
  // CRITICAL: Initialize with a stable default value to prevent tree changes during initial render
  // Use a function to compute initial value only once
  const [isMobile, setIsMobile] = React.useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    // Use matchMedia for more reliable initial detection
    // This prevents flicker and DOM inconsistencies
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    return mql.matches;
  });

  // Track if we've mounted to prevent updates during initial render
  const [hasMounted, setHasMounted] = React.useState(false);

  React.useEffect(() => {
    // Verificar que window está disponible
    if (typeof window === "undefined") return;

    // Mark as mounted after initial render is complete
    // Use requestAnimationFrame to ensure DOM is stable
    const mountTimeout = requestAnimationFrame(() => {
      setHasMounted(true);
    });

    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    
    // Función para actualizar estado
    // Only update if mounted to prevent DOM inconsistencies
    const updateIsMobile = () => {
      if (!hasMounted) return; // Don't update during initial render
      
      // Use matchMedia.matches instead of innerWidth for consistency
      const newValue = mql.matches;
      setIsMobile(prev => {
        // Only update if value actually changed to prevent unnecessary re-renders
        if (prev !== newValue) {
          return newValue;
        }
        return prev;
      });
    };

    // Wait a bit before first update to ensure DOM is stable
    // This prevents removeChild errors during initial render
    const initialUpdateTimeout = setTimeout(() => {
      if (hasMounted) {
        updateIsMobile();
      }
    }, 100);

    // Escuchar cambios solo después del mount
    // Usar addEventListener si está disponible, sino usar el evento deprecated
    if (mql.addEventListener) {
      mql.addEventListener("change", updateIsMobile);
      return () => {
        cancelAnimationFrame(mountTimeout);
        clearTimeout(initialUpdateTimeout);
        mql.removeEventListener("change", updateIsMobile);
      };
    } else {
      // Fallback para navegadores antiguos
      mql.addListener(updateIsMobile);
      return () => {
        cancelAnimationFrame(mountTimeout);
        clearTimeout(initialUpdateTimeout);
        mql.removeListener(updateIsMobile);
      };
    }
  }, [hasMounted]);

  return isMobile;
}

/**
 * Hook para detectar si es tablet
 * Safe para SSR - retorna false inicialmente si window no está disponible
 */
export function useIsTablet() {
  const [isTablet, setIsTablet] = React.useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    const width = window.innerWidth;
    return width >= MOBILE_BREAKPOINT && width < TABLET_BREAKPOINT;
  });

  React.useEffect(() => {
    if (typeof window === "undefined") return;

    const mql = window.matchMedia(
      `(min-width: ${MOBILE_BREAKPOINT}px) and (max-width: ${TABLET_BREAKPOINT - 1}px)`
    );
    
    const updateIsTablet = () => {
      const width = window.innerWidth;
      setIsTablet(width >= MOBILE_BREAKPOINT && width < TABLET_BREAKPOINT);
    };

    updateIsTablet();

    if (mql.addEventListener) {
      mql.addEventListener("change", updateIsTablet);
      return () => mql.removeEventListener("change", updateIsTablet);
    } else {
      mql.addListener(updateIsTablet);
      return () => mql.removeListener(updateIsTablet);
    }
  }, []);

  return isTablet;
}

/**
 * Hook para detectar el tamaño de pantalla
 */
export function useScreenSize() {
  const [screenSize, setScreenSize] = React.useState<{
    width: number
    height: number
    isMobile: boolean
    isTablet: boolean
    isDesktop: boolean
  }>({
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
    isMobile: false,
    isTablet: false,
    isDesktop: false,
  })

  React.useEffect(() => {
    const updateSize = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      setScreenSize({
        width,
        height,
        isMobile: width < MOBILE_BREAKPOINT,
        isTablet: width >= MOBILE_BREAKPOINT && width < TABLET_BREAKPOINT,
        isDesktop: width >= TABLET_BREAKPOINT,
      })
    }

    updateSize()
    window.addEventListener("resize", updateSize)
    return () => window.removeEventListener("resize", updateSize)
  }, [])

  return screenSize
}

/**
 * Hook para detectar orientación del dispositivo
 */
export function useOrientation() {
  const [orientation, setOrientation] = React.useState<"portrait" | "landscape">(
    typeof window !== "undefined" && window.innerHeight > window.innerWidth
      ? "portrait"
      : "landscape"
  )

  React.useEffect(() => {
    const updateOrientation = () => {
      setOrientation(
        window.innerHeight > window.innerWidth ? "portrait" : "landscape"
      )
    }

    updateOrientation()
    window.addEventListener("resize", updateOrientation)
    return () => window.removeEventListener("resize", updateOrientation)
  }, [])

  return orientation
}
