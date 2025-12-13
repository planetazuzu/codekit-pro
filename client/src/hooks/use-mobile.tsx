import * as React from "react"

const MOBILE_BREAKPOINT = 768
const TABLET_BREAKPOINT = 1024

/**
 * Hook para detectar si es móvil
 * Safe para SSR - retorna false inicialmente si window no está disponible
 */
export function useIsMobile() {
  // Inicializar con un valor por defecto seguro para SSR
  // Si estamos en cliente, intentamos detectar inmediatamente
  const [isMobile, setIsMobile] = React.useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.innerWidth < MOBILE_BREAKPOINT;
  });

  React.useEffect(() => {
    // Verificar que window está disponible
    if (typeof window === "undefined") return;

    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    
    // Función para actualizar estado
    const updateIsMobile = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };

    // Actualizar inmediatamente
    updateIsMobile();

    // Escuchar cambios
    // Usar addEventListener si está disponible, sino usar el evento deprecated
    if (mql.addEventListener) {
      mql.addEventListener("change", updateIsMobile);
      return () => mql.removeEventListener("change", updateIsMobile);
    } else {
      // Fallback para navegadores antiguos
      mql.addListener(updateIsMobile);
      return () => mql.removeListener(updateIsMobile);
    }
  }, []);

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
