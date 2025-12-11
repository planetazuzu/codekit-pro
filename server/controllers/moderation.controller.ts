/**
 * Moderation Controller
 * Handles approval/rejection of user-submitted content
 */

import type { Request, Response, NextFunction } from "express";
import { getDatabase } from "../config/database";
import { sendSuccess, sendNotFound, sendUnauthorized } from "../utils/response";
import { eq, and, or } from "drizzle-orm";
import { prompts, snippets, links, guides } from "@shared/schema";
import { CONTENT_STATUS } from "@shared/constants";

/**
 * Get all pending content for moderation
 */
export async function getPendingContent(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const db = getDatabase();
    
    // Get all pending items
    const pendingPrompts = await db.select().from(prompts).where(eq(prompts.status, CONTENT_STATUS.PENDING));
    const pendingSnippets = await db.select().from(snippets).where(eq(snippets.status, CONTENT_STATUS.PENDING));
    const pendingLinks = await db.select().from(links).where(eq(links.status, CONTENT_STATUS.PENDING));
    const pendingGuides = await db.select().from(guides).where(eq(guides.status, CONTENT_STATUS.PENDING));
    
    sendSuccess(res, {
      prompts: pendingPrompts,
      snippets: pendingSnippets,
      links: pendingLinks,
      guides: pendingGuides,
      total: pendingPrompts.length + pendingSnippets.length + pendingLinks.length + pendingGuides.length,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Approve content (prompt, snippet, link, or guide)
 */
export async function approveContent(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { type, id } = req.params; // type: 'prompt' | 'snippet' | 'link' | 'guide'
    const db = getDatabase();
    
    let updated;
    switch (type) {
      case "prompt":
        updated = await db
          .update(prompts)
          .set({ status: CONTENT_STATUS.APPROVED, updatedAt: new Date() })
          .where(eq(prompts.id, id))
          .returning();
        break;
      case "snippet":
        updated = await db
          .update(snippets)
          .set({ status: CONTENT_STATUS.APPROVED, updatedAt: new Date() })
          .where(eq(snippets.id, id))
          .returning();
        break;
      case "link":
        updated = await db
          .update(links)
          .set({ status: CONTENT_STATUS.APPROVED, updatedAt: new Date() })
          .where(eq(links.id, id))
          .returning();
        break;
      case "guide":
        updated = await db
          .update(guides)
          .set({ status: CONTENT_STATUS.APPROVED, updatedAt: new Date() })
          .where(eq(guides.id, id))
          .returning();
        break;
      default:
        return sendNotFound(res, "Content type", type);
    }
    
    if (!updated || updated.length === 0) {
      return sendNotFound(res, "Content", id);
    }
    
    sendSuccess(res, updated[0]);
  } catch (error) {
    next(error);
  }
}

/**
 * Reject content
 */
export async function rejectContent(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { type, id } = req.params;
    const db = getDatabase();
    
    let updated;
    switch (type) {
      case "prompt":
        updated = await db
          .update(prompts)
          .set({ status: CONTENT_STATUS.REJECTED, updatedAt: new Date() })
          .where(eq(prompts.id, id))
          .returning();
        break;
      case "snippet":
        updated = await db
          .update(snippets)
          .set({ status: CONTENT_STATUS.REJECTED, updatedAt: new Date() })
          .where(eq(snippets.id, id))
          .returning();
        break;
      case "link":
        updated = await db
          .update(links)
          .set({ status: CONTENT_STATUS.REJECTED, updatedAt: new Date() })
          .where(eq(links.id, id))
          .returning();
        break;
      case "guide":
        updated = await db
          .update(guides)
          .set({ status: CONTENT_STATUS.REJECTED, updatedAt: new Date() })
          .where(eq(guides.id, id))
          .returning();
        break;
      default:
        return sendNotFound(res, "Content type", type);
    }
    
    if (!updated || updated.length === 0) {
      return sendNotFound(res, "Content", id);
    }
    
    sendSuccess(res, updated[0]);
  } catch (error) {
    next(error);
  }
}

