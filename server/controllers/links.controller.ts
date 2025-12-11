/**
 * Links controller
 */

import type { Request, Response, NextFunction } from "express";
import { storage } from "../storage/index";
import { sendSuccess, sendNotFound, sendUnauthorized } from "../utils/response";
import { validateLink, validateLinkUpdate } from "../services/validation.service";
import type { InsertLink, UpdateLink } from "@shared/schema";
import { USER_IDS, CONTENT_STATUS } from "@shared/constants";

export async function getLinks(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?.id;
    const links = await storage.getLinks(userId);
    sendSuccess(res, links);
  } catch (error) {
    next(error);
  }
}

export async function getLink(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const link = await storage.getLink(id, userId);
    
    if (!link) {
      sendNotFound(res, "Link", id);
      return;
    }
    
    sendSuccess(res, link);
  } catch (error) {
    next(error);
  }
}

export async function createLink(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      sendUnauthorized(res, "Authentication required to create links");
      return;
    }
    
    const validatedData = validateLink(req.body);
    // New content is created with status 'pending' (unless user is system)
    const link = await storage.createLink({
      ...validatedData,
      userId: req.user.id,
      status: req.user.id === USER_IDS.SYSTEM ? CONTENT_STATUS.APPROVED : CONTENT_STATUS.PENDING,
    });
    sendSuccess(res, link, 201);
  } catch (error) {
    next(error);
  }
}

export async function updateLink(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      sendUnauthorized(res, "Authentication required to update links");
      return;
    }
    
    const { id } = req.params;
    const validatedData = validateLinkUpdate({ ...req.body, id });
    // When a user updates content, it goes back to 'pending' (unless user is system)
    type UpdateData = UpdateLink & { userId: string; status?: string };
    const updateData: UpdateData = {
      ...validatedData,
      userId: req.user.id,
    };
    if (req.user.id !== USER_IDS.SYSTEM) {
      updateData.status = CONTENT_STATUS.PENDING;
    }
    const link = await storage.updateLink(updateData);
    sendSuccess(res, link);
  } catch (error) {
    next(error);
  }
}

export async function deleteLink(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      sendUnauthorized(res, "Authentication required to delete links");
      return;
    }
    
    const { id } = req.params;
    const deleted = await storage.deleteLink(id, req.user.id);
    
    if (!deleted) {
      sendNotFound(res, "Link", id);
      return;
    }
    
    sendSuccess(res, { message: "Link deleted successfully" });
  } catch (error) {
    next(error);
  }
}

