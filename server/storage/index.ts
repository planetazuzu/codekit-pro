/**
 * Storage Factory
 * Selects the appropriate storage implementation based on environment
 */

import { initDatabase, getDatabase } from "../config/database";
import { logger } from "../utils/logger";
import { MemStorage } from "./mem-storage";
import { PostgresStorage } from "./postgres-storage";
import type { IStorage } from "./interface";

let storageInstance: IStorage | null = null;

/**
 * Initialize storage based on environment
 */
export async function initStorage(): Promise<IStorage> {
  if (storageInstance) {
    return storageInstance;
  }

  // Lazy import to avoid accessing env before validation
  const { env } = await import("../config/env");
  const databaseUrl = env.DATABASE_URL;

  if (databaseUrl) {
    // Use PostgreSQL if DATABASE_URL is provided
    logger.info("Initializing PostgreSQL storage...");
    await initDatabase();
    const db = getDatabase();
    
    if (!db) {
      logger.warn("Database initialization failed, falling back to MemStorage");
      storageInstance = new MemStorage();
    } else {
      storageInstance = new PostgresStorage();
      logger.info("PostgreSQL storage initialized successfully");
    }
  } else {
    // Fallback to MemStorage for development
    logger.warn("DATABASE_URL not set, using MemStorage (not recommended for production)");
    storageInstance = new MemStorage();
  }

  return storageInstance;
}

/**
 * Get the current storage instance
 */
export function getStorage(): IStorage {
  if (!storageInstance) {
    throw new Error(
      "Storage not initialized. Call initStorage() first."
    );
  }
  return storageInstance;
}

/**
 * Storage instance (for backward compatibility)
 * @deprecated Use getStorage() instead
 */
export const storage = {
  // Users
  getUser: (...args: Parameters<IStorage["getUser"]>) => getStorage().getUser(...args),
  getUserByUsername: (...args: Parameters<IStorage["getUserByUsername"]>) => getStorage().getUserByUsername(...args),
  getUserByEmail: (...args: Parameters<IStorage["getUserByEmail"]>) => getStorage().getUserByEmail(...args),
  createUser: (...args: Parameters<IStorage["createUser"]>) => getStorage().createUser(...args),
  updateUser: (...args: Parameters<IStorage["updateUser"]>) => getStorage().updateUser(...args),
  
  // Prompts
  getPrompts: (...args: Parameters<IStorage["getPrompts"]>) => getStorage().getPrompts(...args),
  getPrompt: (...args: Parameters<IStorage["getPrompt"]>) => getStorage().getPrompt(...args),
  createPrompt: (...args: Parameters<IStorage["createPrompt"]>) => getStorage().createPrompt(...args),
  updatePrompt: (...args: Parameters<IStorage["updatePrompt"]>) => getStorage().updatePrompt(...args),
  deletePrompt: (...args: Parameters<IStorage["deletePrompt"]>) => getStorage().deletePrompt(...args),
  
  // Snippets
  getSnippets: (...args: Parameters<IStorage["getSnippets"]>) => getStorage().getSnippets(...args),
  getSnippet: (...args: Parameters<IStorage["getSnippet"]>) => getStorage().getSnippet(...args),
  createSnippet: (...args: Parameters<IStorage["createSnippet"]>) => getStorage().createSnippet(...args),
  updateSnippet: (...args: Parameters<IStorage["updateSnippet"]>) => getStorage().updateSnippet(...args),
  deleteSnippet: (...args: Parameters<IStorage["deleteSnippet"]>) => getStorage().deleteSnippet(...args),
  
  // Links
  getLinks: (...args: Parameters<IStorage["getLinks"]>) => getStorage().getLinks(...args),
  getLink: (...args: Parameters<IStorage["getLink"]>) => getStorage().getLink(...args),
  createLink: (...args: Parameters<IStorage["createLink"]>) => getStorage().createLink(...args),
  updateLink: (...args: Parameters<IStorage["updateLink"]>) => getStorage().updateLink(...args),
  deleteLink: (...args: Parameters<IStorage["deleteLink"]>) => getStorage().deleteLink(...args),
  
  // Guides
  getGuides: (...args: Parameters<IStorage["getGuides"]>) => getStorage().getGuides(...args),
  getGuide: (...args: Parameters<IStorage["getGuide"]>) => getStorage().getGuide(...args),
  createGuide: (...args: Parameters<IStorage["createGuide"]>) => getStorage().createGuide(...args),
  updateGuide: (...args: Parameters<IStorage["updateGuide"]>) => getStorage().updateGuide(...args),
  deleteGuide: (...args: Parameters<IStorage["deleteGuide"]>) => getStorage().deleteGuide(...args),
  
  // Analytics
  createView: (...args: Parameters<IStorage["createView"]>) => getStorage().createView(...args),
  getViews: (...args: Parameters<IStorage["getViews"]>) => getStorage().getViews(...args),
  getViewsByPage: (...args: Parameters<IStorage["getViewsByPage"]>) => getStorage().getViewsByPage(...args),
  getViewsByEntityType: (...args: Parameters<IStorage["getViewsByEntityType"]>) => getStorage().getViewsByEntityType(...args),
  getViewsByDate: (...args: Parameters<IStorage["getViewsByDate"]>) => getStorage().getViewsByDate(...args),
  getTopPages: (...args: Parameters<IStorage["getTopPages"]>) => getStorage().getTopPages(...args),
  
  // Affiliates
  getAffiliates: (...args: Parameters<IStorage["getAffiliates"]>) => getStorage().getAffiliates(...args),
  getAffiliate: (...args: Parameters<IStorage["getAffiliate"]>) => getStorage().getAffiliate(...args),
  createAffiliate: (...args: Parameters<IStorage["createAffiliate"]>) => getStorage().createAffiliate(...args),
  updateAffiliate: (...args: Parameters<IStorage["updateAffiliate"]>) => getStorage().updateAffiliate(...args),
  deleteAffiliate: (...args: Parameters<IStorage["deleteAffiliate"]>) => getStorage().deleteAffiliate(...args),
  
  // Affiliate Clicks
  createAffiliateClick: (...args: Parameters<IStorage["createAffiliateClick"]>) => getStorage().createAffiliateClick(...args),
  getAffiliateClicks: (...args: Parameters<IStorage["getAffiliateClicks"]>) => getStorage().getAffiliateClicks(...args),
  getAffiliateClickStats: (...args: Parameters<IStorage["getAffiliateClickStats"]>) => getStorage().getAffiliateClickStats(...args),
  
  // Affiliate Programs
  getAffiliatePrograms: (...args: Parameters<IStorage["getAffiliatePrograms"]>) => getStorage().getAffiliatePrograms(...args),
  getAffiliateProgram: (...args: Parameters<IStorage["getAffiliateProgram"]>) => getStorage().getAffiliateProgram(...args),
  createAffiliateProgram: (...args: Parameters<IStorage["createAffiliateProgram"]>) => getStorage().createAffiliateProgram(...args),
  updateAffiliateProgram: (...args: Parameters<IStorage["updateAffiliateProgram"]>) => getStorage().updateAffiliateProgram(...args),
  deleteAffiliateProgram: (...args: Parameters<IStorage["deleteAffiliateProgram"]>) => getStorage().deleteAffiliateProgram(...args),
};

