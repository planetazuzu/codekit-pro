/**
 * Mobile-optimized Docs Page
 * Single column layout for better mobile reading
 */

import { Layout } from "@/layout/Layout";
import { useLocation } from "wouter";
import { MarkdownRenderer } from "@/components/docs/MarkdownRenderer";
import { Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { BackButton } from "@/components/common/BackButton";
import { MobilePullToRefresh } from "@/components/mobile";
import { useTrackPageView } from "@/hooks/use-track-view";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";

const docRoutes: Record<string, string> = {
  "/docs": "public/README.md",
  "/docs/introduccion": "public/introduccion/README.md",
  "/docs/introduccion/inicio-rapido": "public/introduccion/inicio-rapido.md",
  "/docs/guias": "public/guias/README.md",
  "/docs/guias/prompts": "public/guias/prompts.md",
  "/docs/comparativas": "public/comparativas/README.md",
  "/docs/comparativas/ia-programacion": "public/comparativas/ia-programacion.md",
  "/docs/conceptos": "public/conceptos/README.md",
  "/docs/faq": "public/faq/README.md",
};

export default function MobileDocs() {
  useTrackPageView("page", "docs-mobile");
  const [location] = useLocation();
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentPath = location.startsWith("/docs") ? location : "/docs";

  useEffect(() => {
    const loadDoc = async () => {
      setLoading(true);
      setError(null);

      const docFile = docRoutes[currentPath] || docRoutes["/docs"];

      try {
        const response = await fetch(`/api/docs/${docFile}`);
        
        if (!response.ok) {
          throw new Error(`Documento no encontrado: ${docFile}`);
        }

        const text = await response.text();
        setContent(text);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al cargar documento");
        console.error("Error loading doc:", err);
      } finally {
        setLoading(false);
      }
    };

    loadDoc();
  }, [currentPath]);

  return (
    <Layout>
      <MobilePullToRefresh onRefresh={async () => { window.location.reload(); }}>
        <div className="max-w-full mx-auto px-4 py-4 pb-20">
          {/* Back Button */}
          <div className="mb-4">
            <BackButton />
          </div>

          {/* Content */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="text-center py-12 px-4">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-destructive mb-4 text-sm">{error}</p>
              <p className="text-muted-foreground text-xs mb-4">
                El documento no está disponible. Verifica que el archivo existe.
              </p>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.location.reload()}
              >
                Reintentar
              </Button>
            </div>
          ) : (
            <div className="prose prose-invert max-w-none">
              <MarkdownRenderer content={content} />
            </div>
          )}
        </div>
      </MobilePullToRefresh>
    </Layout>
  );
}
