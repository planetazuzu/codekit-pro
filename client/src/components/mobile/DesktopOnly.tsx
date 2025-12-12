/**
 * DesktopOnly Component
 * Wrapper que solo renderiza contenido en dispositivos desktop
 */

import { ReactNode } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

interface DesktopOnlyProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function DesktopOnly({ children, fallback = null }: DesktopOnlyProps) {
  const isMobile = useIsMobile();
  
  if (isMobile === undefined) {
    // Durante la hidratación, no renderizar nada
    return null;
  }
  
  return !isMobile ? <>{children}</> : <>{fallback}</>;
}

