/**
 * MobileOnly Component
 * Wrapper que solo renderiza contenido en dispositivos móviles
 */

import { ReactNode } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

interface MobileOnlyProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function MobileOnly({ children, fallback = null }: MobileOnlyProps) {
  const isMobile = useIsMobile();
  
  if (isMobile === undefined) {
    // Durante la hidratación, no renderizar nada
    return null;
  }
  
  return isMobile ? <>{children}</> : <>{fallback}</>;
}

