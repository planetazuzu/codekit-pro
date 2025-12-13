import { useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useTrackView } from "./use-analytics";

export function useTrackPageView(entityType?: string, entityId?: string) {
  const [location] = useLocation();
  const trackView = useTrackView();
  const lastTrackedRef = useRef<string>("");

  useEffect(() => {
    // Prevent duplicate tracking if location hasn't changed
    const trackingKey = `${location}-${entityType}-${entityId}`;
    if (lastTrackedRef.current === trackingKey) {
      return;
    }

    // Track page view with error handling - don't block render if tracking fails
    trackView.mutate(
      {
        page: location,
        entityType,
        entityId,
      },
      {
        onError: (error) => {
          // Silently fail tracking - don't interrupt user experience
          console.warn("Failed to track page view:", error);
        },
        onSuccess: () => {
          lastTrackedRef.current = trackingKey;
        },
      }
    );
  }, [location, entityType, entityId, trackView]);
}

