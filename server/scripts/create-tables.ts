/**
 * Script para crear las tablas de la base de datos usando SQL directo
 * Útil cuando drizzle-kit no está disponible (producción)
 */

import { config } from "dotenv";
config();

import { getDatabase } from "../config/database";
import { logger } from "../utils/logger";

async function createTables() {
  try {
    const db = getDatabase();
    
    if (!db) {
      throw new Error("Database not initialized");
    }

    logger.info("Creating database tables...");

    // Crear todas las tablas basadas en el schema de shared/schema.ts
    await db.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        plan VARCHAR(20) DEFAULT 'free' NOT NULL,
        stripe_customer_id TEXT,
        stripe_subscription_id TEXT,
        subscription_status VARCHAR(20),
        subscription_ends_at TIMESTAMP,
        email_verified TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS prompts (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        category VARCHAR(50) NOT NULL,
        content TEXT NOT NULL,
        tags TEXT[] DEFAULT '{}',
        status VARCHAR(20) DEFAULT 'approved' NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS snippets (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        language VARCHAR(50) NOT NULL,
        code TEXT NOT NULL,
        description TEXT NOT NULL,
        tags TEXT[] DEFAULT '{}',
        status VARCHAR(20) DEFAULT 'approved' NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS links (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        url TEXT NOT NULL,
        icon VARCHAR(100),
        category VARCHAR(50) NOT NULL,
        description TEXT NOT NULL,
        status VARCHAR(20) DEFAULT 'approved' NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS guides (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        content TEXT,
        type VARCHAR(50) NOT NULL,
        tags TEXT[] DEFAULT '{}',
        image_url TEXT,
        status VARCHAR(20) DEFAULT 'approved' NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS views (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        page VARCHAR(100) NOT NULL,
        entity_type VARCHAR(50),
        entity_id VARCHAR(100),
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        user_agent TEXT,
        referrer TEXT
      );
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS affiliates (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        category VARCHAR(50) NOT NULL,
        url TEXT NOT NULL,
        code TEXT,
        commission TEXT,
        icon VARCHAR(100),
        utm TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS affiliate_clicks (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        affiliate_id VARCHAR NOT NULL REFERENCES affiliates(id) ON DELETE CASCADE,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        user_agent TEXT,
        referrer TEXT
      );
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS affiliate_programs (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        category VARCHAR(50) NOT NULL,
        registration_url TEXT,
        dashboard_url TEXT,
        status VARCHAR(50) DEFAULT 'not_requested' NOT NULL,
        request_date TIMESTAMP,
        approval_date TIMESTAMP,
        notes TEXT,
        tags TEXT[] DEFAULT '{}',
        priority VARCHAR(20) DEFAULT 'medium',
        integration_type VARCHAR(50) DEFAULT 'manual',
        integration_config TEXT,
        last_sync_at TIMESTAMP,
        total_clicks INTEGER DEFAULT 0,
        estimated_revenue REAL DEFAULT 0,
        internal_notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
    `);

    // Crear índices para mejorar el rendimiento
    await db.execute(`
      CREATE INDEX IF NOT EXISTS prompts_user_id_idx ON prompts(user_id);
      CREATE INDEX IF NOT EXISTS prompts_status_idx ON prompts(status);
      CREATE INDEX IF NOT EXISTS prompts_created_at_idx ON prompts(created_at);
      CREATE INDEX IF NOT EXISTS prompts_user_id_status_idx ON prompts(user_id, status);
      
      CREATE INDEX IF NOT EXISTS snippets_user_id_idx ON snippets(user_id);
      CREATE INDEX IF NOT EXISTS snippets_status_idx ON snippets(status);
      CREATE INDEX IF NOT EXISTS snippets_created_at_idx ON snippets(created_at);
      CREATE INDEX IF NOT EXISTS snippets_user_id_status_idx ON snippets(user_id, status);
      
      CREATE INDEX IF NOT EXISTS links_user_id_idx ON links(user_id);
      CREATE INDEX IF NOT EXISTS links_status_idx ON links(status);
      CREATE INDEX IF NOT EXISTS links_created_at_idx ON links(created_at);
      CREATE INDEX IF NOT EXISTS links_user_id_status_idx ON links(user_id, status);
      
      CREATE INDEX IF NOT EXISTS guides_user_id_idx ON guides(user_id);
      CREATE INDEX IF NOT EXISTS guides_status_idx ON guides(status);
      CREATE INDEX IF NOT EXISTS guides_created_at_idx ON guides(created_at);
      CREATE INDEX IF NOT EXISTS guides_user_id_status_idx ON guides(user_id, status);
    `);

    logger.info("✅ Database tables created successfully");
    process.exit(0);
  } catch (error: any) {
    logger.error("❌ Error creating tables:", error);
    console.error(error);
    process.exit(1);
  }
}

// Ejecutar si se llama directamente
createTables();

