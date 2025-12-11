/**
 * Snippets controller
 */

import type { Request, Response, NextFunction } from "express";
import { storage } from "../storage/index";
import { sendSuccess, sendNotFound, sendUnauthorized } from "../utils/response";
import { validateSnippet, validateSnippetUpdate } from "../services/validation.service";
import type { InsertSnippet, UpdateSnippet } from "@shared/schema";
import { USER_IDS, CONTENT_STATUS } from "@shared/constants";

export async function getSnippets(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?.id;
    const snippets = await storage.getSnippets(userId);
    sendSuccess(res, snippets);
  } catch (error) {
    next(error);
  }
}

export async function getSnippet(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const snippet = await storage.getSnippet(id, userId);
    
    if (!snippet) {
      sendNotFound(res, "Snippet", id);
      return;
    }
    
    sendSuccess(res, snippet);
  } catch (error) {
    next(error);
  }
}

export async function createSnippet(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      sendUnauthorized(res, "Authentication required to create snippets");
      return;
    }
    
    const validatedData = validateSnippet(req.body);
    // New content is created with status 'pending' (unless user is system)
    const snippet = await storage.createSnippet({
      ...validatedData,
      userId: req.user.id,
      status: req.user.id === USER_IDS.SYSTEM ? CONTENT_STATUS.APPROVED : CONTENT_STATUS.PENDING,
    });
    sendSuccess(res, snippet, 201);
  } catch (error) {
    next(error);
  }
}

export async function updateSnippet(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      sendUnauthorized(res, "Authentication required to update snippets");
      return;
    }
    
    const { id } = req.params;
    const validatedData = validateSnippetUpdate({ ...req.body, id });
    // When a user updates content, it goes back to 'pending' (unless user is system)
    type UpdateData = UpdateSnippet & { userId: string; status?: string };
    const updateData: UpdateData = {
      ...validatedData,
      userId: req.user.id,
    };
    if (req.user.id !== USER_IDS.SYSTEM) {
      updateData.status = CONTENT_STATUS.PENDING;
    }
    const snippet = await storage.updateSnippet(updateData);
    sendSuccess(res, snippet);
  } catch (error) {
    next(error);
  }
}

export async function deleteSnippet(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      sendUnauthorized(res, "Authentication required to delete snippets");
      return;
    }
    
    const { id } = req.params;
    const deleted = await storage.deleteSnippet(id, req.user.id);
    
    if (!deleted) {
      sendNotFound(res, "Snippet", id);
      return;
    }
    
    sendSuccess(res, { message: "Snippet deleted successfully" });
  } catch (error) {
    next(error);
  }
}

