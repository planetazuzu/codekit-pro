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
    // Fallback to MemStorage if not initialized (prevents crashes)
    logger.warn("Storage not initialized, using MemStorage fallback");
    return new MemStorage();
  }
  return storageInstance;
}

/**
 * Storage instance (for backward compatibility)
 * @deprecated Use getStorage() instead
 */
export const storage = {
  // Users
  getUser: async (...args: Parameters<IStorage["getUser"]>) => {
    try {
      return await getStorage().getUser(...args);
    } catch (error) {
      logger.error("Storage error in getUser", { error });
      return null;
    }
  },
  getUserByUsername: async (...args: Parameters<IStorage["getUserByUsername"]>) => {
    try {
      return await getStorage().getUserByUsername(...args);
    } catch (error) {
      logger.error("Storage error in getUserByUsername", { error });
      return null;
    }
  },
  getUserByEmail: async (...args: Parameters<IStorage["getUserByEmail"]>) => {
    try {
      return await getStorage().getUserByEmail(...args);
    } catch (error) {
      logger.error("Storage error in getUserByEmail", { error });
      return null;
    }
  },
  createUser: async (...args: Parameters<IStorage["createUser"]>) => {
    try {
      return await getStorage().createUser(...args);
    } catch (error) {
      logger.error("Storage error in createUser", { error });
      throw error;
    }
  },
  updateUser: async (...args: Parameters<IStorage["updateUser"]>) => {
    try {
      return await getStorage().updateUser(...args);
    } catch (error) {
      logger.error("Storage error in updateUser", { error });
      throw error;
    }
  },
  
  // Prompts
  getPrompts: async (...args: Parameters<IStorage["getPrompts"]>) => {
    try {
      return await getStorage().getPrompts(...args);
    } catch (error) {
      logger.error("Storage error in getPrompts", { error });
      return []; // Return empty array instead of crashing
    }
  },
  getPrompt: async (...args: Parameters<IStorage["getPrompt"]>) => {
    try {
      return await getStorage().getPrompt(...args);
    } catch (error) {
      logger.error("Storage error in getPrompt", { error });
      return null;
    }
  },
  createPrompt: async (...args: Parameters<IStorage["createPrompt"]>) => {
    try {
      return await getStorage().createPrompt(...args);
    } catch (error) {
      logger.error("Storage error in createPrompt", { error });
      throw error;
    }
  },
  updatePrompt: async (...args: Parameters<IStorage["updatePrompt"]>) => {
    try {
      return await getStorage().updatePrompt(...args);
    } catch (error) {
      logger.error("Storage error in updatePrompt", { error });
      throw error;
    }
  },
  deletePrompt: async (...args: Parameters<IStorage["deletePrompt"]>) => {
    try {
      return await getStorage().deletePrompt(...args);
    } catch (error) {
      logger.error("Storage error in deletePrompt", { error });
      return false;
    }
  },
  
  // Snippets
  getSnippets: async (...args: Parameters<IStorage["getSnippets"]>) => {
    try {
      return await getStorage().getSnippets(...args);
    } catch (error) {
      logger.error("Storage error in getSnippets", { error });
      return []; // Return empty array instead of crashing
    }
  },
  getSnippet: async (...args: Parameters<IStorage["getSnippet"]>) => {
    try {
      return await getStorage().getSnippet(...args);
    } catch (error) {
      logger.error("Storage error in getSnippet", { error });
      return null;
    }
  },
  createSnippet: async (...args: Parameters<IStorage["createSnippet"]>) => {
    try {
      return await getStorage().createSnippet(...args);
    } catch (error) {
      logger.error("Storage error in createSnippet", { error });
      throw error;
    }
  },
  updateSnippet: async (...args: Parameters<IStorage["updateSnippet"]>) => {
    try {
      return await getStorage().updateSnippet(...args);
    } catch (error) {
      logger.error("Storage error in updateSnippet", { error });
      throw error;
    }
  },
  deleteSnippet: async (...args: Parameters<IStorage["deleteSnippet"]>) => {
    try {
      return await getStorage().deleteSnippet(...args);
    } catch (error) {
      logger.error("Storage error in deleteSnippet", { error });
      return false;
    }
  },
  
  // Links
  getLinks: async (...args: Parameters<IStorage["getLinks"]>) => {
    try {
      return await getStorage().getLinks(...args);
    } catch (error) {
      logger.error("Storage error in getLinks", { error });
      return []; // Return empty array instead of crashing
    }
  },
  getLink: async (...args: Parameters<IStorage["getLink"]>) => {
    try {
      return await getStorage().getLink(...args);
    } catch (error) {
      logger.error("Storage error in getLink", { error });
      return null;
    }
  },
  createLink: async (...args: Parameters<IStorage["createLink"]>) => {
    try {
      return await getStorage().createLink(...args);
    } catch (error) {
      logger.error("Storage error in createLink", { error });
      throw error;
    }
  },
  updateLink: async (...args: Parameters<IStorage["updateLink"]>) => {
    try {
      return await getStorage().updateLink(...args);
    } catch (error) {
      logger.error("Storage error in updateLink", { error });
      throw error;
    }
  },
  deleteLink: async (...args: Parameters<IStorage["deleteLink"]>) => {
    try {
      return await getStorage().deleteLink(...args);
    } catch (error) {
      logger.error("Storage error in deleteLink", { error });
      return false;
    }
  },
  
  // Guides
  getGuides: async (...args: Parameters<IStorage["getGuides"]>) => {
    try {
      return await getStorage().getGuides(...args);
    } catch (error) {
      logger.error("Storage error in getGuides", { error });
      return []; // Return empty array instead of crashing
    }
  },
  getGuide: async (...args: Parameters<IStorage["getGuide"]>) => {
    try {
      return await getStorage().getGuide(...args);
    } catch (error) {
      logger.error("Storage error in getGuide", { error });
      return null;
    }
  },
  createGuide: async (...args: Parameters<IStorage["createGuide"]>) => {
    try {
      return await getStorage().createGuide(...args);
    } catch (error) {
      logger.error("Storage error in createGuide", { error });
      throw error;
    }
  },
  updateGuide: async (...args: Parameters<IStorage["updateGuide"]>) => {
    try {
      return await getStorage().updateGuide(...args);
    } catch (error) {
      logger.error("Storage error in updateGuide", { error });
      throw error;
    }
  },
  deleteGuide: async (...args: Parameters<IStorage["deleteGuide"]>) => {
    try {
      return await getStorage().deleteGuide(...args);
    } catch (error) {
      logger.error("Storage error in deleteGuide", { error });
      return false;
    }
  },
  
  // Analytics
  createView: async (...args: Parameters<IStorage["createView"]>) => {
    try {
      return await getStorage().createView(...args);
    } catch (error) {
      logger.error("Storage error in createView", { error });
      throw error;
    }
  },
  getViews: async (...args: Parameters<IStorage["getViews"]>) => {
    try {
      return await getStorage().getViews(...args);
    } catch (error) {
      logger.error("Storage error in getViews", { error });
      return [];
    }
  },
  getViewsByPage: async (...args: Parameters<IStorage["getViewsByPage"]>) => {
    try {
      return await getStorage().getViewsByPage(...args);
    } catch (error) {
      logger.error("Storage error in getViewsByPage", { error });
      return [];
    }
  },
  getViewsByEntityType: async (...args: Parameters<IStorage["getViewsByEntityType"]>) => {
    try {
      return await getStorage().getViewsByEntityType(...args);
    } catch (error) {
      logger.error("Storage error in getViewsByEntityType", { error });
      return [];
    }
  },
  getViewsByDate: async (...args: Parameters<IStorage["getViewsByDate"]>) => {
    try {
      return await getStorage().getViewsByDate(...args);
    } catch (error) {
      logger.error("Storage error in getViewsByDate", { error });
      return [];
    }
  },
  getTopPages: async (...args: Parameters<IStorage["getTopPages"]>) => {
    try {
      return await getStorage().getTopPages(...args);
    } catch (error) {
      logger.error("Storage error in getTopPages", { error });
      return [];
    }
  },
  
  // Affiliates
  getAffiliates: async (...args: Parameters<IStorage["getAffiliates"]>) => {
    try {
      return await getStorage().getAffiliates(...args);
    } catch (error) {
      logger.error("Storage error in getAffiliates", { error });
      return [];
    }
  },
  getAffiliate: async (...args: Parameters<IStorage["getAffiliate"]>) => {
    try {
      return await getStorage().getAffiliate(...args);
    } catch (error) {
      logger.error("Storage error in getAffiliate", { error });
      return null;
    }
  },
  createAffiliate: async (...args: Parameters<IStorage["createAffiliate"]>) => {
    try {
      return await getStorage().createAffiliate(...args);
    } catch (error) {
      logger.error("Storage error in createAffiliate", { error });
      throw error;
    }
  },
  updateAffiliate: async (...args: Parameters<IStorage["updateAffiliate"]>) => {
    try {
      return await getStorage().updateAffiliate(...args);
    } catch (error) {
      logger.error("Storage error in updateAffiliate", { error });
      throw error;
    }
  },
  deleteAffiliate: async (...args: Parameters<IStorage["deleteAffiliate"]>) => {
    try {
      return await getStorage().deleteAffiliate(...args);
    } catch (error) {
      logger.error("Storage error in deleteAffiliate", { error });
      return false;
    }
  },
  
  // Affiliate Clicks
  createAffiliateClick: async (...args: Parameters<IStorage["createAffiliateClick"]>) => {
    try {
      return await getStorage().createAffiliateClick(...args);
    } catch (error) {
      logger.error("Storage error in createAffiliateClick", { error });
      throw error;
    }
  },
  getAffiliateClicks: async (...args: Parameters<IStorage["getAffiliateClicks"]>) => {
    try {
      return await getStorage().getAffiliateClicks(...args);
    } catch (error) {
      logger.error("Storage error in getAffiliateClicks", { error });
      return [];
    }
  },
  getAffiliateClickStats: async (...args: Parameters<IStorage["getAffiliateClickStats"]>) => {
    try {
      return await getStorage().getAffiliateClickStats(...args);
    } catch (error) {
      logger.error("Storage error in getAffiliateClickStats", { error });
      return [];
    }
  },
  
  // Affiliate Programs
  getAffiliatePrograms: async (...args: Parameters<IStorage["getAffiliatePrograms"]>) => {
    try {
      return await getStorage().getAffiliatePrograms(...args);
    } catch (error) {
      logger.error("Storage error in getAffiliatePrograms", { error });
      return [];
    }
  },
  getAffiliateProgram: async (...args: Parameters<IStorage["getAffiliateProgram"]>) => {
    try {
      return await getStorage().getAffiliateProgram(...args);
    } catch (error) {
      logger.error("Storage error in getAffiliateProgram", { error });
      return null;
    }
  },
  createAffiliateProgram: async (...args: Parameters<IStorage["createAffiliateProgram"]>) => {
    try {
      return await getStorage().createAffiliateProgram(...args);
    } catch (error) {
      logger.error("Storage error in createAffiliateProgram", { error });
      throw error;
    }
  },
  updateAffiliateProgram: async (...args: Parameters<IStorage["updateAffiliateProgram"]>) => {
    try {
      return await getStorage().updateAffiliateProgram(...args);
    } catch (error) {
      logger.error("Storage error in updateAffiliateProgram", { error });
      throw error;
    }
  },
  deleteAffiliateProgram: async (...args: Parameters<IStorage["deleteAffiliateProgram"]>) => {
    try {
      return await getStorage().deleteAffiliateProgram(...args);
    } catch (error) {
      logger.error("Storage error in deleteAffiliateProgram", { error });
      return false;
    }
  },
};

