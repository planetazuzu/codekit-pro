/**
 * Environment variables validation
 * Ensures all required environment variables are present and valid at startup
 */

import { z } from "zod";
import { logger } from "../utils/logger";

/**
 * Schema for environment variables
 */
const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z
    .string()
    .default("5000")
    .transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val) && val > 0, {
      message: "PORT must be a positive number",
    }),
  DATABASE_URL: z.string().url().optional(),
  ALLOWED_ORIGINS: z.string().optional(),
  ADMIN_PASSWORD: z.string().min(8).optional(),
  JWT_SECRET: z.string().min(32).optional(),
  API_URL: z.string().url().optional(),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  GITHUB_TOKEN: z.string().optional(),
  GITHUB_REPO_OWNER: z.string().optional(),
  GITHUB_REPO_NAME: z.string().optional(),
  GITHUB_SYNC_ENABLED: z
    .union([z.string(), z.boolean()])
    .transform((val) => {
      if (typeof val === "boolean") return val;
      if (typeof val === "string") return val.toLowerCase() === "true";
      return false;
    })
    .optional()
    .default(false),
});

type Env = z.infer<typeof envSchema>;

let validatedEnv: Env | null = null;

/**
 * Validate and return environment variables
 * Throws an error if validation fails
 */
export function validateEnv(): Env {
  if (validatedEnv) {
    return validatedEnv;
  }

  try {
    // Normalize GITHUB_SYNC_ENABLED - ensure it's always a string or undefined
    // Docker Compose might pass it as boolean, so we normalize it
    const githubSyncEnabledRaw = (process.env as any).GITHUB_SYNC_ENABLED;
    const githubSyncEnabledValue = 
      githubSyncEnabledRaw === undefined || githubSyncEnabledRaw === null
        ? undefined
        : typeof githubSyncEnabledRaw === "boolean"
        ? String(githubSyncEnabledRaw)
        : String(githubSyncEnabledRaw);

    validatedEnv = envSchema.parse({
      NODE_ENV: process.env.NODE_ENV,
      PORT: process.env.PORT,
      DATABASE_URL: process.env.DATABASE_URL,
      ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS,
      ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
      JWT_SECRET: process.env.JWT_SECRET,
      API_URL: process.env.API_URL,
      STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
      STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
      GITHUB_TOKEN: process.env.GITHUB_TOKEN,
      GITHUB_REPO_OWNER: process.env.GITHUB_REPO_OWNER,
      GITHUB_REPO_NAME: process.env.GITHUB_REPO_NAME,
      GITHUB_SYNC_ENABLED: githubSyncEnabledValue,
    });

    logger.info("Environment variables validated successfully");

    // Warn about missing optional but recommended variables
    if (!validatedEnv.DATABASE_URL) {
      logger.warn(
        "DATABASE_URL not set - using MemStorage (not recommended for production)"
      );
    }

    if (!validatedEnv.ADMIN_PASSWORD) {
      logger.warn(
        "ADMIN_PASSWORD not set - using default password (not secure)"
      );
    }

    if (!validatedEnv.JWT_SECRET && validatedEnv.NODE_ENV === "production") {
      logger.warn(
        "JWT_SECRET not set in production - authentication may be insecure"
      );
    }

    return validatedEnv;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join("\n");
      logger.error("Environment variable validation failed:", { errors });
      throw new Error(
        `Invalid environment variables:\n${errors}\n\nPlease check your .env file or environment configuration.`
      );
    }
    throw error;
  }
}

/**
 * Get validated environment variables
 * Call validateEnv() first to ensure variables are validated
 */
export function getEnv(): Env {
  if (!validatedEnv) {
    throw new Error(
      "Environment variables not validated. Call validateEnv() first."
    );
  }
  return validatedEnv;
}

/**
 * Type-safe access to environment variables
 */
export const env = {
  get NODE_ENV() {
    return getEnv().NODE_ENV;
  },
  get PORT() {
    return getEnv().PORT;
  },
  get DATABASE_URL() {
    return getEnv().DATABASE_URL;
  },
  get ALLOWED_ORIGINS() {
    return getEnv().ALLOWED_ORIGINS;
  },
  get ADMIN_PASSWORD() {
    return getEnv().ADMIN_PASSWORD;
  },
  get JWT_SECRET() {
    return getEnv().JWT_SECRET;
  },
  get API_URL() {
    return getEnv().API_URL;
  },
  get STRIPE_SECRET_KEY() {
    return getEnv().STRIPE_SECRET_KEY;
  },
  get STRIPE_WEBHOOK_SECRET() {
    return getEnv().STRIPE_WEBHOOK_SECRET;
  },
  get GITHUB_TOKEN() {
    return getEnv().GITHUB_TOKEN;
  },
  get GITHUB_REPO_OWNER() {
    return getEnv().GITHUB_REPO_OWNER;
  },
  get GITHUB_REPO_NAME() {
    return getEnv().GITHUB_REPO_NAME;
  },
  get GITHUB_SYNC_ENABLED() {
    return getEnv().GITHUB_SYNC_ENABLED;
  },
};

