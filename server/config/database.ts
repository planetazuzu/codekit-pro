/**
 * Database configuration
 * Supports both local PostgreSQL (using pg) and Neon serverless (using @neondatabase/serverless)
 */

import { logger } from "../utils/logger";
import { env } from "./env";

// Database connection
let db: any = null;

/**
 * Initialize database connection
 * Detects if it's a local PostgreSQL connection or Neon serverless
 */
export async function initDatabase() {
  const databaseUrl = env.DATABASE_URL;

  if (!databaseUrl) {
    logger.warn("DATABASE_URL not set, using MemStorage");
    return null;
  }

  try {
    // Check if it's a local PostgreSQL connection (localhost or 127.0.0.1)
    const isLocalConnection = 
      databaseUrl.includes("localhost") || 
      databaseUrl.includes("127.0.0.1") ||
      databaseUrl.startsWith("postgresql://") && !databaseUrl.includes("neon.tech");

    if (isLocalConnection) {
      // Use pg for local PostgreSQL connections
      logger.info("Detected local PostgreSQL connection, using pg client");
      const { Pool } = await import("pg");
      const { drizzle: drizzlePg } = await import("drizzle-orm/node-postgres");
      
      const pool = new Pool({
        connectionString: databaseUrl,
      });

      // Test connection
      await pool.query("SELECT 1");
      
      db = drizzlePg(pool);
      logger.info("Local PostgreSQL connection initialized successfully");
    } else {
      // Use Neon serverless for remote connections
      logger.info("Detected Neon serverless connection, using neon client");
      const { neon } = await import("@neondatabase/serverless");
      const { drizzle: drizzleNeon } = await import("drizzle-orm/neon-http");
      
      const sql = neon(databaseUrl);
      db = drizzleNeon(sql);
      logger.info("Neon serverless connection initialized successfully");
    }

    return db;
  } catch (error) {
    logger.error("Failed to initialize database:", error);
    throw error;
  }
}

/**
 * Get database instance
 */
export function getDatabase() {
  return db;
}

/**
 * Close database connection
 */
export async function closeDatabase() {
  if (db) {
    // Check if it's a pg Pool instance
    if (db.client && typeof db.client.end === "function") {
      await db.client.end();
    }
  }
  db = null;
  logger.info("Database connection closed");
}

