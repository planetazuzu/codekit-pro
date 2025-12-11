/**
 * Back Button Component
 * Reusable back button for navigation
 */

import { ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BackButtonProps {
  /** Custom label for the button */
  label?: string;
  /** Custom href to navigate to */
  href?: string;
  /** Additional className */
  className?: string;
  /** Variant of the button */
  variant?: "default" | "outline" | "ghost";
}

export function BackButton({ 
  label = "Atrás", 
  href,
  className,
  variant = "ghost"
}: BackButtonProps) {
  const [, setLocation] = useLocation();

  const handleClick = () => {
    if (href) {
      setLocation(href);
    } else {
      // Go back in browser history
      window.history.back();
    }
  };

  return (
    <Button
      variant={variant}
      size="sm"
      onClick={handleClick}
      className={cn("gap-2", className)}
    >
      <ArrowLeft className="h-4 w-4" />
      {label}
    </Button>
  );
}

