/**
 * MobileActions Component
 * Barra de acciones flotante para móvil
 */

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface MobileActionsProps {
  children: ReactNode;
  position?: "bottom" | "top";
  className?: string;
}

export function MobileActions({ 
  children, 
  position = "bottom",
  className 
}: MobileActionsProps) {
  return (
    <div
      className={cn(
        "fixed left-0 right-0 z-50 bg-background/95 backdrop-blur-lg border-t border-border/50 md:hidden",
        position === "bottom" ? "bottom-0" : "top-0 border-t-0 border-b",
        className
      )}
    >
      {children}
    </div>
  );
}

