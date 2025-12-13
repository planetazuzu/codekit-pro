import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy, Check, Download, X } from "lucide-react";
import { useState, memo, useCallback, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import type { Prompt } from "@/hooks/use-prompts";
import type { Snippet } from "@/hooks/use-snippets";

interface DetailViewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: "prompt" | "snippet";
  data: Prompt | Snippet | null;
}

export const DetailView = memo(function DetailView({ open, onOpenChange, type, data }: DetailViewProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: "Copiado",
      description: `El ${type === "prompt" ? "prompt" : "snippet"} ha sido copiado al portapapeles.`,
    });
  }, [type, toast]);

  const handleExportMarkdown = useCallback(() => {
    if (!data) return;
    
    let markdown = "";
    
    if (type === "prompt") {
      const prompt = data as Prompt;
      markdown = `# ${prompt.title}\n\n`;
      markdown += `**Categoría:** ${prompt.category}\n\n`;
      if (prompt.tags && prompt.tags.length > 0) {
        markdown += `**Tags:** ${prompt.tags.map(t => `\`${t}\``).join(", ")}\n\n`;
      }
      markdown += `---\n\n`;
      markdown += `${prompt.content}\n`;
    } else {
      const snippet = data as Snippet;
      markdown = `# ${snippet.title}\n\n`;
      markdown += `**Lenguaje:** ${snippet.language}\n\n`;
      markdown += `**Descripción:** ${snippet.description}\n\n`;
      if (snippet.tags && snippet.tags.length > 0) {
        markdown += `**Tags:** ${snippet.tags.map(t => `\`${t}\``).join(", ")}\n\n`;
      }
      markdown += `---\n\n`;
      markdown += `\`\`\`${snippet.language}\n`;
      markdown += `${snippet.code}\n`;
      markdown += `\`\`\`\n`;
    }
    
    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${type === "prompt" ? "prompt" : "snippet"}-${data.title.replace(/[^a-z0-9]/gi, "-").toLowerCase()}.md`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Exportado",
      description: `El ${type === "prompt" ? "prompt" : "snippet"} ha sido exportado como Markdown.`,
    });
  }, [data, type, toast]);

  const markdownContent = useMemo(() => {
    if (!data) return "";
    
    if (type === "prompt") {
      const prompt = data as Prompt;
      let markdown = `# ${prompt.title}\n\n`;
      markdown += `**Categoría:** ${prompt.category}\n\n`;
      if (prompt.tags && prompt.tags.length > 0) {
        markdown += `**Tags:** ${prompt.tags.map(t => `\`${t}\``).join(", ")}\n\n`;
      }
      markdown += `---\n\n`;
      markdown += `${prompt.content}\n`;
      return markdown;
    } else {
      const snippet = data as Snippet;
      let markdown = `# ${snippet.title}\n\n`;
      markdown += `**Lenguaje:** ${snippet.language}\n\n`;
      markdown += `**Descripción:** ${snippet.description}\n\n`;
      if (snippet.tags && snippet.tags.length > 0) {
        markdown += `**Tags:** ${snippet.tags.map(t => `\`${t}\``).join(", ")}\n\n`;
      }
      markdown += `---\n\n`;
      markdown += `\`\`\`${snippet.language}\n`;
      markdown += `${snippet.code}\n`;
      markdown += `\`\`\`\n`;
      return markdown;
    }
  }, [data, type]);

  if (!data) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl">{data.title}</DialogTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (type === "prompt") {
                    handleCopy((data as Prompt).content);
                  } else {
                    handleCopy((data as Snippet).code);
                  }
                }}
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Copiado
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Copiar
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const blob = new Blob([markdownContent], { type: "text/markdown" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `${type === "prompt" ? "prompt" : "snippet"}-${data.title.replace(/[^a-z0-9]/gi, "-").toLowerCase()}.md`;
                  a.click();
                  URL.revokeObjectURL(url);
                  handleExportMarkdown();
                }}
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar MD
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Metadata */}
          <div className="flex flex-wrap gap-2">
            {type === "prompt" ? (
              <>
                <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary ring-1 ring-inset ring-primary/20">
                  {(data as Prompt).category}
                </span>
                {(data as Prompt).tags?.map(tag => (
                  <span key={tag} className="inline-flex items-center rounded-md bg-secondary px-2 py-1 text-xs text-muted-foreground border border-border">
                    #{tag}
                  </span>
                ))}
              </>
            ) : (
              <>
                <span className="inline-flex items-center rounded-md bg-emerald-500/10 px-2 py-1 text-xs font-medium text-emerald-500 ring-1 ring-inset ring-emerald-500/20">
                  {(data as Snippet).language}
                </span>
                {(data as Snippet).tags?.map(tag => (
                  <span key={tag} className="inline-flex items-center rounded-md bg-secondary px-2 py-1 text-xs text-muted-foreground border border-border">
                    #{tag}
                  </span>
                ))}
              </>
            )}
          </div>

          {/* Description (for snippets) */}
          {type === "snippet" && (data as Snippet).description && (
            <div>
              <h3 className="text-sm font-semibold mb-2">Descripción</h3>
              <p className="text-sm text-muted-foreground">{(data as Snippet).description}</p>
            </div>
          )}

          {/* Content */}
          <div>
            <h3 className="text-sm font-semibold mb-2">
              {type === "prompt" ? "Contenido del Prompt" : "Código"}
            </h3>
            {type === "prompt" ? (
              <div className="rounded-lg border border-border bg-secondary/30 p-4">
                <pre className="text-sm whitespace-pre-wrap font-mono text-foreground">
                  {(data as Prompt).content}
                </pre>
              </div>
            ) : (
              <div className="rounded-lg border border-border overflow-hidden">
                <SyntaxHighlighter 
                  language={(data as Snippet).language} 
                  style={vscDarkPlus}
                  customStyle={{ margin: 0, padding: '1.5rem', background: '#1E1E1E' }}
                >
                  {(data as Snippet).code}
                </SyntaxHighlighter>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
});

