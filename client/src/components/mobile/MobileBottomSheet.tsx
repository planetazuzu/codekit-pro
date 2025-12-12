/**
 * MobileBottomSheet Component
 * Bottom sheet para móvil con animaciones suaves
 */

import { ReactNode, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MobileBottomSheetProps {
  children: ReactNode;
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  showCloseButton?: boolean;
  className?: string;
}

export function MobileBottomSheet({
  children,
  isOpen,
  onClose,
  title,
  showCloseButton = true,
  className,
}: MobileBottomSheetProps) {
  const isMobile = useIsMobile();

  useEffect(() => {
    if (isOpen && isMobile) {
      // Prevent body scroll when sheet is open
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen, isMobile]);

  if (!isMobile) {
    return null;
  }

  if (!isOpen) {
    return null;
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50 animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Bottom Sheet */}
      <div
        className={cn(
          "fixed bottom-0 left-0 right-0 z-50 bg-background rounded-t-2xl shadow-lg",
          "animate-in slide-in-from-bottom duration-300",
          "max-h-[90vh] flex flex-col",
          className
        )}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1.5 bg-muted-foreground/30 rounded-full" />
        </div>

        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between px-4 pb-4 border-b border-border">
            {title && (
              <h3 className="text-lg font-semibold">{title}</h3>
            )}
            {showCloseButton && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          {children}
        </div>
      </div>
    </>
  );
}
