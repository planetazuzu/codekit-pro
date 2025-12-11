/**
 * Service for exporting application data
 */

import type { Prompt, Snippet, Link, Guide } from "@shared/schema";

export interface ExportData {
  prompts: Prompt[];
  snippets: Snippet[];
  links: Link[];
  guides: Guide[];
  exportedAt: string;
  version: string;
}

/**
 * Export all data to JSON file
 */
export async function exportData(
  prompts: Prompt[],
  snippets: Snippet[],
  links: Link[],
  guides: Guide[]
): Promise<void> {
  const data: ExportData = {
    prompts,
    snippets,
    links,
    guides,
    exportedAt: new Date().toISOString(),
    version: "2.0",
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `codekit-export-${new Date().toISOString().split("T")[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export single item as Markdown
 */
export function exportToMarkdown(
  item: Prompt | Snippet | Guide,
  type: "prompt" | "snippet" | "guide"
): void {
  let content = `# ${item.title}\n\n`;

  if ("description" in item && item.description) {
    content += `${item.description}\n\n`;
  }

  if (type === "prompt" && "content" in item) {
    content += `## Contenido\n\n${item.content}\n\n`;
  }

  if (type === "snippet" && "code" in item) {
    content += `## Código\n\n\`\`\`${"language" in item ? item.language : ""}\n${item.code}\n\`\`\`\n\n`;
  }

  if (type === "guide" && "content" in item && item.content) {
    content += `## Contenido\n\n${item.content}\n\n`;
  }

  if (item.tags && item.tags.length > 0) {
    content += `## Tags\n\n${item.tags.map((tag) => `- ${tag}`).join("\n")}\n\n`;
  }

  if ("createdAt" in item && item.createdAt) {
    content += `---\n\n*Exportado el ${new Date(item.createdAt).toLocaleDateString("es-ES")}*\n`;
  }

  const blob = new Blob([content], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${item.title.replace(/[^a-z0-9]/gi, "-").toLowerCase()}.md`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

