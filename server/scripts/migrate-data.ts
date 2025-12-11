/**
 * Data Migration Script
 * Migrates data from MemStorage to PostgreSQL
 * Run this once when migrating from development to production
 */

import { initDatabase } from "../config/database";
import { initStorage, getStorage, storage } from "../storage/index";
import { MemStorage } from "../storage/mem-storage";
import { logger } from "../utils/logger";
import { initializeData } from "../init-data";

async function migrateData() {
  try {
    logger.info("Starting data migration from MemStorage to PostgreSQL...");

    // Initialize database
    await initDatabase();
    logger.info("Database initialized");

    // Initialize storage (will use PostgreSQL if DATABASE_URL is set)
    await initStorage();
    const storage = getStorage();

    // Check if we're using PostgreSQL
    if (storage instanceof MemStorage) {
      logger.warn("DATABASE_URL not set, cannot migrate to PostgreSQL");
      logger.warn("Set DATABASE_URL environment variable to enable PostgreSQL migration");
      process.exit(1);
    }

    logger.info("PostgreSQL storage initialized");

    // Check if data already exists
    const existingPrompts = await storage.getPrompts();
    const existingSnippets = await storage.getSnippets();
    const existingLinks = await storage.getLinks();
    const existingGuides = await storage.getGuides();

    if (
      existingPrompts.length > 0 ||
      existingSnippets.length > 0 ||
      existingLinks.length > 0 ||
      existingGuides.length > 0
    ) {
      logger.warn("Database already contains data:");
      logger.warn(`  - Prompts: ${existingPrompts.length}`);
      logger.warn(`  - Snippets: ${existingSnippets.length}`);
      logger.warn(`  - Links: ${existingLinks.length}`);
      logger.warn(`  - Guides: ${existingGuides.length}`);
      logger.warn("Skipping migration. Data already exists.");
      logger.info("If you want to re-initialize, clear the database first.");
      return;
    }

    // Initialize default data (this will populate the database)
    logger.info("Initializing default data...");
    await initializeData();

    logger.info("✅ Data migration completed successfully!");
    logger.info("Default data has been loaded into PostgreSQL");

    process.exit(0);
  } catch (error) {
    logger.error("Migration failed:", error);
    process.exit(1);
  }
}

// Run migration if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  migrateData();
}

