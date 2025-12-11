import { useMemo } from "react";
import { usePrompts } from "./use-prompts";
import { useSnippets } from "./use-snippets";
import { useLinks } from "./use-links";
import { useGuides } from "./use-guides";
import { useDebounce } from "./utils/use-debounce";
import { DEBOUNCE_DELAYS } from "@/lib/constants";

export interface SearchResult {
  id: string;
  type: "prompt" | "snippet" | "link" | "guide" | "tool" | "page";
  title: string;
  description?: string;
  href: string;
  icon?: string;
  category?: string;
}

const tools = [
  { id: "readme", title: "Readme Generator", href: "/tools/readme", type: "tool" as const },
  { id: "meta", title: "Meta Tag Generator", href: "/tools/meta", type: "tool" as const },
  { id: "folders", title: "Folder Structures", href: "/tools/folders", type: "tool" as const },
  { id: "json", title: "JSON Schema", href: "/tools/json", type: "tool" as const },
  { id: "base64", title: "Image to Base64", href: "/tools/base64", type: "tool" as const },
  { id: "colors", title: "Palette Generator", href: "/tools/colors", type: "tool" as const },
  { id: "svg", title: "SVG Icons", href: "/tools/svg", type: "tool" as const },
  { id: "mockup", title: "Mockup Screenshots", href: "/tools/mockup", type: "tool" as const },
  { id: "favicon", title: "Favicon Creator", href: "/tools/favicon", type: "tool" as const },
  { id: "license", title: "License Generator", href: "/tools/license", type: "tool" as const },
  { id: "gitignore", title: ".gitignore Builder", href: "/tools/gitignore", type: "tool" as const },
  { id: "json-formatter", title: "JSON Formatter", href: "/tools/json-formatter", type: "tool" as const },
  { id: "yaml-formatter", title: "YAML Formatter", href: "/tools/yaml-formatter", type: "tool" as const },
  { id: "regex", title: "Regex Tester", href: "/tools/regex", type: "tool" as const },
  { id: "uuid", title: "UUID Generator", href: "/tools/uuid", type: "tool" as const },
  { id: "jwt", title: "JWT Decoder", href: "/tools/jwt", type: "tool" as const },
  { id: "json-to-ts", title: "JSON ⇄ TypeScript", href: "/tools/json-to-ts", type: "tool" as const },
  { id: "api-tester", title: "API Tester", href: "/tools/api-tester", type: "tool" as const },
  { id: "db-models", title: "Database Models", href: "/tools/db-models", type: "tool" as const },
  { id: "smart-prompts", title: "Smart Prompts", href: "/tools/smart-prompts", type: "tool" as const },
  { id: "code-rewriter", title: "Code Rewriter", href: "/tools/code-rewriter", type: "tool" as const },
  { id: "function-generator", title: "Function Generator", href: "/tools/function-generator", type: "tool" as const },
  { id: "error-explainer", title: "Error Explainer", href: "/tools/error-explainer", type: "tool" as const },
  { id: "test-generator", title: "Test Generator", href: "/tools/test-generator", type: "tool" as const },
  { id: "auto-docs", title: "Auto Documentation", href: "/tools/auto-docs", type: "tool" as const },
  { id: "usage-examples", title: "Usage Examples", href: "/tools/usage-examples", type: "tool" as const },
];

const pages = [
  { id: "dashboard", title: "Dashboard", href: "/", type: "page" as const },
  { id: "prompts", title: "Prompts", href: "/prompts", type: "page" as const },
  { id: "snippets", title: "Snippets", href: "/snippets", type: "page" as const },
  { id: "links", title: "Enlaces Rápidos", href: "/links", type: "page" as const },
  { id: "guides", title: "Guías Visuales", href: "/guides", type: "page" as const },
  { id: "tools", title: "Herramientas", href: "/tools", type: "page" as const },
  { id: "admin", title: "Admin", href: "/admin", type: "page" as const },
  { id: "api-guides", title: "APIs y Tokens", href: "/api-guides", type: "page" as const },
];

// Cache para resultados de búsqueda
const searchCache = new Map<string, SearchResult[]>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

function getCachedResults(query: string): SearchResult[] | null {
  const cached = searchCache.get(query);
  if (cached) {
    return cached;
  }
  return null;
}

function setCachedResults(query: string, results: SearchResult[]) {
  searchCache.set(query, results);
  // Limpiar cache después de TTL
  setTimeout(() => {
    searchCache.delete(query);
  }, CACHE_TTL);
}

export function useSearch(query: string) {
  const { data: prompts = [] } = usePrompts();
  const { data: snippets = [] } = useSnippets();
  const { data: links = [] } = useLinks();
  const { data: guides = [] } = useGuides();

  // Debounce para optimizar búsquedas
  const debouncedQuery = useDebounce(query, DEBOUNCE_DELAYS.SEARCH);

  const results: SearchResult[] = useMemo(() => {
    if (!debouncedQuery || debouncedQuery.length < 2) return [];

    // Verificar cache primero
    const cached = getCachedResults(debouncedQuery);
    if (cached) {
      return cached;
    }

    const lowerQuery = debouncedQuery.toLowerCase();
    const searchResults: SearchResult[] = [];

    // Search prompts
    prompts.forEach((prompt) => {
      if (
        prompt.title.toLowerCase().includes(lowerQuery) ||
        prompt.content.toLowerCase().includes(lowerQuery) ||
        prompt.category.toLowerCase().includes(lowerQuery) ||
        prompt.tags?.some((tag) => tag.toLowerCase().includes(lowerQuery))
      ) {
        searchResults.push({
          id: prompt.id,
          type: "prompt",
          title: prompt.title,
          description: prompt.category,
          href: `/prompts`,
          category: prompt.category,
        });
      }
    });

    // Search snippets
    snippets.forEach((snippet) => {
      if (
        snippet.title.toLowerCase().includes(lowerQuery) ||
        snippet.description.toLowerCase().includes(lowerQuery) ||
        snippet.code.toLowerCase().includes(lowerQuery) ||
        snippet.language.toLowerCase().includes(lowerQuery) ||
        snippet.tags?.some((tag) => tag.toLowerCase().includes(lowerQuery))
      ) {
        searchResults.push({
          id: snippet.id,
          type: "snippet",
          title: snippet.title,
          description: snippet.description,
          href: `/snippets`,
          category: snippet.language,
        });
      }
    });

    // Search links
    links.forEach((link) => {
      if (
        link.title.toLowerCase().includes(lowerQuery) ||
        link.description.toLowerCase().includes(lowerQuery) ||
        link.category.toLowerCase().includes(lowerQuery) ||
        link.url.toLowerCase().includes(lowerQuery)
      ) {
        searchResults.push({
          id: link.id,
          type: "link",
          title: link.title,
          description: link.description,
          href: link.url,
          category: link.category,
          icon: link.icon,
        });
      }
    });

    // Search guides
    guides.forEach((guide) => {
      if (
        guide.title.toLowerCase().includes(lowerQuery) ||
        guide.description.toLowerCase().includes(lowerQuery) ||
        guide.type.toLowerCase().includes(lowerQuery) ||
        guide.tags?.some((tag) => tag.toLowerCase().includes(lowerQuery))
      ) {
        searchResults.push({
          id: guide.id,
          type: "guide",
          title: guide.title,
          description: guide.description,
          href: `/guides`,
          category: guide.type,
        });
      }
    });

    // Search tools
    tools.forEach((tool) => {
      if (tool.title.toLowerCase().includes(lowerQuery)) {
        searchResults.push({
          id: tool.id,
          type: "tool",
          title: tool.title,
          href: tool.href,
        });
      }
    });

    // Search pages
    pages.forEach((page) => {
      if (page.title.toLowerCase().includes(lowerQuery)) {
        searchResults.push({
          id: page.id,
          type: "page",
          title: page.title,
          href: page.href,
        });
      }
    });

    const finalResults = searchResults.slice(0, 50); // Limit to 50 results
    
    // Guardar en cache
    setCachedResults(debouncedQuery, finalResults);
    
    return finalResults;
  }, [debouncedQuery, prompts, snippets, links, guides]);

  return results;
}

