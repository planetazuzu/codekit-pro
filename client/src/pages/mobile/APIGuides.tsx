/**
 * Mobile-optimized APIGuides Page
 * Optimized for reading on mobile
 */

import { Layout } from "@/layout/Layout";
import { useState } from "react";
import { ExternalLink, Copy, Check, Key, DollarSign, Gift } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiGuides, type APIGuide } from "@/data/api-guides";
import { Button } from "@/components/ui/button";
import { BackButton } from "@/components/common/BackButton";
import { MobilePullToRefresh } from "@/components/mobile";
import { useTrackPageView } from "@/hooks/use-track-view";

export default function MobileAPIGuides() {
  useTrackPageView("page", "api-guides-mobile");
  const { toast } = useToast();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast({
      title: "Copiado",
      description: "El texto ha sido copiado al portapapeles.",
    });
  };

  return (
    <Layout>
      <MobilePullToRefresh onRefresh={async () => {}}>
        <div className="space-y-4 pb-20">
          {/* Header */}
          <div className="flex items-center gap-3">
            <BackButton />
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight">Guías de APIs</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Aprende cómo obtener API keys y tokens para herramientas de IA.
            </p>
          </div>

          <div className="space-y-4">
            {apiGuides.map((guide) => (
              <MobileAPIGuideCard 
                key={guide.id} 
                guide={guide} 
                onCopy={copyToClipboard} 
                copiedId={copiedId} 
              />
            ))}
          </div>
        </div>
      </MobilePullToRefresh>
    </Layout>
  );
}

function MobileAPIGuideCard({ 
  guide, 
  onCopy, 
  copiedId 
}: { 
  guide: APIGuide; 
  onCopy: (text: string, id: string) => void;
  copiedId: string | null;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-base mb-2">{guide.name}</h3>
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            {guide.pricing && (
              <div className="flex items-center gap-1">
                <DollarSign className="h-3.5 w-3.5" />
                <span>{guide.pricing}</span>
              </div>
            )}
            {guide.freeTier && (
              <div className="flex items-center gap-1 text-green-500">
                <Gift className="h-3.5 w-3.5" />
                <span>{guide.freeTier}</span>
              </div>
            )}
          </div>
        </div>
        <a
          href={guide.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:text-primary/80 transition-colors flex-shrink-0"
        >
          <ExternalLink className="h-5 w-5" />
        </a>
      </div>

      {guide.apiUrl !== 'N/A' && (
        <div className="mb-3 p-3 bg-secondary/50 rounded-md border border-border/50">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <Key className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs font-mono text-muted-foreground">API URL:</span>
            </div>
            <button
              onClick={() => onCopy(guide.apiUrl, `${guide.id}-api`)}
              className="p-1 hover:bg-secondary rounded transition-colors"
            >
              {copiedId === `${guide.id}-api` ? (
                <Check className="h-3.5 w-3.5 text-green-500" />
              ) : (
                <Copy className="h-3.5 w-3.5 text-muted-foreground" />
              )}
            </button>
          </div>
          <code className="text-xs font-mono text-foreground block break-all">
            {guide.apiUrl}
          </code>
        </div>
      )}

      <div className="space-y-2 mb-3">
        <h4 className="text-sm font-semibold">Pasos para obtener el token:</h4>
        <ol className="space-y-2">
          {guide.steps.map((step, index) => (
            <li key={index} className="flex gap-2.5 text-sm">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold">
                {index + 1}
              </span>
              <span className="text-muted-foreground leading-relaxed pt-0.5">{step}</span>
            </li>
          ))}
        </ol>
      </div>

      <div className="pt-3 border-t border-border/50">
        <a href={guide.url} target="_blank" rel="noopener noreferrer" className="block">
          <Button variant="outline" className="w-full" size="sm">
            Ir a {guide.name}
            <ExternalLink className="h-4 w-4 ml-2" />
          </Button>
        </a>
      </div>
    </div>
  );
}
