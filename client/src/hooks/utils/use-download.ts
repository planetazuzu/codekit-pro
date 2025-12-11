/**
 * Hook for downloading files
 */

import { useCallback } from "react";

export interface UseDownloadReturn {
  download: (data: Blob | string, filename: string, mimeType?: string) => void;
  downloadJSON: (data: unknown, filename: string) => void;
  downloadText: (text: string, filename: string) => void;
}

/**
 * Hook to download files
 */
export function useDownload(): UseDownloadReturn {
  const download = useCallback(
    (data: Blob | string, filename: string, mimeType?: string) => {
      const blob =
        typeof data === "string"
          ? new Blob([data], { type: mimeType || "text/plain" })
          : data;

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    },
    []
  );

  const downloadJSON = useCallback(
    (data: unknown, filename: string) => {
      const json = JSON.stringify(data, null, 2);
      download(json, filename, "application/json");
    },
    [download]
  );

  const downloadText = useCallback(
    (text: string, filename: string) => {
      download(text, filename, "text/plain");
    },
    [download]
  );

  return { download, downloadJSON, downloadText };
}

