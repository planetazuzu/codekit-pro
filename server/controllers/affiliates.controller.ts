/**
 * Affiliates controller
 */

import type { Request, Response, NextFunction } from "express";
import { storage } from "../storage/index";
import { sendSuccess, sendNotFound } from "../utils/response";
import { validateAffiliate, validateAffiliateUpdate } from "../services/validation.service";
import type { InsertAffiliate, UpdateAffiliate, InsertAffiliateClick } from "@shared/schema";

export async function getAffiliates(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const affiliates = await storage.getAffiliates();
    sendSuccess(res, affiliates);
  } catch (error) {
    next(error);
  }
}

export async function getAffiliate(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const affiliate = await storage.getAffiliate(id);
    
    if (!affiliate) {
      sendNotFound(res, "Affiliate", id);
      return;
    }
    
    sendSuccess(res, affiliate);
  } catch (error) {
    next(error);
  }
}

export async function createAffiliate(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const validatedData = validateAffiliate(req.body);
    
    // Generate UTM if not provided
    if (!validatedData.utm) {
      validatedData.utm = "?utm_source=codekit&utm_medium=app&utm_campaign=affiliate";
    }
    
    const affiliate = await storage.createAffiliate(validatedData);
    sendSuccess(res, affiliate, 201);
  } catch (error) {
    next(error);
  }
}

export async function updateAffiliate(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const validatedData = validateAffiliateUpdate({ ...req.body, id });
    const affiliate = await storage.updateAffiliate(validatedData);
    sendSuccess(res, affiliate);
  } catch (error) {
    next(error);
  }
}

export async function deleteAffiliate(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const deleted = await storage.deleteAffiliate(id);
    
    if (!deleted) {
      sendNotFound(res, "Affiliate", id);
      return;
    }
    
    sendSuccess(res, { message: "Affiliate deleted successfully" });
  } catch (error) {
    next(error);
  }
}

export async function trackAffiliateClick(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    
    // Verify affiliate exists
    const affiliate = await storage.getAffiliate(id);
    if (!affiliate) {
      sendNotFound(res, "Affiliate", id);
      return;
    }
    
    const click: InsertAffiliateClick = {
      affiliateId: id,
      userAgent: req.get("user-agent") || undefined,
      referrer: req.get("referer") || undefined,
    };
    
    await storage.createAffiliateClick(click);
    sendSuccess(res, { message: "Click tracked" }, 201);
  } catch (error) {
    next(error);
  }
}

export async function getAffiliateStats(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const affiliateId = id === "all" ? undefined : id;
    
    const stats = await storage.getAffiliateClickStats(affiliateId);
    sendSuccess(res, stats);
  } catch (error) {
    next(error);
  }
}

