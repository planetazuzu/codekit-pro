/**
 * MobileGestureHandler Component
 * Manejo de gestos táctiles para móvil
 */

import { ReactNode, useRef, useState, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

type GestureType = "tap" | "doubleTap" | "longPress" | "swipe" | "pinch" | "pan";

interface GestureConfig {
  onTap?: () => void;
  onDoubleTap?: () => void;
  onLongPress?: () => void;
  onSwipe?: (direction: "up" | "down" | "left" | "right") => void;
  onPinch?: (scale: number) => void;
  onPan?: (deltaX: number, deltaY: number) => void;
  longPressDelay?: number;
  swipeThreshold?: number;
}

interface MobileGestureHandlerProps {
  children: ReactNode;
  gestures: GestureConfig;
  className?: string;
  disabled?: boolean;
}

export function MobileGestureHandler({
  children,
  gestures,
  className,
  disabled = false,
}: MobileGestureHandlerProps) {
  const isMobile = useIsMobile();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLongPressing, setIsLongPressing] = useState(false);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const lastTapTime = useRef<number>(0);
  const touchStart = useRef<{ x: number; y: number; time: number } | null>(null);
  const touchStartDistance = useRef<number>(0);

  useEffect(() => {
    if (!isMobile || !containerRef.current || disabled) return;

    const container = containerRef.current;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        const touch = e.touches[0];
        touchStart.current = {
          x: touch.clientX,
          y: touch.clientY,
          time: Date.now(),
        };

        // Long press
        if (gestures.onLongPress) {
          longPressTimer.current = setTimeout(() => {
            setIsLongPressing(true);
            gestures.onLongPress?.();
          }, gestures.longPressDelay || 500);
        }
      } else if (e.touches.length === 2 && gestures.onPinch) {
        // Pinch start
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        touchStartDistance.current = Math.hypot(
          touch2.clientX - touch1.clientX,
          touch2.clientY - touch1.clientY
        );
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      // Cancel long press if moving
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
      }

      if (e.touches.length === 2 && gestures.onPinch && touchStartDistance.current > 0) {
        // Pinch
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const currentDistance = Math.hypot(
          touch2.clientX - touch1.clientX,
          touch2.clientY - touch1.clientY
        );
        const scale = currentDistance / touchStartDistance.current;
        gestures.onPinch(scale);
      } else if (e.touches.length === 1 && touchStart.current && gestures.onPan) {
        // Pan
        const touch = e.touches[0];
        const deltaX = touch.clientX - touchStart.current.x;
        const deltaY = touch.clientY - touchStart.current.y;
        gestures.onPan(deltaX, deltaY);
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      // Cancel long press
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
      }

      if (!touchStart.current) return;

      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - touchStart.current.x;
      const deltaY = touch.clientY - touchStart.current.y;
      const deltaTime = Date.now() - touchStart.current.time;
      const distance = Math.hypot(deltaX, deltaY);

      // Swipe
      if (gestures.onSwipe && distance > (gestures.swipeThreshold || 50) && deltaTime < 300) {
        const absX = Math.abs(deltaX);
        const absY = Math.abs(deltaY);
        
        if (absX > absY) {
          gestures.onSwipe(deltaX > 0 ? "right" : "left");
        } else {
          gestures.onSwipe(deltaY > 0 ? "down" : "up");
        }
      } else if (distance < 10 && deltaTime < 300) {
        // Tap or Double Tap
        const now = Date.now();
        const timeSinceLastTap = now - lastTapTime.current;

        if (timeSinceLastTap < 300 && gestures.onDoubleTap) {
          gestures.onDoubleTap();
          lastTapTime.current = 0;
        } else {
          lastTapTime.current = now;
          if (gestures.onTap && !isLongPressing) {
            setTimeout(() => {
              if (Date.now() - lastTapTime.current < 300) {
                gestures.onTap?.();
              }
            }, 300);
          }
        }
      }

      setIsLongPressing(false);
      touchStart.current = null;
      touchStartDistance.current = 0;
    };

    container.addEventListener("touchstart", handleTouchStart, { passive: true });
    container.addEventListener("touchmove", handleTouchMove, { passive: true });
    container.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
      container.removeEventListener("touchend", handleTouchEnd);
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
      }
    };
  }, [isMobile, gestures, disabled, isLongPressing]);

  if (!isMobile) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div ref={containerRef} className={cn("touch-none", className)}>
      {children}
    </div>
  );
}

