#!/usr/bin/env tsx
/**
 * PostgreSQL Setup Script
 * Helps configure PostgreSQL for CodeKit Pro
 */

import { neon } from "@neondatabase/serverless";
import { logger } from "../utils/logger";
import { readFileSync } from "fs";
import { join } from "path";
import pg from "pg";
const { Client } = pg;

// Load .env file manually
function loadEnvFile() {
  try {
    const envPath = join(process.cwd(), ".env");
    const envContent = readFileSync(envPath, "utf-8");
    const lines = envContent.split("\n");
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      // Skip comments and empty lines
      if (!trimmedLine || trimmedLine.startsWith("#")) continue;
      
      const equalIndex = trimmedLine.indexOf("=");
      if (equalIndex === -1) continue;
      
      const key = trimmedLine.substring(0, equalIndex).trim();
      const value = trimmedLine.substring(equalIndex + 1).trim();
      
      // Remove quotes if present
      const cleanValue = value.replace(/^["']|["']$/g, "");
      
      if (!process.env[key]) {
        process.env[key] = cleanValue;
      }
    }
  } catch (error) {
    // .env file doesn't exist or can't be read, that's okay
    // We'll show a helpful error message later
  }
}

// Load .env before anything else
loadEnvFile();

async function testConnection() {
  // Access DATABASE_URL directly from process.env
  // This script runs before validation, so we check process.env directly
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    logger.error("❌ DATABASE_URL not set in environment variables");
    logger.info("💡 Please set DATABASE_URL in your .env file");
    logger.info("💡 Example: DATABASE_URL=postgresql://user:password@host:5432/database");
    process.exit(1);
  }

  try {
    logger.info("🔌 Testing PostgreSQL connection...");
    
    // Check if it's a local connection (localhost or 127.0.0.1)
    const isLocal = databaseUrl.includes("localhost") || databaseUrl.includes("127.0.0.1");
    
    if (isLocal) {
      // Use pg client for local connections
      const client = new Client({ connectionString: databaseUrl });
      await client.connect();
      const result = await client.query("SELECT 1 as test");
      await client.end();
      
      if (result.rows && result.rows.length > 0) {
        logger.info("✅ PostgreSQL connection successful!");
        return true;
      } else {
        logger.error("❌ Connection test failed - no data returned");
        return false;
      }
    } else {
      // Use neon for remote/serverless connections
      const sqlClient = neon(databaseUrl);
      const result = await sqlClient`SELECT 1 as test`;
      
      if (result && result.length > 0) {
        logger.info("✅ PostgreSQL connection successful!");
        return true;
      } else {
        logger.error("❌ Connection test failed - no data returned");
        return false;
      }
    }
  } catch (error: any) {
    logger.error("❌ PostgreSQL connection failed:");
    logger.error(`   ${error.message}`);
    
    if (error.message.includes("ECONNREFUSED") || error.message.includes("fetch failed")) {
      logger.info("💡 Tip: Make sure PostgreSQL is running and accessible");
      logger.info("💡 Tip: For local connections, verify: sudo systemctl status postgresql");
    } else if (error.message.includes("authentication failed") || error.message.includes("password")) {
      logger.info("💡 Tip: Check your username and password in DATABASE_URL");
    } else if (error.message.includes("does not exist")) {
      logger.info("💡 Tip: Make sure the database exists");
    }
    
    return false;
  }
}

async function checkTables() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    return;
  }

  try {
    logger.info("📊 Checking database tables...");
    
    const isLocal = databaseUrl.includes("localhost") || databaseUrl.includes("127.0.0.1");
    
    if (isLocal) {
      // Use pg client for local connections
      const client = new Client({ connectionString: databaseUrl });
      await client.connect();
      const result = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        ORDER BY table_name
      `);
      await client.end();
      
      if (result.rows && result.rows.length > 0) {
        logger.info(`✅ Found ${result.rows.length} tables:`);
        result.rows.forEach((row: any) => {
          logger.info(`   - ${row.table_name}`);
        });
      } else {
        logger.warn("⚠️  No tables found. Run 'npm run db:push' to create tables.");
      }
    } else {
      // Use neon for remote/serverless connections
      const sqlClient = neon(databaseUrl);
      const tables = await sqlClient`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        ORDER BY table_name
      `;

      if (tables && tables.length > 0) {
        logger.info(`✅ Found ${tables.length} tables:`);
        tables.forEach((row: any) => {
          logger.info(`   - ${row.table_name}`);
        });
      } else {
        logger.warn("⚠️  No tables found. Run 'npm run db:push' to create tables.");
      }
    }
  } catch (error: any) {
    logger.error("❌ Error checking tables:", error.message);
  }
}

async function main() {
  logger.info("🚀 CodeKit Pro - PostgreSQL Setup");
  logger.info("================================\n");

  // Check if DATABASE_URL is set in process.env
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    logger.error("❌ DATABASE_URL not set in environment variables");
    logger.info("💡 Please set DATABASE_URL in your .env file");
    logger.info("💡 Example: DATABASE_URL=postgresql://user:password@localhost:5432/database");
    logger.info("\n💡 Make sure the .env file exists in the project root");
    process.exit(1);
  }

  // Test connection
  const connected = await testConnection();
  
  if (!connected) {
    logger.error("\n❌ Setup failed. Please fix the connection issues above.");
    process.exit(1);
  }

  // Check tables
  await checkTables();

  logger.info("\n✅ PostgreSQL setup complete!");
  logger.info("💡 Next steps:");
  logger.info("   1. Run 'npm run db:push' to create/update tables");
  logger.info("   2. Run 'npm run db:migrate' to migrate data from MemStorage (if needed)");
  logger.info("   3. Start the server: 'npm run dev'");
}

main().catch((error) => {
  logger.error("Fatal error:", error);
  process.exit(1);
});

