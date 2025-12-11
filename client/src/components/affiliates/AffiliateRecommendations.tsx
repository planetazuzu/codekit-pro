/**
 * Affiliate Recommendations Component
 * Shows context-aware affiliate links based on content type
 */

import { useMemo } from "react";
import { ExternalLink, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAffiliates, useTrackAffiliateClick } from "@/hooks/use-affiliates";
import { cn } from "@/lib/utils";
import type { Affiliate } from "@shared/schema";

interface AffiliateRecommendationsProps {
  /**
   * Context type: prompt, snippet, tool, guide
   */
  context: "prompt" | "snippet" | "tool" | "guide";
  /**
   * Category or keywords to match
   */
  category?: string;
  /**
   * Additional keywords for better matching
   */
  keywords?: string[];
  /**
   * Maximum number of recommendations
   */
  limit?: number;
  /**
   * Custom class
   */
  className?: string;
  /**
   * Compact mode for inline display
   */
  compact?: boolean;
}

// Mapping of keywords to affiliate categories
const KEYWORD_MAPPINGS: Record<string, string[]> = {
  // Hosting & Deployment
  hosting: ["Hosting", "Cloud", "Deployment"],
  deploy: ["Deployment", "Hosting", "Cloud"],
  vercel: ["Deployment"],
  netlify: ["Deployment"],
  server: ["Hosting", "Cloud"],
  
  // Frontend
  ui: ["UI Kits", "Diseño"],
  tailwind: ["UI Kits"],
  react: ["UI Kits", "Desarrollo"],
  css: ["UI Kits", "Diseño"],
  design: ["Diseño", "UI Kits"],
  frontend: ["UI Kits", "Desarrollo"],
  
  // Backend
  backend: ["Cloud", "Hosting", "IA & DevTools"],
  api: ["Cloud", "IA & DevTools"],
  database: ["Cloud", "Hosting"],
  node: ["IA & DevTools", "Hosting"],
  express: ["IA & DevTools", "Hosting"],
  
  // AI & Productivity
  ai: ["IA", "IA & DevTools"],
  ia: ["IA", "IA & DevTools"],
  gpt: ["IA"],
  copilot: ["IA", "IA & DevTools"],
  productivity: ["Productividad"],
  productividad: ["Productividad"],
  notion: ["Productividad"],
  
  // Tools
  code: ["IA & DevTools", "Desarrollo"],
  terminal: ["IA & DevTools"],
  ide: ["IA & DevTools"],
  editor: ["IA & DevTools"],
};

// Context to category mappings
const CONTEXT_MAPPINGS: Record<string, string[]> = {
  prompt: ["IA", "IA & DevTools", "Productividad"],
  snippet: ["IA & DevTools", "Desarrollo", "UI Kits"],
  tool: ["IA & DevTools", "Productividad", "Desarrollo"],
  guide: ["UI Kits", "Desarrollo", "Productividad"],
};

export function AffiliateRecommendations({
  context,
  category,
  keywords = [],
  limit = 3,
  className,
  compact = false,
}: AffiliateRecommendationsProps) {
  const { data: affiliates } = useAffiliates();
  const trackClick = useTrackAffiliateClick();

  const recommendations = useMemo(() => {
    if (!affiliates?.length) return [];

    // Build list of relevant categories
    const relevantCategories = new Set<string>();

    // Add context-based categories
    CONTEXT_MAPPINGS[context]?.forEach((cat) => relevantCategories.add(cat));

    // Add category if provided
    if (category) {
      relevantCategories.add(category);
      // Also check keyword mappings for the category
      const mappedCats = KEYWORD_MAPPINGS[category.toLowerCase()];
      mappedCats?.forEach((cat) => relevantCategories.add(cat));
    }

    // Add keyword-based categories
    keywords.forEach((keyword) => {
      const mappedCats = KEYWORD_MAPPINGS[keyword.toLowerCase()];
      mappedCats?.forEach((cat) => relevantCategories.add(cat));
    });

    // Score and filter affiliates
    const scored = affiliates
      .map((affiliate) => {
        let score = 0;

        // Higher score if category matches
        if (relevantCategories.has(affiliate.category)) {
          score += 10;
        }

        // Commission removed from public scoring

        // Bonus for having a discount code
        if (affiliate.code) {
          score += 5;
        }

        return { affiliate, score };
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((item) => item.affiliate);

    return scored;
  }, [affiliates, context, category, keywords, limit]);

  const handleClick = async (affiliate: Affiliate) => {
    try {
      await trackClick.mutateAsync(affiliate.id);
      
      // Build final URL
      let finalUrl = affiliate.url;
      if (affiliate.utm) {
        const separator = affiliate.url.includes("?") ? "&" : "?";
        finalUrl = `${affiliate.url}${separator}${affiliate.utm.replace(/^\?/, "")}`;
      } else {
        const separator = affiliate.url.includes("?") ? "&" : "?";
        finalUrl = `${affiliate.url}${separator}utm_source=codekit&utm_medium=recommendation&utm_campaign=${context}`;
      }
      
      window.open(finalUrl, "_blank", "noopener,noreferrer");
    } catch (error) {
      // Error tracking click - silently fail to avoid disrupting UX
      window.open(affiliate.url, "_blank", "noopener,noreferrer");
    }
  };

  if (!recommendations.length) {
    return null;
  }

  if (compact) {
    return (
      <div className={cn("flex flex-wrap gap-2", className)}>
        {recommendations.map((affiliate) => (
          <Button
            key={affiliate.id}
            variant="outline"
            size="sm"
            onClick={() => handleClick(affiliate)}
            className="text-xs"
          >
            {affiliate.name}
            <ExternalLink className="ml-1 h-3 w-3" />
          </Button>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("rounded-lg border border-border bg-card/50 p-4", className)}>
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="h-4 w-4 text-yellow-400" />
        <h4 className="text-sm font-medium text-foreground">
          Herramientas recomendadas
        </h4>
      </div>

      <div className="space-y-2">
        {recommendations.map((affiliate) => (
          <button
            key={affiliate.id}
            onClick={() => handleClick(affiliate)}
            className="w-full flex items-center justify-between p-3 rounded-md bg-background/50 hover:bg-background transition-colors text-left group"
          >
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded bg-blue-500/10">
                <ExternalLink className="h-4 w-4 text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground group-hover:text-blue-400 transition-colors">
                  {affiliate.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {affiliate.category}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {affiliate.code && (
                <Badge variant="secondary" className="text-xs text-yellow-400 bg-yellow-400/10">
                  {affiliate.code}
                </Badge>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

