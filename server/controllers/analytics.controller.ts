/**
 * Analytics controller
 */

import type { Request, Response, NextFunction } from "express";
import { storage } from "../storage/index";
import { sendSuccess } from "../utils/response";
import { z } from "zod";

const analyticsStatsQuerySchema = z.object({
  days: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 30)),
});

export async function createView(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const view = await storage.createView({
      page: req.body.page,
      entityType: req.body.entityType,
      entityId: req.body.entityId,
      userAgent: req.get("user-agent") || undefined,
      referrer: req.get("referer") || undefined,
    });
    sendSuccess(res, view, 201);
  } catch (error) {
    next(error);
  }
}

export async function getStats(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { days } = analyticsStatsQuerySchema.parse(req.query);
    
    const [byPage, byEntityType, byDate, topPages] = await Promise.all([
      storage.getViewsByPage(),
      storage.getViewsByEntityType(),
      storage.getViewsByDate(days),
      storage.getTopPages(10),
    ]);
    
    sendSuccess(res, { byPage, byEntityType, byDate, topPages });
  } catch (error) {
    next(error);
  }
}

export async function getViews(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const page = req.query.page as string | undefined;
    const entityType = req.query.entityType as string | undefined;
    const days = req.query.days
      ? parseInt(req.query.days as string, 10)
      : undefined;
    
    const views = await storage.getViews(page, entityType, days);
    sendSuccess(res, views);
  } catch (error) {
    next(error);
  }
}

