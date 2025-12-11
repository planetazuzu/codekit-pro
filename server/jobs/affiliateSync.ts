/**
 * Affiliate Sync Job
 * Synchronizes affiliate program data from external APIs
 */

import { storage } from "../storage/index";
import { getAffiliateClient } from "../services/affiliate-integrations";
import type { AffiliateProgram } from "@shared/schema";
import { logger } from "../utils/logger";

interface SyncResult {
  programId: string;
  success: boolean;
  clicks?: number;
  revenue?: number;
  error?: string;
}

/**
 * Sync a single affiliate program
 */
export async function syncAffiliateProgram(program: AffiliateProgram): Promise<SyncResult> {
  const result: SyncResult = {
    programId: program.id,
    success: false,
  };

  try {
    // Skip manual programs
    if (program.integrationType === "manual") {
      result.success = true;
      return result;
    }

    // Parse and decrypt integration config
    let config: Record<string, string> = {};
    if (program.integrationConfig) {
      try {
        const { decrypt, isEncrypted } = await import("../utils/encryption");
        // Decrypt if encrypted, otherwise use as-is (backward compatibility)
        const decryptedConfig = isEncrypted(program.integrationConfig)
          ? decrypt(program.integrationConfig)
          : program.integrationConfig;
        config = JSON.parse(decryptedConfig);
      } catch (e) {
        logger.warn(`Invalid integration config for program ${program.id}`);
        result.error = "Invalid integration config";
        return result;
      }
    } else {
      // No config provided
      result.error = "No integration config provided";
      return result;
    }

    // Get the appropriate client
    const client = getAffiliateClient(program.integrationType, config);
    if (!client) {
      result.error = `No client available for integration type: ${program.integrationType}`;
      return result;
    }

    // Fetch stats
    const stats = await client.getStats(program.id);

    // Update the program
    await storage.updateAffiliateProgram({
      id: program.id,
      totalClicks: stats.totalClicks.toString(),
      estimatedRevenue: stats.estimatedRevenue.toString(),
      lastSyncAt: new Date(),
    });

    result.success = true;
    result.clicks = stats.totalClicks;
    result.revenue = stats.estimatedRevenue;

    logger.info(`Synced affiliate program ${program.name}: ${stats.totalClicks} clicks, $${stats.estimatedRevenue} revenue`);
  } catch (error: any) {
    logger.error(`Error syncing affiliate program ${program.id}:`, error);
    result.error = error.message || "Unknown error";
  }

  return result;
}

/**
 * Sync all affiliate programs with integrations
 */
export async function syncAllAffiliatePrograms(): Promise<SyncResult[]> {
  const programs = await storage.getAffiliatePrograms();
  const programsToSync = programs.filter(
    (p) => p.integrationType && p.integrationType !== "manual"
  );

  logger.info(`Starting sync for ${programsToSync.length} affiliate programs`);

  const results: SyncResult[] = [];
  for (const program of programsToSync) {
    const result = await syncAffiliateProgram(program);
    results.push(result);
    // Small delay to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  const successCount = results.filter((r) => r.success).length;
  logger.info(`Sync completed: ${successCount}/${results.length} programs synced successfully`);

  return results;
}

