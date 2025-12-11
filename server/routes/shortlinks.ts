/**
 * Shortlinks routes for /go/:id redirects
 */

import type { Express, Request, Response, NextFunction } from "express";
import { apiLimiter } from "../middleware/rate-limit.middleware";
import { storage } from "../storage/index";

export function registerShortlinkRoutes(app: Express): void {
  // Redirect to affiliate URL and track click (rate limited)
  app.get("/go/:id", apiLimiter, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      
      // Find affiliate by ID or name (slug)
      let affiliate = await storage.getAffiliate(id);
      
      // If not found by ID, try to find by name (as slug)
      if (!affiliate) {
        const affiliates = await storage.getAffiliates();
        affiliate = affiliates.find(
          (a) => a.name.toLowerCase().replace(/\s+/g, "-") === id.toLowerCase()
        );
      }
      
      if (!affiliate) {
        res.status(404).json({ error: "Affiliate not found" });
        return;
      }
      
      // Track the click
      await storage.createAffiliateClick({
        affiliateId: affiliate.id,
        userAgent: req.get("user-agent") || undefined,
        referrer: req.get("referer") || undefined,
      });
      
      // Build final URL with UTM
      let finalUrl = affiliate.url;
      if (affiliate.utm) {
        const separator = affiliate.url.includes("?") ? "&" : "?";
        finalUrl = `${affiliate.url}${separator}${affiliate.utm.replace(/^\?/, "")}`;
      } else {
        const separator = affiliate.url.includes("?") ? "&" : "?";
        finalUrl = `${affiliate.url}${separator}utm_source=codekit&utm_medium=shortlink&utm_campaign=affiliate`;
      }
      
      // Redirect to the affiliate URL
      res.redirect(302, finalUrl);
    } catch (error) {
      next(error);
    }
  });
}

