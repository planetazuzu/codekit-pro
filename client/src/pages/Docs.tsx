/**
 * Documentation Page
 * Main documentation viewer with sidebar navigation
 */

import { Layout } from "@/layout/Layout";
import { useRoute } from "wouter";
import { DocsSidebar } from "@/components/docs/DocsSidebar";
import { MarkdownRenderer } from "@/components/docs/MarkdownRenderer";
import { Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { BackButton } from "@/components/common/BackButton";

// Map routes to markdown files
const docRoutes: Record<string, string> = {
  "/docs": "README.md",
  "/docs/introduccion": "01-introduccion/README.md",
  "/docs/introduccion/inicio-rapido": "01-introduccion/inicio-rapido.md",
  "/docs/guias": "02-guias/README.md",
  "/docs/guias/prompts": "02-guias/prompts.md",
  "/docs/comparativas": "03-comparativas/README.md",
  "/docs/comparativas/ia-programacion": "03-comparativas/ia-programacion.md",
  "/docs/arquitectura": "04-arquitectura/README.md",
  "/docs/arquitectura/arquitectura-general": "04-arquitectura/arquitectura-general.md",
  "/docs/buenas-practicas": "05-buenas-practicas/README.md",
  "/docs/conceptos": "06-conceptos/README.md",
  "/docs/faq": "07-faq/README.md",
};

export default function Docs() {
  const [match, params] = useRoute("/docs/:path*");
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get current path
  const currentPath = match ? `/docs${params?.path ? `/${params.path}` : ""}` : "/docs";

  useEffect(() => {
    const loadDoc = async () => {
      setLoading(true);
      setError(null);

      const docFile = docRoutes[currentPath] || docRoutes["/docs"];

      try {
        // Fetch markdown file via API
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
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Sidebar - Hidden on mobile, shown on desktop */}
        <div className="hidden md:block">
          <DocsSidebar />
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-4 md:px-8 py-6 md:py-8">
            {/* Back Button - Mobile only */}
            <div className="md:hidden mb-4">
              <BackButton />
            </div>

            {/* Content */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-destructive mb-4">{error}</p>
                <p className="text-muted-foreground text-sm">
                  El documento no está disponible. Verifica que el archivo existe.
                </p>
              </div>
            ) : (
              <MarkdownRenderer content={content} />
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

