/**
 * Service for importing application data
 */

import type { Prompt, Snippet, Link, Guide, InsertPrompt, InsertSnippet, InsertLink, InsertGuide } from "@shared/schema";

export interface ImportData {
  prompts?: Prompt[] | InsertPrompt[];
  snippets?: Snippet[] | InsertSnippet[];
  links?: Link[] | InsertLink[];
  guides?: Guide[] | InsertGuide[];
  exportedAt?: string;
  version?: string;
}

export interface ImportOptions {
  skipDuplicates?: boolean;
  onProgress?: (progress: number) => void;
}

/**
 * Parse import file
 */
export async function parseImportFile(file: File): Promise<ImportData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const data = JSON.parse(content) as ImportData;
        resolve(data);
      } catch (error) {
        reject(new Error("Archivo JSON inválido"));
      }
    };

    reader.onerror = () => {
      reject(new Error("Error al leer el archivo"));
    };

    reader.readAsText(file);
  });
}

/**
 * Validate import data structure
 */
export function validateImportData(data: unknown): data is ImportData {
  if (!data || typeof data !== "object") return false;

  const importData = data as Record<string, unknown>;

  // Check if at least one array exists
  const hasData =
    Array.isArray(importData.prompts) ||
    Array.isArray(importData.snippets) ||
    Array.isArray(importData.links) ||
    Array.isArray(importData.guides);

  return hasData;
}

/**
 * Prepare data for import (remove IDs if skipDuplicates)
 */
export function prepareImportData(
  data: ImportData,
  options: ImportOptions = {}
): {
  prompts: InsertPrompt[];
  snippets: InsertSnippet[];
  links: InsertLink[];
  guides: InsertGuide[];
} {
  const { skipDuplicates = false } = options;

  const prepareItem = <T extends { id?: string }>(item: T): Omit<T, "id"> => {
    const { id, ...rest } = item;
    return rest as Omit<T, "id">;
  };

  return {
    prompts: (data.prompts || []).map((item) =>
      skipDuplicates ? prepareItem(item) : item
    ) as InsertPrompt[],
    snippets: (data.snippets || []).map((item) =>
      skipDuplicates ? prepareItem(item) : item
    ) as InsertSnippet[],
    links: (data.links || []).map((item) =>
      skipDuplicates ? prepareItem(item) : item
    ) as InsertLink[],
    guides: (data.guides || []).map((item) =>
      skipDuplicates ? prepareItem(item) : item
    ) as InsertGuide[],
  };
}

