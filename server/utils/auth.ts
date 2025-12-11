/**
 * Authentication utilities
 * Password hashing and JWT token generation/verification
 */

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { logger } from "./logger";

const SALT_ROUNDS = 10;

/**
 * Get JWT secret, with fallback for development
 * This function is called lazily to avoid accessing env before validation
 */
function getJwtSecret(): string {
  try {
    return env.JWT_SECRET || process.env.JWT_SECRET || "default-secret-change-in-production";
  } catch (error) {
    // If env is not validated yet, use process.env directly
    return process.env.JWT_SECRET || "default-secret-change-in-production";
  }
}

export interface JWTPayload {
  userId: string;
  username: string;
  email: string;
  plan: string;
}

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  try {
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    return await bcrypt.hash(password, salt);
  } catch (error) {
    logger.error("Error hashing password:", error);
    throw new Error("Failed to hash password");
  }
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  try {
    return await bcrypt.compare(password, hash);
  } catch (error) {
    logger.error("Error verifying password:", error);
    return false;
  }
}

/**
 * Generate a JWT token for a user
 */
export function generateToken(payload: JWTPayload): string {
  try {
    return jwt.sign(payload, getJwtSecret(), {
      expiresIn: "7d", // Token expires in 7 days
    });
  } catch (error) {
    logger.error("Error generating token:", error);
    throw new Error("Failed to generate token");
  }
}

/**
 * Verify and decode a JWT token
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, getJwtSecret()) as JWTPayload;
    return decoded;
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      logger.warn("Invalid token:", error.message);
    } else if (error instanceof jwt.TokenExpiredError) {
      logger.warn("Token expired:", error.message);
    } else {
      logger.error("Error verifying token:", error);
    }
    return null;
  }
}

/**
 * Extract token from Authorization header
 */
export function extractTokenFromHeader(authHeader: string | undefined): string | null {
  if (!authHeader) {
    return null;
  }

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return null;
  }

  return parts[1];
}

