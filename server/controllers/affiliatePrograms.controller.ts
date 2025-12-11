/**
 * Affiliate Programs Controller
 */

import type { Request, Response, NextFunction } from "express";
import { storage } from "../storage/index";
import { sendSuccess, sendNotFound, sendError } from "../utils/response";
import { validateAffiliateProgram, validateAffiliateProgramUpdate } from "../services/validation.service";
import { syncAffiliateProgram, syncAllAffiliatePrograms } from "../jobs/affiliateSync";
import { decrypt, isEncrypted } from "../utils/encryption";
import type { InsertAffiliateProgram, UpdateAffiliateProgram, AffiliateProgram } from "@shared/schema";

export async function getAffiliatePrograms(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { category, status, priority, search } = req.query;
    let programs = await storage.getAffiliatePrograms();

    // Filter by category
    if (category && typeof category === "string") {
      programs = programs.filter((p) => p.category === category);
    }

    // Filter by status
    if (status && typeof status === "string") {
      programs = programs.filter((p) => p.status === status);
    }

    // Filter by priority
    if (priority && typeof priority === "string") {
      programs = programs.filter((p) => p.priority === priority);
    }

    // Search by name
    if (search && typeof search === "string") {
      const searchLower = search.toLowerCase();
      programs = programs.filter(
        (p) =>
          p.name.toLowerCase().includes(searchLower) ||
          p.category.toLowerCase().includes(searchLower)
      );
    }

    // Decrypt sensitive fields before sending to client
    const decryptedPrograms = programs.map((program) => {
      const decrypted = { ...program };
      if (decrypted.integrationConfig && isEncrypted(decrypted.integrationConfig)) {
        try {
          decrypted.integrationConfig = decrypt(decrypted.integrationConfig);
        } catch {
          // Keep encrypted if decryption fails
        }
      }
      if (decrypted.internalNotes && isEncrypted(decrypted.internalNotes)) {
        try {
          decrypted.internalNotes = decrypt(decrypted.internalNotes);
        } catch {
          // Keep encrypted if decryption fails
        }
      }
      return decrypted;
    });

    sendSuccess(res, decryptedPrograms);
  } catch (error) {
    next(error);
  }
}

export async function getAffiliateProgram(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const program = await storage.getAffiliateProgram(id);
    
    if (!program) {
      sendNotFound(res, "Affiliate program not found");
      return;
    }

    // Decrypt sensitive fields before sending to client
    const decryptedProgram = { ...program };
    if (decryptedProgram.integrationConfig && isEncrypted(decryptedProgram.integrationConfig)) {
      try {
        decryptedProgram.integrationConfig = decrypt(decryptedProgram.integrationConfig);
      } catch (error) {
        // If decryption fails, return encrypted (shouldn't happen, but handle gracefully)
      }
    }
    if (decryptedProgram.internalNotes && isEncrypted(decryptedProgram.internalNotes)) {
      try {
        decryptedProgram.internalNotes = decrypt(decryptedProgram.internalNotes);
      } catch (error) {
        // If decryption fails, return encrypted (shouldn't happen, but handle gracefully)
      }
    }

    sendSuccess(res, decryptedProgram);
  } catch (error) {
    next(error);
  }
}

export async function createAffiliateProgram(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const validated = validateAffiliateProgram(req.body);
    const program = await storage.createAffiliateProgram(validated);
    sendSuccess(res, program, 201);
  } catch (error: any) {
    if (error.name === "ZodError") {
      sendError(res, "Validation error", 400, error.errors);
      return;
    }
    next(error);
  }
}

export async function updateAffiliateProgram(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const validated = validateAffiliateProgramUpdate({ ...req.body, id });
    const program = await storage.updateAffiliateProgram(validated);
    sendSuccess(res, program);
  } catch (error: any) {
    if (error.name === "ZodError") {
      sendError(res, "Validation error", 400, error.errors);
      return;
    }
    if (error.message?.includes("not found")) {
      sendNotFound(res, error.message);
      return;
    }
    next(error);
  }
}

export async function deleteAffiliateProgram(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const deleted = await storage.deleteAffiliateProgram(id);
    
    if (!deleted) {
      sendNotFound(res, "Affiliate program not found");
      return;
    }

    sendSuccess(res, { id, deleted: true });
  } catch (error) {
    next(error);
  }
}

export async function syncAffiliateProgramEndpoint(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const program = await storage.getAffiliateProgram(id);
    
    if (!program) {
      sendNotFound(res, "Affiliate program not found");
      return;
    }

    const result = await syncAffiliateProgram(program);
    
    if (!result.success) {
      sendError(res, result.error || "Sync failed", 500);
      return;
    }

    // Fetch updated program
    const updated = await storage.getAffiliateProgram(id);
    sendSuccess(res, { program: updated, syncResult: result });
  } catch (error) {
    next(error);
  }
}

export async function syncAllAffiliateProgramsEndpoint(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const results = await syncAllAffiliatePrograms();
    const successCount = results.filter((r) => r.success).length;
    
    sendSuccess(res, {
      total: results.length,
      success: successCount,
      failed: results.length - successCount,
      results,
    });
  } catch (error) {
    next(error);
  }
}

export async function getAffiliateProgramsStats(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const programs = await storage.getAffiliatePrograms();
    
    const stats = {
      total: programs.length,
      byStatus: {
        not_requested: programs.filter((p) => p.status === "not_requested").length,
        pending: programs.filter((p) => p.status === "pending").length,
        approved: programs.filter((p) => p.status === "approved").length,
        rejected: programs.filter((p) => p.status === "rejected").length,
        inactive: programs.filter((p) => p.status === "inactive").length,
      },
      byPriority: {
        high: programs.filter((p) => p.priority === "high").length,
        medium: programs.filter((p) => p.priority === "medium").length,
        low: programs.filter((p) => p.priority === "low").length,
      },
      byCategory: {} as Record<string, number>,
      totalClicks: 0,
      totalRevenue: 0,
      thisWeekRequests: 0,
      thisWeekApprovals: 0,
    };

    // Count by category
    programs.forEach((p) => {
      stats.byCategory[p.category] = (stats.byCategory[p.category] || 0) + 1;
    });

    // Calculate totals
    programs.forEach((p) => {
      stats.totalClicks += parseInt(p.totalClicks || "0", 10);
      stats.totalRevenue += parseFloat(p.estimatedRevenue || "0");
    });

    // This week requests and approvals
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    programs.forEach((p) => {
      if (p.requestDate && new Date(p.requestDate) >= weekAgo) {
        stats.thisWeekRequests++;
      }
      if (p.approvalDate && new Date(p.approvalDate) >= weekAgo) {
        stats.thisWeekApprovals++;
      }
    });

    sendSuccess(res, stats);
  } catch (error) {
    next(error);
  }
}

