/**
 * Stats routes
 * Lightweight endpoints for dashboard statistics
 * Uses COUNT queries instead of loading full data
 */

import type { Express, Request, Response } from "express";
import { getDatabase } from "../config/database";
import { logger } from "../utils/logger";
import { prompts, snippets, links, guides } from "@shared/schema";
import { eq, sql } from "drizzle-orm";
import { CONTENT_STATUS } from "@shared/constants";

interface StatsResponse {
  prompts: number;
  snippets: number;
  links: number;
  guides: number;
}

export function registerStatsRoutes(app: Express): void {
  /**
   * GET /api/stats
   * Get counts for all resources (lightweight, uses COUNT queries)
   */
  app.get("/api/stats", async (req: Request, res: Response) => {
    try {
      const db = getDatabase();
      if (!db) {
        throw new Error("Database not initialized");
      }

      // Use COUNT queries directly - much faster than loading all data
      const [promptsResult, snippetsResult, linksResult, guidesResult] = await Promise.all([
        db
          .select({ count: sql<number>`count(*)` })
          .from(prompts)
          .where(eq(prompts.status, CONTENT_STATUS.APPROVED)),
        db
          .select({ count: sql<number>`count(*)` })
          .from(snippets)
          .where(eq(snippets.status, CONTENT_STATUS.APPROVED)),
        db
          .select({ count: sql<number>`count(*)` })
          .from(links)
          .where(eq(links.status, CONTENT_STATUS.APPROVED)),
        db
          .select({ count: sql<number>`count(*)` })
          .from(guides)
          .where(eq(guides.status, CONTENT_STATUS.APPROVED)),
      ]);

      const stats: StatsResponse = {
        prompts: Number(promptsResult[0]?.count || 0),
        snippets: Number(snippetsResult[0]?.count || 0),
        links: Number(linksResult[0]?.count || 0),
        guides: Number(guidesResult[0]?.count || 0),
      };

      res.json({ success: true, data: stats });
    } catch (error: any) {
      logger.error("Error fetching stats", { error, source: "stats" });
      // Return default stats instead of 500 error to prevent frontend crashes
      const defaultStats: StatsResponse = {
        prompts: 0,
        snippets: 0,
        links: 0,
        guides: 0,
      };
      res.status(200).json({ success: true, data: defaultStats });
    }
  });
}

