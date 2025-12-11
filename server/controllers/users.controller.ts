/**
 * Users Controller
 * Handles user registration, login, and profile management
 */

import type { Request, Response, NextFunction } from "express";
import { getStorage } from "../storage/index";
import { hashPassword, verifyPassword, generateToken } from "../utils/auth";
import { sendSuccess, sendError, sendNotFound, sendUnauthorized } from "../utils/response";
import { validateUser, validateUserUpdate } from "../services/validation.service";
import { ValidationError } from "../services/error.service";
import { logger } from "../utils/logger";

/**
 * Register a new user
 * POST /api/users/register
 */
export async function registerUser(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Validate input
    let validatedData;
    try {
      validatedData = validateUser(req.body);
    } catch (error: any) {
      if (error instanceof ValidationError) {
        sendError(res, error.message, 400, "VALIDATION_ERROR");
        return;
      }
      throw error;
    }

    const { username, email, password } = validatedData;

    // Check if user already exists
    const storage = getStorage();
    const existingUser = await storage.getUserByUsername(username);
    
    if (existingUser) {
      sendError(res, "Username already exists", 409, "USERNAME_EXISTS");
      return;
    }

    // Check if email already exists
    const existingEmail = await storage.getUserByEmail(email);
    if (existingEmail) {
      sendError(res, "Email already exists", 409, "EMAIL_EXISTS");
      return;
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const newUser = await storage.createUser({
      username,
      email,
      password: hashedPassword,
      plan: "free",
    });

    // Generate token
    const token = generateToken({
      userId: newUser.id,
      username: newUser.username,
      email: newUser.email || "",
      plan: newUser.plan || "free",
    });

    logger.info(`New user registered: ${username}`);

    sendSuccess(
      res,
      {
        user: {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
          plan: newUser.plan,
        },
        token,
      },
      201
    );
  } catch (error: any) {
    logger.error("Error registering user:", error);
    next(error);
  }
}

/**
 * Login user
 * POST /api/users/login
 */
export async function loginUser(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      sendError(res, "Username and password are required", 400, "MISSING_CREDENTIALS");
      return;
    }

    // Find user
    const storage = getStorage();
    const user = await storage.getUserByUsername(username);

    if (!user) {
      sendError(res, "Invalid username or password", 401, "INVALID_CREDENTIALS");
      return;
    }

    // Verify password
    const isValid = await verifyPassword(password, user.password);

    if (!isValid) {
      logger.warn(`Failed login attempt for user: ${username}`);
      sendError(res, "Invalid username or password", 401, "INVALID_CREDENTIALS");
      return;
    }

    // Generate token
    const token = generateToken({
      userId: user.id,
      username: user.username,
      email: user.email || "",
      plan: user.plan || "free",
    });

    logger.info(`User logged in: ${username}`);

    sendSuccess(res, {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        plan: user.plan,
      },
      token,
    });
  } catch (error: any) {
    logger.error("Error logging in user:", error);
    next(error);
  }
}

/**
 * Get current user profile
 * GET /api/users/me
 */
export async function getCurrentUser(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      sendUnauthorized(res, "Authentication required");
      return;
    }

    const storage = getStorage();
    const user = await storage.getUser(req.user.id);

    if (!user) {
      sendNotFound(res, "User", req.user.id);
      return;
    }

    sendSuccess(res, {
      id: user.id,
      username: user.username,
      email: user.email,
      plan: user.plan,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  } catch (error: any) {
    logger.error("Error getting current user:", error);
    next(error);
  }
}

/**
 * Update user profile
 * PUT /api/users/me
 */
export async function updateCurrentUser(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      sendUnauthorized(res, "Authentication required");
      return;
    }

    // Validate input
    let validatedData;
    try {
      validatedData = validateUserUpdate({
        ...req.body,
        id: req.user.id,
      });
    } catch (error: any) {
      if (error instanceof ValidationError) {
        sendError(res, error.message, 400, "VALIDATION_ERROR");
        return;
      }
      throw error;
    }

    const storage = getStorage();
    
    // If password is being updated, hash it
    const updateData: any = { ...validatedData };
    if (updateData.password) {
      updateData.password = await hashPassword(updateData.password);
    }

    const updatedUser = await storage.updateUser({
      id: req.user.id,
      ...updateData,
    });

    logger.info(`User profile updated: ${req.user.username}`);

    sendSuccess(res, {
      id: updatedUser.id,
      username: updatedUser.username,
      email: updatedUser.email,
      plan: updatedUser.plan,
      updatedAt: updatedUser.updatedAt,
    });
  } catch (error: any) {
    logger.error("Error updating user:", error);
    next(error);
  }
}

