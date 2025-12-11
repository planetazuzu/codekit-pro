/**
 * Session Configuration
 * Configures persistent session storage using PostgreSQL
 */

import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { getDatabase } from "./database";
import { env } from "./env";
import { logger } from "../utils/logger";

const PgSession = connectPgSimple(session);

/**
 * Create session store
 * Uses PostgreSQL if DATABASE_URL is set, otherwise falls back to memory
 */
export function createSessionStore() {
  const databaseUrl = env.DATABASE_URL;

  if (databaseUrl) {
    // Use PostgreSQL for persistent sessions
    logger.info("Configuring PostgreSQL session store");
    return new PgSession({
      conObject: {
        connectionString: databaseUrl,
      },
      tableName: "user_sessions", // Custom table name
      createTableIfMissing: true, // Auto-create table if it doesn't exist
    });
  } else {
    // Fallback to memory store for development
    logger.warn("DATABASE_URL not set, using memory session store (sessions will be lost on restart)");
    const MemoryStore = require("memorystore")(session);
    return new MemoryStore({
      checkPeriod: 86400000, // Prune expired entries every 24h
    });
  }
}

/**
 * Get session configuration
 * Must be called after validateEnv()
 */
export function getSessionConfig(): session.SessionOptions {
  // Access env after validation
  const jwtSecret = env.JWT_SECRET || "default-secret-change-in-production";
  const nodeEnv = env.NODE_ENV || "development";
  
  return {
    secret: jwtSecret,
    resave: false,
    saveUninitialized: false,
    store: createSessionStore(),
    name: "codekit.sid", // Custom session cookie name
    cookie: {
      secure: nodeEnv === "production", // HTTPS only in production
      httpOnly: true, // Prevent XSS attacks
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      sameSite: "lax", // CSRF protection
    },
  };
}

