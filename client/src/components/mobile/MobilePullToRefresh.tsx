/**
 * MobilePullToRefresh Component
 * Implementa pull-to-refresh para móvil
 */

import { ReactNode, useEffect, useRef, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { hapticPress, hapticSuccess } from "@/utils/haptic-feedback";

interface MobilePullToRefreshProps {
  children: ReactNode;
  onRefresh: () => Promise<void>;
  threshold?: number;
  className?: string;
}

export function MobilePullToRefresh({
  children,
  onRefresh,
  threshold = 80,
  className,
}: MobilePullToRefreshProps) {
  const isMobile = useIsMobile();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const startY = useRef<number>(0);
  const currentY = useRef<number>(0);

  useEffect(() => {
    if (!isMobile || !containerRef.current) return;

    const container = containerRef.current;
    let touchStartY = 0;
    let isDragging = false;

    const handleTouchStart = (e: TouchEvent) => {
      // Solo activar si estamos en el top del scroll
      if (container.scrollTop === 0) {
        touchStartY = e.touches[0].clientY;
        isDragging = true;
        startY.current = touchStartY;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging) return;

      currentY.current = e.touches[0].clientY;
      const distance = currentY.current - touchStartY;

      if (distance > 0 && container.scrollTop === 0) {
        e.preventDefault();
        setIsPulling(true);
        setPullDistance(Math.min(distance, threshold * 1.5));
      }
    };

    const handleTouchEnd = async () => {
      if (!isDragging) return;

      isDragging = false;

      if (pullDistance >= threshold && !isRefreshing) {
        hapticSuccess();
        setIsRefreshing(true);
        setPullDistance(threshold);
        
        try {
          await onRefresh();
        } finally {
          setIsRefreshing(false);
          setPullDistance(0);
          setIsPulling(false);
        }
      } else if (pullDistance > 20) {
        hapticPress();
        setPullDistance(0);
        setIsPulling(false);
      } else {
        setPullDistance(0);
        setIsPulling(false);
      }
    };

    container.addEventListener("touchstart", handleTouchStart, { passive: false });
    container.addEventListener("touchmove", handleTouchMove, { passive: false });
    container.addEventListener("touchend", handleTouchEnd);

    return () => {
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
      container.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isMobile, pullDistance, threshold, isRefreshing, onRefresh]);

  if (!isMobile) {
    return <div className={className}>{children}</div>;
  }

  const pullProgress = Math.min(pullDistance / threshold, 1);

  return (
    <div ref={containerRef} className={cn("relative overflow-auto", className)}>
      {/* Pull to refresh indicator */}
      <div
        className={cn(
          "absolute top-0 left-0 right-0 flex items-center justify-center transition-all duration-200",
          isPulling || isRefreshing ? "opacity-100" : "opacity-0"
        )}
        style={{
          transform: `translateY(${Math.min(pullDistance, threshold)}px)`,
          height: `${threshold}px`,
        }}
      >
        {isRefreshing ? (
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div
              className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent"
              style={{
                transform: `rotate(${pullProgress * 360}deg)`,
                transition: "transform 0.2s",
              }}
            />
            <span className="text-xs text-muted-foreground">
              {pullDistance >= threshold ? "Suelta para actualizar" : "Tira para actualizar"}
            </span>
          </div>
        )}
      </div>

      {/* Content with offset when pulling */}
      <div
        style={{
          transform: `translateY(${Math.min(pullDistance, threshold)}px)`,
          transition: isRefreshing ? "transform 0.2s" : "none",
        }}
      >
        {children}
      </div>
    </div>
  );
}

