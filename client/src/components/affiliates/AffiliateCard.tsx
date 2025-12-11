/**
 * Affiliate Card Component
 */

import { memo, useState, useCallback } from "react";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Affiliate } from "@shared/schema";
import { useTrackAffiliateClick } from "@/hooks/use-affiliates";

interface AffiliateCardProps {
  affiliate: Affiliate;
  className?: string;
}

// Icon mapping - using lucide-react icons
const iconMap: Record<string, string> = {
  Server: "Server",
  Rocket: "Rocket",
  Cloud: "Cloud",
  Terminal: "Terminal",
  Github: "Github",
  LayoutGrid: "LayoutGrid",
  Notebook: "Notebook",
  Sparkles: "Sparkles",
  Brush: "Brush",
};

export const AffiliateCard = memo(function AffiliateCard({ affiliate, className }: AffiliateCardProps) {
  const trackClick = useTrackAffiliateClick();
  const [isNavigating, setIsNavigating] = useState(false);

  const handleClick = useCallback(async (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    
    if (isNavigating) return;
    
    setIsNavigating(true);
    
    try {
      // Track click
      await trackClick.mutateAsync(affiliate.id);
      
      // Build final URL with UTM
      let finalUrl = affiliate.url;
      if (affiliate.utm) {
        const separator = affiliate.url.includes("?") ? "&" : "?";
        finalUrl = `${affiliate.url}${separator}${affiliate.utm.replace(/^\?/, "")}`;
      } else {
        // Generate default UTM if not provided
        const separator = affiliate.url.includes("?") ? "&" : "?";
        finalUrl = `${affiliate.url}${separator}utm_source=codekit&utm_medium=app&utm_campaign=affiliate`;
      }
      
      // Open in new tab
      window.open(finalUrl, "_blank", "noopener,noreferrer");
    } catch (error) {
      // Error tracking click - silently fail to avoid disrupting UX
      // Still open the link even if tracking fails
      window.open(affiliate.url, "_blank", "noopener,noreferrer");
    } finally {
      setIsNavigating(false);
    }
  }, [affiliate, trackClick]);

  // Get icon component dynamically
  const IconName = iconMap[affiliate.icon || "Link"] || "ExternalLink";
  
  return (
    <div className={cn(
      "group relative rounded-xl border border-white/10 bg-[#161B22] p-6 transition-all hover:bg-[#1e2633] hover:border-white/20",
      className
    )}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-500/10">
            <ExternalLink className="h-5 w-5 text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">{affiliate.name}</h3>
            <Badge variant="secondary" className="mt-1 text-xs">
              {affiliate.category}
            </Badge>
          </div>
        </div>
      </div>


      {affiliate.code && (
        <div className="mb-3">
          <span className="text-yellow-400 text-xs">
            Código: <code className="bg-yellow-400/10 px-1.5 py-0.5 rounded">{affiliate.code}</code>
          </span>
        </div>
      )}

      <Button
        onClick={handleClick}
        disabled={isNavigating}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
        size="sm"
      >
        {isNavigating ? "Abriendo..." : "VISITAR SITIO"}
        <ExternalLink className="ml-2 h-4 w-4" />
      </Button>
    </div>
  );
});

