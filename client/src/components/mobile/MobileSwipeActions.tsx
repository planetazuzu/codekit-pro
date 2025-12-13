/**
 * MobileSwipeActions Component
 * Permite acciones con swipe en listas para móvil
 */

import { ReactNode, useRef, useState, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { hapticPress, hapticSuccess } from "@/utils/haptic-feedback";

interface SwipeAction {
  label: string;
  icon?: ReactNode;
  color?: string;
  bgColor?: string;
  onAction: () => void;
}

interface MobileSwipeActionsProps {
  children: ReactNode;
  leftActions?: SwipeAction[];
  rightActions?: SwipeAction[];
  threshold?: number;
  className?: string;
}

export function MobileSwipeActions({
  children,
  leftActions = [],
  rightActions = [],
  threshold = 80,
  className,
}: MobileSwipeActionsProps) {
  const isMobile = useIsMobile();
  const containerRef = useRef<HTMLDivElement>(null);
  const [swipeDistance, setSwipeDistance] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<"left" | "right" | null>(null);
  const startX = useRef<number>(0);
  const currentX = useRef<number>(0);

  useEffect(() => {
    if (!isMobile || !containerRef.current) return;

    const container = containerRef.current;
    let touchStartX = 0;
    let isDragging = false;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX = e.touches[0].clientX;
      startX.current = touchStartX;
      isDragging = true;
      setIsSwiping(true);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging) return;

      currentX.current = e.touches[0].clientX;
      const distance = currentX.current - touchStartX;

      if (Math.abs(distance) > 10) {
        e.preventDefault();
        setSwipeDistance(distance);
        setSwipeDirection(distance > 0 ? "right" : "left");
      }
    };

    const handleTouchEnd = () => {
      if (!isDragging) return;

      isDragging = false;
      setIsSwiping(false);

      const absDistance = Math.abs(swipeDistance);
      const actions = swipeDirection === "left" ? rightActions : leftActions;

      if (absDistance >= threshold && actions.length > 0) {
        // Trigger haptic feedback
        hapticSuccess();
        // Trigger first action
        actions[0].onAction();
      } else if (absDistance > 10) {
        // Light haptic feedback during swipe
        hapticPress();
      }

      // Reset
      setTimeout(() => {
        setSwipeDistance(0);
        setSwipeDirection(null);
      }, 300);
    };

    container.addEventListener("touchstart", handleTouchStart, { passive: false });
    container.addEventListener("touchmove", handleTouchMove, { passive: false });
    container.addEventListener("touchend", handleTouchEnd);

    return () => {
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
      container.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isMobile, swipeDistance, threshold, leftActions, rightActions, swipeDirection]);

  if (!isMobile) {
    return <div className={className}>{children}</div>;
  }

  const actions = swipeDirection === "left" ? rightActions : leftActions;
  const showActions = Math.abs(swipeDistance) >= threshold / 2 && actions.length > 0;

  return (
    <div ref={containerRef} className={cn("relative overflow-hidden", className)}>
      {/* Background Actions */}
      <div
        className={cn(
          "absolute inset-y-0 flex items-center transition-all duration-300",
          swipeDirection === "left" ? "right-0 justify-end" : "left-0 justify-start",
          showActions ? "opacity-100" : "opacity-0"
        )}
        style={{
          width: `${Math.min(Math.abs(swipeDistance), threshold)}px`,
        }}
      >
        {actions.length > 0 && (
          <div
            className={cn(
              "flex items-center px-4 h-full",
              actions[0].bgColor || "bg-primary"
            )}
            style={{
              minWidth: `${threshold}px`,
            }}
          >
            {actions[0].icon && (
              <span className={cn("text-white", actions[0].color)}>
                {actions[0].icon}
              </span>
            )}
            <span className={cn("ml-2 text-sm font-medium text-white", actions[0].color)}>
              {actions[0].label}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div
        className="relative bg-background transition-transform duration-200"
        style={{
          transform: `translateX(${swipeDistance}px)`,
        }}
      >
        {children}
      </div>
    </div>
  );
}

