import { useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useTrackView } from "./use-analytics";

// Global state to prevent duplicate tracking across all instances
const globalTrackingState = new Map<string, { lastAttempt: number; cooldownUntil?: number }>();

const MIN_TRACKING_INTERVAL = 2000; // Minimum 2 seconds between tracking attempts
const RATE_LIMIT_COOLDOWN = 60000; // 60 seconds cooldown after 429 error

export function useTrackPageView(entityType?: string, entityId?: string) {
  const [location] = useLocation();
  const trackView = useTrackView();
  const lastTrackedRef = useRef<string>("");
  const isTrackingRef = useRef<boolean>(false);

  useEffect(() => {
    // Prevent duplicate tracking if location hasn't changed
    const trackingKey = `${location}-${entityType}-${entityId}`;
    
    // Check if we've already successfully tracked this key
    if (lastTrackedRef.current === trackingKey) {
      return;
    }

    // Check if there's already a request in-flight for this key
    if (isTrackingRef.current) {
      return;
    }

    // Check global state for rate limiting and cooldowns
    const globalState = globalTrackingState.get(trackingKey);
    const now = Date.now();
    
    if (globalState) {
      // If we're in a cooldown period (e.g., after 429 error), skip
      if (globalState.cooldownUntil && now < globalState.cooldownUntil) {
        return;
      }
      
      // If we attempted too recently, skip (debouncing)
      if (now - globalState.lastAttempt < MIN_TRACKING_INTERVAL) {
        return;
      }
    }

    // Mark as tracking to prevent duplicate requests
    isTrackingRef.current = true;
    
    // Update global state
    globalTrackingState.set(trackingKey, {
      lastAttempt: now,
    });

    // Track page view with error handling - don't block render if tracking fails
    trackView.mutate(
      {
        page: location,
        entityType,
        entityId,
      },
      {
        onError: (error: unknown) => {
          // Check if it's a 429 (rate limit) error
          const isRateLimit = error instanceof Error && 
            (error.message.includes("429") || error.message.includes("Too Many Requests"));
          
          if (isRateLimit) {
            // Set cooldown period after rate limit error
            const cooldownUntil = now + RATE_LIMIT_COOLDOWN;
            globalTrackingState.set(trackingKey, {
              lastAttempt: now,
              cooldownUntil,
            });
            console.warn("Rate limited on analytics tracking, cooldown active:", trackingKey);
          } else {
            // For other errors, update last attempt but don't set cooldown
            globalTrackingState.set(trackingKey, {
              lastAttempt: now,
            });
            console.warn("Failed to track page view:", error);
          }
          
          // Mark as attempted even on error to prevent immediate retries
          // But don't update lastTrackedRef so it will retry on next navigation
          isTrackingRef.current = false;
        },
        onSuccess: () => {
          // Success - mark as tracked
          lastTrackedRef.current = trackingKey;
          globalTrackingState.delete(trackingKey); // Clean up global state on success
          isTrackingRef.current = false;
        },
      }
    );
  }, [location, entityType, entityId]); // Removed trackView from dependencies - use mutation directly
}

