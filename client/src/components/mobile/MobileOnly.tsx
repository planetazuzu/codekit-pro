/**
 * MobileOnly Component
 * 
 * CRITICAL: This component uses CSS to control visibility, NOT conditional rendering.
 * Both children and fallback are always in the React tree - CSS shows/hides them.
 * 
 * ❌ NEVER change this to: isMobile ? children : null
 * ✅ ALWAYS keep: CSS classes control visibility
 * 
 * This prevents removeChild errors and maintains stable React tree structure.
 */

import { ReactNode } from "react";

interface MobileOnlyProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function MobileOnly({ children, fallback = null }: MobileOnlyProps) {
  // CRITICAL: Always render both, CSS controls visibility
  // Using CSS prevents React tree changes that cause removeChild errors
  return (
    <>
      {/* Mobile: Visible on mobile (below md), hidden on desktop (md and above) */}
      <div className="block md:hidden">
        {children}
      </div>
      
      {/* Fallback: Hidden on mobile (below md), visible on desktop (md and above) */}
      {fallback && (
        <div className="hidden md:block">
          {fallback}
        </div>
      )}
    </>
  );
}

