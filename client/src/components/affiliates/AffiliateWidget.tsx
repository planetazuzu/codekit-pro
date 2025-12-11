/**
 * Embeddable Affiliate Widget
 * Can be used externally via script tag
 */

import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Affiliate } from "@shared/schema";

interface AffiliateWidgetProps {
  affiliate: Affiliate;
  variant?: "default" | "compact" | "banner";
  className?: string;
}

export function AffiliateWidget({
  affiliate,
  variant = "default",
  className,
}: AffiliateWidgetProps) {
  const handleClick = () => {
    // Track click via API
    fetch(`/api/affiliates/${affiliate.id}/click`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    }).catch(() => {});

    // Build URL
    let finalUrl = affiliate.url;
    if (affiliate.utm) {
      const separator = affiliate.url.includes("?") ? "&" : "?";
      finalUrl = `${affiliate.url}${separator}${affiliate.utm.replace(/^\?/, "")}`;
    }

    window.open(finalUrl, "_blank", "noopener,noreferrer");
  };

  if (variant === "compact") {
    return (
      <button
        onClick={handleClick}
        className={cn(
          "inline-flex items-center gap-2 px-3 py-1.5 rounded-full",
          "bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20",
          "text-sm text-blue-400 transition-colors",
          className
        )}
      >
        {affiliate.name}
        <ExternalLink className="h-3 w-3" />
      </button>
    );
  }

  if (variant === "banner") {
    return (
      <div
        className={cn(
          "flex items-center justify-between p-4 rounded-lg",
          "bg-gradient-to-r from-blue-500/10 to-purple-500/10",
          "border border-blue-500/20",
          className
        )}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-500/20">
            <ExternalLink className="h-5 w-5 text-blue-400" />
          </div>
          <div>
            <p className="font-medium text-foreground">{affiliate.name}</p>
          </div>
        </div>
        <Button onClick={handleClick} size="sm" variant="default">
          Usar enlace
        </Button>
      </div>
    );
  }

  // Default variant
  return (
    <div
      className={cn(
        "p-4 rounded-xl border border-border bg-card hover:bg-card/80 transition-colors",
        className
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary/10">
            <ExternalLink className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{affiliate.name}</h3>
            <Badge variant="secondary" className="text-xs mt-1">
              {affiliate.category}
            </Badge>
          </div>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        {affiliate.code && (
          <p className="text-sm text-yellow-400">
            Código: <code className="bg-yellow-400/10 px-1 rounded">{affiliate.code}</code>
          </p>
        )}
      </div>

      <Button onClick={handleClick} className="w-full" size="sm">
        VISITAR SITIO
        <ExternalLink className="ml-2 h-4 w-4" />
      </Button>
    </div>
  );
}

