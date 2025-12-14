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
  const trackingKeyRef = useRef<string>("");
  const mutateRef = useRef(trackView.mutate);

  // Keep mutate ref updated
  useEffect(() => {
    mutateRef.current = trackView.mutate;
  }, [trackView.mutate]);

  useEffect(() => {
    const trackingKey = `${location}-${entityType}-${entityId}`;
    
    // Early return if already tracked successfully
    if (lastTrackedRef.current === trackingKey) {
      return;
    }

    // Early return if already tracking
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

    // Mark as tracking IMMEDIATELY to prevent duplicate requests
    isTrackingRef.current = true;
    trackingKeyRef.current = trackingKey;
    
    // Update global state IMMEDIATELY
    globalTrackingState.set(trackingKey, {
      lastAttempt: now,
    });

    // Track page view - defer to next tick to avoid render loops
    // Store values in refs to avoid closure issues
    const page = location;
    const et = entityType;
    const eid = entityId;

    const executeTracking = () => {
      // Double-check we're still tracking the same key
      if (trackingKeyRef.current !== trackingKey) {
        isTrackingRef.current = false;
        return;
      }

      mutateRef.current(
        {
          page,
          entityType: et,
          entityId: eid,
        },
        {
          onError: (error: unknown) => {
            const currentKey = trackingKeyRef.current;
            
            // Only update if this is still the current tracking key
            if (currentKey !== trackingKey) {
              return;
            }

            const isRateLimit = error instanceof Error && 
              (error.message.includes("429") || error.message.includes("Too Many Requests"));
            
            if (isRateLimit) {
              const cooldownUntil = Date.now() + RATE_LIMIT_COOLDOWN;
              globalTrackingState.set(currentKey, {
                lastAttempt: Date.now(),
                cooldownUntil,
              });
              console.warn("Rate limited on analytics tracking, cooldown active:", currentKey);
            } else {
              globalTrackingState.set(currentKey, {
                lastAttempt: Date.now(),
              });
              console.warn("Failed to track page view:", error);
            }
            
            isTrackingRef.current = false;
          },
          onSuccess: () => {
            const currentKey = trackingKeyRef.current;
            
            // Only update if this is still the current tracking key
            if (currentKey !== trackingKey) {
              return;
            }

            lastTrackedRef.current = currentKey;
            globalTrackingState.delete(currentKey);
            isTrackingRef.current = false;
          },
        }
      );
    };

    // Defer execution to prevent render loops
    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      window.requestIdleCallback(executeTracking, { timeout: 200 });
    } else {
      setTimeout(executeTracking, 200);
    }
  }, [location, entityType, entityId]); // Only depend on location/entity, not trackView
}

