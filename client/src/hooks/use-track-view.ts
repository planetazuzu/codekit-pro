import { useEffect } from "react";
import { useLocation } from "wouter";
import { useTrackView } from "./use-analytics";

export function useTrackPageView(entityType?: string, entityId?: string) {
  const [location] = useLocation();
  const trackView = useTrackView();

  useEffect(() => {
    // Track page view
    trackView.mutate({
      page: location,
      entityType,
      entityId,
    });
  }, [location, entityType, entityId]);
}

