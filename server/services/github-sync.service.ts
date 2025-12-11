/**
 * GitHub Sync Service
 * Sincronización bidireccional con repositorio GitHub
 */

import { env } from "../config/env";
import { logger } from "../utils/logger";
import { getStorage } from "../storage/index";
import type { Prompt, Snippet, Link, Guide } from "@shared/schema";

/**
 * Get system user ID (creates if doesn't exist)
 */
async function getSystemUserId(): Promise<string> {
  const storage = getStorage();
  let systemUser = await storage.getUserByEmail("system@codekit.pro");
  
  if (!systemUser) {
    // Create system user if it doesn't exist
    systemUser = await storage.createUser({
      username: "system",
      email: "system@codekit.pro",
      password: "system-user-no-password", // Not used for authentication
      plan: "free",
    });
  }
  
  return systemUser.id;
}

const GITHUB_API_BASE = "https://api.github.com";

interface GitHubFile {
  path: string;
  content: string;
  sha?: string;
}

interface GitHubFileResponse {
  name: string;
  path: string;
  sha: string;
  content: string;
  encoding: string;
}

interface SyncResult {
  created: number;
  updated: number;
  errors: string[];
}

/**
 * Get GitHub API headers with authentication
 */
function getGitHubHeaders(): HeadersInit {
  const headers: HeadersInit = {
    "Accept": "application/vnd.github.v3+json",
    "User-Agent": "CodeKit-Pro-Sync",
  };

  if (env.GITHUB_TOKEN) {
    headers["Authorization"] = `token ${env.GITHUB_TOKEN}`;
  }

  return headers;
}

/**
 * Get repository URL
 */
function getRepoUrl(): string {
  const owner = env.GITHUB_REPO_OWNER || "";
  const repo = env.GITHUB_REPO_NAME || "codekit-pro-data";
  return `${GITHUB_API_BASE}/repos/${owner}/${repo}`;
}

/**
 * Read file from GitHub repository
 */
async function readGitHubFile(path: string): Promise<string | null> {
  try {
    const repoUrl = getRepoUrl();
    const url = `${repoUrl}/contents/${path}`;
    
    const response = await fetch(url, {
      headers: getGitHubHeaders(),
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null; // File doesn't exist
      }
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json() as GitHubFileResponse;
    
    // Decode base64 content
    if (data.encoding === "base64") {
      return Buffer.from(data.content, "base64").toString("utf-8");
    }
    
    return data.content;
  } catch (error) {
    logger.error(`Error reading GitHub file ${path}:`, error);
    throw error;
  }
}

/**
 * Write file to GitHub repository
 */
async function writeGitHubFile(
  path: string,
  content: string,
  message: string,
  sha?: string
): Promise<void> {
  try {
    const repoUrl = getRepoUrl();
    const url = `${repoUrl}/contents/${path}`;
    
    // Encode content to base64
    const encodedContent = Buffer.from(content, "utf-8").toString("base64");

    const body: Record<string, unknown> = {
      message,
      content: encodedContent,
    };

    if (sha) {
      body.sha = sha; // Required for updates
    }

    const response = await fetch(url, {
      method: "PUT",
      headers: {
        ...getGitHubHeaders(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`GitHub API error: ${response.status} ${JSON.stringify(errorData)}`);
    }

    logger.info(`Successfully wrote file to GitHub: ${path}`);
  } catch (error) {
    logger.error(`Error writing GitHub file ${path}:`, error);
    throw error;
  }
}

/**
 * Get SHA of existing file (needed for updates)
 */
async function getFileSha(path: string): Promise<string | null> {
  try {
    const repoUrl = getRepoUrl();
    const url = `${repoUrl}/contents/${path}`;
    
    const response = await fetch(url, {
      headers: getGitHubHeaders(),
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json() as GitHubFileResponse;
    return data.sha;
  } catch (error) {
    return null;
  }
}

/**
 * List files in a directory
 */
async function listGitHubFiles(path: string): Promise<string[]> {
  try {
    const repoUrl = getRepoUrl();
    const url = `${repoUrl}/contents/${path}`;
    
    const response = await fetch(url, {
      headers: getGitHubHeaders(),
    });

    if (!response.ok) {
      return [];
    }

    const files = await response.json() as Array<{ name: string; type: string }>;
    return files.filter(f => f.type === "file" && f.name.endsWith(".json")).map(f => f.name);
  } catch (error) {
    logger.error(`Error listing GitHub files in ${path}:`, error);
    return [];
  }
}

/**
 * Parse JSON file from GitHub
 */
function parseGitHubJSON<T>(content: string): { category: string; items: T[] } | null {
  try {
    const data = JSON.parse(content);
    if (data.items && Array.isArray(data.items)) {
      return {
        category: data.category || "",
        items: data.items,
      };
    }
    return null;
  } catch (error) {
    logger.error("Error parsing JSON:", error);
    return null;
  }
}

/**
 * Sync prompts from GitHub
 */
export async function syncPromptsFromGitHub(): Promise<SyncResult> {
  const result: SyncResult = { created: 0, updated: 0, errors: [] };
  const storage = getStorage();
  const systemUserId = await getSystemUserId();

  try {
    const files = await listGitHubFiles("prompts");
    
    for (const file of files) {
      try {
        const content = await readGitHubFile(`prompts/${file}`);
        if (!content) continue;

        const parsed = parseGitHubJSON<{
          title: string;
          category: string;
          content: string;
          tags?: string[];
        }>(content);

        if (!parsed) continue;

        for (const item of parsed.items) {
          try {
            // Check if prompt exists by title and category
            const existingPrompts = await storage.getPrompts(undefined, true);
            const existing = existingPrompts.find(
              p => p.title === item.title && p.category === item.category
            );

            if (existing) {
              // Update existing
              await storage.updatePrompt({
                id: existing.id,
                ...item,
                tags: item.tags || [],
              });
              result.updated++;
            } else {
              // Create new
              await storage.createPrompt({
                ...item,
                tags: item.tags || [],
                userId: systemUserId,
              });
              result.created++;
            }
          } catch (error) {
            result.errors.push(`Error syncing prompt "${item.title}": ${error instanceof Error ? error.message : String(error)}`);
          }
        }
      } catch (error) {
        result.errors.push(`Error reading file prompts/${file}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  } catch (error) {
    result.errors.push(`Error syncing prompts: ${error instanceof Error ? error.message : String(error)}`);
  }

  return result;
}

/**
 * Sync snippets from GitHub
 */
export async function syncSnippetsFromGitHub(): Promise<SyncResult> {
  const result: SyncResult = { created: 0, updated: 0, errors: [] };
  const storage = getStorage();
  const systemUserId = await getSystemUserId();

  try {
    const files = await listGitHubFiles("snippets");
    
    for (const file of files) {
      try {
        const content = await readGitHubFile(`snippets/${file}`);
        if (!content) continue;

        const parsed = parseGitHubJSON<{
          title: string;
          language: string;
          code: string;
          description: string;
          tags?: string[];
        }>(content);

        if (!parsed) continue;

        for (const item of parsed.items) {
          try {
            const existingSnippets = await storage.getSnippets(undefined, true);
            const existing = existingSnippets.find(
              s => s.title === item.title && s.language === item.language
            );

            if (existing) {
              await storage.updateSnippet({
                id: existing.id,
                ...item,
                tags: item.tags || [],
              });
              result.updated++;
            } else {
              await storage.createSnippet({
                ...item,
                tags: item.tags || [],
                userId: systemUserId,
              });
              result.created++;
            }
          } catch (error) {
            result.errors.push(`Error syncing snippet "${item.title}": ${error instanceof Error ? error.message : String(error)}`);
          }
        }
      } catch (error) {
        result.errors.push(`Error reading file snippets/${file}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  } catch (error) {
    result.errors.push(`Error syncing snippets: ${error instanceof Error ? error.message : String(error)}`);
  }

  return result;
}

/**
 * Sync links from GitHub
 */
export async function syncLinksFromGitHub(): Promise<SyncResult> {
  const result: SyncResult = { created: 0, updated: 0, errors: [] };
  const storage = getStorage();
  const systemUserId = await getSystemUserId();

  try {
    const files = await listGitHubFiles("links");
    
    for (const file of files) {
      try {
        const content = await readGitHubFile(`links/${file}`);
        if (!content) continue;

        const parsed = parseGitHubJSON<{
          title: string;
          url: string;
          icon?: string;
          category: string;
          description: string;
        }>(content);

        if (!parsed) continue;

        for (const item of parsed.items) {
          try {
            const existingLinks = await storage.getLinks(undefined, true);
            const existing = existingLinks.find(
              l => l.title === item.title && l.url === item.url
            );

            if (existing) {
              await storage.updateLink({
                id: existing.id,
                ...item,
                icon: item.icon || "Code2",
              });
              result.updated++;
            } else {
              await storage.createLink({
                ...item,
                icon: item.icon || "Code2",
                userId: systemUserId,
              });
              result.created++;
            }
          } catch (error) {
            result.errors.push(`Error syncing link "${item.title}": ${error instanceof Error ? error.message : String(error)}`);
          }
        }
      } catch (error) {
        result.errors.push(`Error reading file links/${file}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  } catch (error) {
    result.errors.push(`Error syncing links: ${error instanceof Error ? error.message : String(error)}`);
  }

  return result;
}

/**
 * Sync guides from GitHub
 */
export async function syncGuidesFromGitHub(): Promise<SyncResult> {
  const result: SyncResult = { created: 0, updated: 0, errors: [] };
  const storage = getStorage();
  const systemUserId = await getSystemUserId();

  try {
    const files = await listGitHubFiles("guides");
    
    for (const file of files) {
      try {
        const content = await readGitHubFile(`guides/${file}`);
        if (!content) continue;

        const parsed = parseGitHubJSON<{
          title: string;
          description: string;
          content: string;
          type: string;
          tags?: string[];
        }>(content);

        if (!parsed) continue;

        for (const item of parsed.items) {
          try {
            const existingGuides = await storage.getGuides(undefined, true);
            const existing = existingGuides.find(
              g => g.title === item.title && g.type === item.type
            );

            if (existing) {
              await storage.updateGuide({
                id: existing.id,
                ...item,
                tags: item.tags || [],
                imageUrl: null,
              });
              result.updated++;
            } else {
              await storage.createGuide({
                ...item,
                tags: item.tags || [],
                imageUrl: null,
                userId: systemUserId,
              });
              result.created++;
            }
          } catch (error) {
            result.errors.push(`Error syncing guide "${item.title}": ${error instanceof Error ? error.message : String(error)}`);
          }
        }
      } catch (error) {
        result.errors.push(`Error reading file guides/${file}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  } catch (error) {
    result.errors.push(`Error syncing guides: ${error instanceof Error ? error.message : String(error)}`);
  }

  return result;
}

/**
 * Sync all resources from GitHub
 */
export async function syncAllFromGitHub(): Promise<{
  prompts: SyncResult;
  snippets: SyncResult;
  links: SyncResult;
  guides: SyncResult;
}> {
  logger.info("Starting sync from GitHub...");

  const [prompts, snippets, links, guides] = await Promise.all([
    syncPromptsFromGitHub(),
    syncSnippetsFromGitHub(),
    syncLinksFromGitHub(),
    syncGuidesFromGitHub(),
  ]);

  logger.info("Sync from GitHub completed", {
    prompts: { created: prompts.created, updated: prompts.updated },
    snippets: { created: snippets.created, updated: snippets.updated },
    links: { created: links.created, updated: links.updated },
    guides: { created: guides.created, updated: guides.updated },
  });

  return { prompts, snippets, links, guides };
}

/**
 * Convert prompts to GitHub JSON format
 */
function promptsToGitHubJSON(prompts: Prompt[]): string {
  const grouped = prompts.reduce((acc, prompt) => {
    if (!acc[prompt.category]) {
      acc[prompt.category] = [];
    }
    acc[prompt.category].push({
      title: prompt.title,
      category: prompt.category,
      content: prompt.content,
      tags: prompt.tags || [],
    });
    return acc;
  }, {} as Record<string, Array<{ title: string; category: string; content: string; tags: string[] }>>);

  // Create one file per category
  const files: Record<string, string> = {};
  
  for (const [category, items] of Object.entries(grouped)) {
    const fileName = category.toLowerCase().replace(/\s+/g, "-");
    files[`prompts/${fileName}.json`] = JSON.stringify({
      category,
      description: `Prompts de ${category}`,
      items,
    }, null, 2);
  }

  return JSON.stringify(files, null, 2);
}

/**
 * Push prompts to GitHub
 */
export async function pushPromptsToGitHub(): Promise<{ success: boolean; message: string }> {
  try {
    const storage = getStorage();
    const prompts = await storage.getPrompts(undefined, true);
    
    // Group by category and create files
    const grouped = prompts.reduce((acc, prompt) => {
      if (!acc[prompt.category]) {
        acc[prompt.category] = [];
      }
      acc[prompt.category].push({
        title: prompt.title,
        category: prompt.category,
        content: prompt.content,
        tags: prompt.tags || [],
      });
      return acc;
    }, {} as Record<string, Array<{ title: string; category: string; content: string; tags: string[] }>>);

    let created = 0;
    let updated = 0;

    for (const [category, items] of Object.entries(grouped)) {
      const fileName = category.toLowerCase().replace(/\s+/g, "-");
      const path = `prompts/${fileName}.json`;
      const content = JSON.stringify({
        category,
        description: `Prompts de ${category}`,
        items,
      }, null, 2);

      const sha = await getFileSha(path);
      
      await writeGitHubFile(
        path,
        content,
        `Update prompts: ${category} (${items.length} items)`,
        sha || undefined
      );

      if (sha) {
        updated++;
      } else {
        created++;
      }
    }

    return {
      success: true,
      message: `Successfully pushed prompts: ${created} files created, ${updated} files updated`,
    };
  } catch (error) {
    logger.error("Error pushing prompts to GitHub:", error);
    return {
      success: false,
      message: `Error: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

/**
 * Push snippets to GitHub
 */
export async function pushSnippetsToGitHub(): Promise<{ success: boolean; message: string }> {
  try {
    const storage = getStorage();
    const snippets = await storage.getSnippets(undefined, true);
    
    const grouped = snippets.reduce((acc, snippet) => {
      if (!acc[snippet.language]) {
        acc[snippet.language] = [];
      }
      acc[snippet.language].push({
        title: snippet.title,
        language: snippet.language,
        code: snippet.code,
        description: snippet.description,
        tags: snippet.tags || [],
      });
      return acc;
    }, {} as Record<string, Array<{ title: string; language: string; code: string; description: string; tags: string[] }>>);

    let created = 0;
    let updated = 0;

    for (const [language, items] of Object.entries(grouped)) {
      const fileName = language.toLowerCase().replace(/\s+/g, "-");
      const path = `snippets/${fileName}.json`;
      const content = JSON.stringify({
        category: language,
        description: `Snippets de ${language}`,
        items,
      }, null, 2);

      const sha = await getFileSha(path);
      
      await writeGitHubFile(
        path,
        content,
        `Update snippets: ${language} (${items.length} items)`,
        sha || undefined
      );

      if (sha) {
        updated++;
      } else {
        created++;
      }
    }

    return {
      success: true,
      message: `Successfully pushed snippets: ${created} files created, ${updated} files updated`,
    };
  } catch (error) {
    logger.error("Error pushing snippets to GitHub:", error);
    return {
      success: false,
      message: `Error: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

/**
 * Push links to GitHub
 */
export async function pushLinksToGitHub(): Promise<{ success: boolean; message: string }> {
  try {
    const storage = getStorage();
    const links = await storage.getLinks(undefined, true);
    
    const grouped = links.reduce((acc, link) => {
      if (!acc[link.category]) {
        acc[link.category] = [];
      }
      acc[link.category].push({
        title: link.title,
        url: link.url,
        icon: link.icon || "Code2",
        category: link.category,
        description: link.description,
      });
      return acc;
    }, {} as Record<string, Array<{ title: string; url: string; icon: string; category: string; description: string }>>);

    let created = 0;
    let updated = 0;

    for (const [category, items] of Object.entries(grouped)) {
      const fileName = category.toLowerCase().replace(/\s+/g, "-");
      const path = `links/${fileName}.json`;
      const content = JSON.stringify({
        category,
        description: `Enlaces de ${category}`,
        items,
      }, null, 2);

      const sha = await getFileSha(path);
      
      await writeGitHubFile(
        path,
        content,
        `Update links: ${category} (${items.length} items)`,
        sha || undefined
      );

      if (sha) {
        updated++;
      } else {
        created++;
      }
    }

    return {
      success: true,
      message: `Successfully pushed links: ${created} files created, ${updated} files updated`,
    };
  } catch (error) {
    logger.error("Error pushing links to GitHub:", error);
    return {
      success: false,
      message: `Error: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

/**
 * Push guides to GitHub
 */
export async function pushGuidesToGitHub(): Promise<{ success: boolean; message: string }> {
  try {
    const storage = getStorage();
    const guides = await storage.getGuides(undefined, true);
    
    const grouped = guides.reduce((acc, guide) => {
      if (!acc[guide.type]) {
        acc[guide.type] = [];
      }
      acc[guide.type].push({
        title: guide.title,
        description: guide.description,
        content: guide.content,
        type: guide.type,
        tags: guide.tags || [],
      });
      return acc;
    }, {} as Record<string, Array<{ title: string; description: string; content: string; type: string; tags: string[] }>>);

    let created = 0;
    let updated = 0;

    for (const [type, items] of Object.entries(grouped)) {
      const fileName = type.toLowerCase().replace(/\s+/g, "-");
      const path = `guides/${fileName}.json`;
      const content = JSON.stringify({
        category: type,
        description: `Guías de tipo ${type}`,
        items,
      }, null, 2);

      const sha = await getFileSha(path);
      
      await writeGitHubFile(
        path,
        content,
        `Update guides: ${type} (${items.length} items)`,
        sha || undefined
      );

      if (sha) {
        updated++;
      } else {
        created++;
      }
    }

    return {
      success: true,
      message: `Successfully pushed guides: ${created} files created, ${updated} files updated`,
    };
  } catch (error) {
    logger.error("Error pushing guides to GitHub:", error);
    return {
      success: false,
      message: `Error: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

/**
 * Push all resources to GitHub
 */
export async function pushAllToGitHub(): Promise<{
  prompts: { success: boolean; message: string };
  snippets: { success: boolean; message: string };
  links: { success: boolean; message: string };
  guides: { success: boolean; message: string };
}> {
  logger.info("Starting push to GitHub...");

  const [prompts, snippets, links, guides] = await Promise.all([
    pushPromptsToGitHub(),
    pushSnippetsToGitHub(),
    pushLinksToGitHub(),
    pushGuidesToGitHub(),
  ]);

  logger.info("Push to GitHub completed");

  return { prompts, snippets, links, guides };
}

