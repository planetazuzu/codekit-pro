/**
 * Prompts controller
 */

import type { Request, Response, NextFunction } from "express";
import { storage } from "../storage/index";
import { sendSuccess, sendNotFound, sendUnauthorized } from "../utils/response";
import { validatePrompt, validatePromptUpdate } from "../services/validation.service";
import { checkLimit } from "../middleware/plan-limits.middleware";
import type { InsertPrompt, UpdatePrompt } from "@shared/schema";
import { USER_IDS, CONTENT_STATUS } from "@shared/constants";

export async function getPrompts(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Allow optional auth - if user is authenticated, filter by userId
    const userId = req.user?.id;
    const prompts = await storage.getPrompts(userId);
    sendSuccess(res, prompts);
  } catch (error) {
    next(error);
  }
}

export async function getPrompt(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const prompt = await storage.getPrompt(id, userId);
    
    if (!prompt) {
      sendNotFound(res, "Prompt", id);
      return;
    }
    
    sendSuccess(res, prompt);
  } catch (error) {
    next(error);
  }
}

export async function createPrompt(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      sendUnauthorized(res, "Authentication required to create prompts");
      return;
    }
    
    const validatedData = validatePrompt(req.body);
    // New content is created with status 'pending' (unless user is system)
    const prompt = await storage.createPrompt({
      ...validatedData,
      userId: req.user.id,
      status: req.user.id === USER_IDS.SYSTEM ? CONTENT_STATUS.APPROVED : CONTENT_STATUS.PENDING,
    });
    sendSuccess(res, prompt, 201);
  } catch (error) {
    next(error);
  }
}

export async function updatePrompt(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      sendUnauthorized(res, "Authentication required to update prompts");
      return;
    }
    
    const { id } = req.params;
    const validatedData = validatePromptUpdate({ ...req.body, id });
    // When a user updates content, it goes back to 'pending' (unless user is system)
    type UpdateData = UpdatePrompt & { userId: string; status?: string };
    const updateData: UpdateData = {
      ...validatedData,
      userId: req.user.id,
    };
    if (req.user.id !== USER_IDS.SYSTEM) {
      updateData.status = CONTENT_STATUS.PENDING;
    }
    const prompt = await storage.updatePrompt(updateData);
    sendSuccess(res, prompt);
  } catch (error) {
    next(error);
  }
}

export async function deletePrompt(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      sendUnauthorized(res, "Authentication required to delete prompts");
      return;
    }
    
    const { id } = req.params;
    const deleted = await storage.deletePrompt(id, req.user.id);
    
    if (!deleted) {
      sendNotFound(res, "Prompt", id);
      return;
    }
    
    sendSuccess(res, { message: "Prompt deleted successfully" });
  } catch (error) {
    next(error);
  }
}

