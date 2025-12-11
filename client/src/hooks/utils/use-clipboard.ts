/**
 * Hook for copying text to clipboard
 */

import { useState } from "react";

export interface UseClipboardReturn {
  copy: (text: string) => Promise<boolean>;
  copied: boolean;
  error: Error | null;
}

/**
 * Hook to copy text to clipboard
 */
export function useClipboard(): UseClipboardReturn {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const copy = async (text: string): Promise<boolean> => {
    try {
      setError(null);

      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback for older browsers
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        const successful = document.execCommand("copy");
        document.body.removeChild(textArea);

        if (!successful) {
          throw new Error("Failed to copy text");
        }
      }

      setCopied(true);
      setTimeout(() => setCopied(false), 2000);

      return true;
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to copy");
      setError(error);
      return false;
    }
  };

  return { copy, copied, error };
}

