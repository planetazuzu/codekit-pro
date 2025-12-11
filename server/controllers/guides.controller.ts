/**
 * Guides controller
 */

import type { Request, Response, NextFunction } from "express";
import { storage } from "../storage/index";
import { sendSuccess, sendNotFound, sendUnauthorized } from "../utils/response";
import { validateGuide, validateGuideUpdate } from "../services/validation.service";
import type { InsertGuide, UpdateGuide } from "@shared/schema";
import { USER_IDS, CONTENT_STATUS } from "@shared/constants";

export async function getGuides(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?.id;
    const guides = await storage.getGuides(userId);
    sendSuccess(res, guides);
  } catch (error) {
    next(error);
  }
}

export async function getGuide(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const guide = await storage.getGuide(id, userId);
    
    if (!guide) {
      sendNotFound(res, "Guide", id);
      return;
    }
    
    sendSuccess(res, guide);
  } catch (error) {
    next(error);
  }
}

export async function createGuide(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      sendUnauthorized(res, "Authentication required to create guides");
      return;
    }
    
    const validatedData = validateGuide(req.body);
    // New content is created with status 'pending' (unless user is system)
    const guide = await storage.createGuide({
      ...validatedData,
      userId: req.user.id,
      status: req.user.id === USER_IDS.SYSTEM ? CONTENT_STATUS.APPROVED : CONTENT_STATUS.PENDING,
    });
    sendSuccess(res, guide, 201);
  } catch (error) {
    next(error);
  }
}

export async function updateGuide(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      sendUnauthorized(res, "Authentication required to update guides");
      return;
    }
    
    const { id } = req.params;
    const validatedData = validateGuideUpdate({ ...req.body, id });
    // When a user updates content, it goes back to 'pending' (unless user is system)
    type UpdateData = UpdateGuide & { userId: string; status?: string };
    const updateData: UpdateData = {
      ...validatedData,
      userId: req.user.id,
    };
    if (req.user.id !== USER_IDS.SYSTEM) {
      updateData.status = CONTENT_STATUS.PENDING;
    }
    const guide = await storage.updateGuide(updateData);
    sendSuccess(res, guide);
  } catch (error) {
    next(error);
  }
}

export async function deleteGuide(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      sendUnauthorized(res, "Authentication required to delete guides");
      return;
    }
    
    const { id } = req.params;
    const deleted = await storage.deleteGuide(id, req.user.id);
    
    if (!deleted) {
      sendNotFound(res, "Guide", id);
      return;
    }
    
    sendSuccess(res, { message: "Guide deleted successfully" });
  } catch (error) {
    next(error);
  }
}

