import { usePrompts, useCreatePrompt } from "./use-prompts";
import { useSnippets, useCreateSnippet } from "./use-snippets";
import { useLinks, useCreateLink } from "./use-links";
import { useGuides, useCreateGuide } from "./use-guides";
import { useToast } from "./use-toast";
import { exportData as exportService, exportToMarkdown } from "@/services/export.service";
import { parseImportFile, validateImportData, prepareImportData } from "@/services/import.service";
import type { Prompt, Snippet, Link, Guide } from "@shared/schema";
import { useErrorHandler } from "./utils/use-error-handler";

export function useExportImport() {
  const { data: prompts = [] } = usePrompts();
  const { data: snippets = [] } = useSnippets();
  const { data: links = [] } = useLinks();
  const { data: guides = [] } = useGuides();
  const { toast } = useToast();
  const { handleError } = useErrorHandler();
  
  const createPrompt = useCreatePrompt();
  const createSnippet = useCreateSnippet();
  const createLink = useCreateLink();
  const createGuide = useCreateGuide();

  const exportData = async () => {
    try {
      await exportService(prompts, snippets, links, guides);
      toast({
        title: "Datos exportados",
        description: `Se exportaron ${prompts.length} prompts, ${snippets.length} snippets, ${links.length} enlaces y ${guides.length} guías.`,
      });
    } catch (error) {
      handleError(error, "Error al exportar datos");
    }
  };

  const exportItemToMarkdown = (
    item: Prompt | Snippet | Guide,
    type: "prompt" | "snippet" | "guide"
  ) => {
    try {
      exportToMarkdown(item, type);
      toast({
        title: "Exportado",
        description: `${item.title} exportado como Markdown`,
      });
    } catch (error) {
      handleError(error, "Error al exportar a Markdown");
    }
  };

  const importData = async (file: File, options?: { skipDuplicates?: boolean }) => {
    try {
      // Parse and validate file
      const rawData = await parseImportFile(file);
      
      if (!validateImportData(rawData)) {
        throw new Error("Formato de archivo inválido");
      }

      // Prepare data for import
      const { prompts: promptsToImport, snippets: snippetsToImport, links: linksToImport, guides: guidesToImport } = 
        prepareImportData(rawData, options);

      // Get existing data for duplicate checking
      const existingPrompts = prompts.map(p => p.title.toLowerCase());
      const existingSnippets = snippets.map(s => s.title.toLowerCase());
      const existingLinks = links.map(l => l.url.toLowerCase());
      const existingGuides = guides.map(g => g.title.toLowerCase());

      let importedCount = 0;
      let skippedCount = 0;

      // Import prompts
      for (const prompt of promptsToImport) {
        if (options?.skipDuplicates && existingPrompts.includes(prompt.title?.toLowerCase())) {
          skippedCount++;
          continue;
        }
        try {
          await createPrompt.mutateAsync(prompt);
          importedCount++;
        } catch (error) {
          // Error already handled by toast in catch block
        }
      }

      // Import snippets
      for (const snippet of snippetsToImport) {
        if (options?.skipDuplicates && existingSnippets.includes(snippet.title?.toLowerCase())) {
          skippedCount++;
          continue;
        }
        try {
          await createSnippet.mutateAsync(snippet);
          importedCount++;
        } catch (error) {
          // Error already handled by toast in catch block
        }
      }

      // Import links
      for (const link of linksToImport) {
        if (options?.skipDuplicates && existingLinks.includes(link.url?.toLowerCase())) {
          skippedCount++;
          continue;
        }
        try {
          await createLink.mutateAsync(link);
          importedCount++;
        } catch (error) {
          // Error already handled by toast in catch block
        }
      }

      // Import guides
      for (const guide of guidesToImport) {
        if (options?.skipDuplicates && existingGuides.includes(guide.title?.toLowerCase())) {
          skippedCount++;
          continue;
        }
        try {
          await createGuide.mutateAsync(guide);
          importedCount++;
        } catch (error) {
          // Error already handled by toast in catch block
        }
      }

      toast({
        title: "Importación completada",
        description: `Se importaron ${importedCount} elementos${skippedCount > 0 ? ` y se omitieron ${skippedCount} duplicados` : ""}.`,
      });

      return { importedCount, skippedCount };
    } catch (error) {
      handleError(error, "Error al importar datos");
      throw error;
    }
  };

  return {
    exportData,
    exportItemToMarkdown,
    importData,
    totalItems: prompts.length + snippets.length + links.length + guides.length,
  };
}


