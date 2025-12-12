/**
 * MobileShareSheet Component
 * Compartir nativo para móvil usando Web Share API
 */

import { ReactNode, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Share2, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface MobileShareSheetProps {
  title?: string;
  text?: string;
  url?: string;
  children?: ReactNode;
  className?: string;
}

export function MobileShareSheet({
  title,
  text,
  url,
  children,
  className,
}: MobileShareSheetProps) {
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const shareData = {
    title: title || document.title,
    text: text || "",
    url: url || window.location.href,
  };

  const handleNativeShare = async () => {
    if (!navigator.share) {
      // Fallback to copy
      handleCopy();
      return;
    }

    try {
      await navigator.share(shareData);
      toast({
        title: "Compartido",
        description: "Contenido compartido exitosamente",
      });
    } catch (error: any) {
      // User cancelled or error
      if (error.name !== "AbortError") {
        handleCopy();
      }
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareData.url);
      setCopied(true);
      toast({
        title: "Copiado",
        description: "URL copiada al portapapeles",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo copiar la URL",
        variant: "destructive",
      });
    }
  };

  if (!isMobile) {
    return children ? <>{children}</> : null;
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {children}
      <Button
        onClick={handleNativeShare}
        variant="outline"
        size="sm"
        className="gap-2"
      >
        <Share2 className="h-4 w-4" />
        <span>Compartir</span>
      </Button>
      {!navigator.share && (
        <Button
          onClick={handleCopy}
          variant="ghost"
          size="icon"
          className="h-8 w-8"
        >
          {copied ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </Button>
      )}
    </div>
  );
}

