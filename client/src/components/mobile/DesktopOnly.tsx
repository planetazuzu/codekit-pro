/**
 * DesktopOnly Component
 * 
 * CRITICAL: This component uses CSS to control visibility, NOT conditional rendering.
 * Both children and fallback are always in the React tree - CSS shows/hides them.
 * 
 * ❌ NEVER change this to: isMobile ? null : children
 * ✅ ALWAYS keep: CSS classes control visibility
 * 
 * This prevents removeChild errors and maintains stable React tree structure.
 */

import { ReactNode } from "react";

interface DesktopOnlyProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function DesktopOnly({ children, fallback = null }: DesktopOnlyProps) {
  // CRITICAL: Always render both, CSS controls visibility
  // Using CSS prevents React tree changes that cause removeChild errors
  return (
    <>
      {/* Desktop: Hidden on mobile (below md), visible on desktop (md and above) */}
      <div className="hidden md:block">
        {children}
      </div>
      
      {/* Fallback: Visible on mobile (below md), hidden on desktop (md and above) */}
      {fallback && (
        <div className="block md:hidden">
          {fallback}
        </div>
      )}
    </>
  );
}

