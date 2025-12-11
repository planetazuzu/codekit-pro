/**
 * Affiliate Alerts Service
 * Handles alerts and notifications for affiliate programs
 */

import { storage } from "../storage/index";
import { logger } from "../utils/logger";
import { getPlan } from "../config/plans";

export interface Alert {
  id: string;
  type: "warning" | "error" | "info" | "success";
  title: string;
  message: string;
  programId?: string;
  programName?: string;
  createdAt: Date;
  acknowledged: boolean;
}

export type AlertType =
  | "revenue_drop"
  | "click_drop"
  | "sync_failed"
  | "program_inactive"
  | "approval_needed"
  | "low_conversion_rate"
  | "high_performance"
  | "subscription_expiring";

/**
 * Check for alerts and generate them
 */
export async function checkAlerts(): Promise<Alert[]> {
  const alerts: Alert[] = [];
  
  try {
    const programs = await storage.getAffiliatePrograms();
    const clicks = await storage.getAffiliateClicks();
    
    // Check each program for issues
    for (const program of programs) {
      // Check if sync failed (last sync was more than 7 days ago for automated programs)
      if (program.integrationType !== "manual" && program.lastSyncAt) {
        const daysSinceSync = Math.floor(
          (Date.now() - new Date(program.lastSyncAt).getTime()) / (1000 * 60 * 60 * 24)
        );
        
        if (daysSinceSync > 7) {
          alerts.push({
            id: `sync_failed_${program.id}`,
            type: "error",
            title: "Sincronización fallida",
            message: `El programa "${program.name}" no se ha sincronizado en ${daysSinceSync} días. Revisa la configuración de integración.`,
            programId: program.id,
            programName: program.name,
            createdAt: new Date(),
            acknowledged: false,
          });
        }
      }

      // Check if program is inactive but has potential
      if (program.status === "inactive" && parseFloat(program.estimatedRevenue || "0") > 0) {
        alerts.push({
          id: `program_inactive_${program.id}`,
          type: "warning",
          title: "Programa inactivo con potencial",
          message: `El programa "${program.name}" está marcado como inactivo pero tiene ingresos estimados. Considera reactivarlo.`,
          programId: program.id,
          programName: program.name,
          createdAt: new Date(),
          acknowledged: false,
        });
      }

      // Check if approval is needed
      if (program.status === "pending" && program.requestDate) {
        const daysPending = Math.floor(
          (Date.now() - new Date(program.requestDate).getTime()) / (1000 * 60 * 60 * 24)
        );
        
        if (daysPending > 14) {
          alerts.push({
            id: `approval_needed_${program.id}`,
            type: "warning",
            title: "Aprobación pendiente",
            message: `El programa "${program.name}" lleva ${daysPending} días esperando aprobación.`,
            programId: program.id,
            programName: program.name,
            createdAt: new Date(),
            acknowledged: false,
          });
        }
      }

      // Check conversion rate (if we have conversion data)
      const programClicks = parseFloat(program.totalClicks?.toString() || "0");
      const conversions = parseInt(program.totalConversions?.toString() || "0", 10);
      
      if (programClicks > 100) {
        const conversionRate = (conversions / programClicks) * 100;
        
        if (conversionRate < 1) {
          alerts.push({
            id: `low_conversion_${program.id}`,
            type: "warning",
            title: "Tasa de conversión baja",
            message: `El programa "${program.name}" tiene una tasa de conversión del ${conversionRate.toFixed(2)}%. Considera optimizar la estrategia.`,
            programId: program.id,
            programName: program.name,
            createdAt: new Date(),
            acknowledged: false,
          });
        } else if (conversionRate > 10) {
          alerts.push({
            id: `high_performance_${program.id}`,
            type: "success",
            title: "Alto rendimiento",
            message: `El programa "${program.name}" tiene una excelente tasa de conversión del ${conversionRate.toFixed(2)}%. ¡Sigue así!`,
            programId: program.id,
            programName: program.name,
            createdAt: new Date(),
            acknowledged: false,
          });
        }
      }
    }

    // Check for revenue drops (compare last 7 days vs previous 7 days)
    const recentClicks = clicks.filter((c) => {
      const clickDate = new Date(c.timestamp);
      const daysAgo = Math.floor((Date.now() - clickDate.getTime()) / (1000 * 60 * 60 * 24));
      return daysAgo <= 7;
    });

    const previousClicks = clicks.filter((c) => {
      const clickDate = new Date(c.timestamp);
      const daysAgo = Math.floor((Date.now() - clickDate.getTime()) / (1000 * 60 * 60 * 24));
      return daysAgo > 7 && daysAgo <= 14;
    });

    if (previousClicks.length > 0 && recentClicks.length < previousClicks.length * 0.7) {
      const dropPercentage = ((previousClicks.length - recentClicks.length) / previousClicks.length) * 100;
      alerts.push({
        id: "revenue_drop_global",
        type: "error",
        title: "Caída significativa de clics",
        message: `Los clics han disminuido un ${dropPercentage.toFixed(1)}% en los últimos 7 días comparado con el período anterior.`,
        createdAt: new Date(),
        acknowledged: false,
      });
    }

    logger.info(`Generated ${alerts.length} affiliate alerts`);
    return alerts;
  } catch (error) {
    logger.error("Error checking alerts:", error);
    return alerts;
  }
}

/**
 * Get alerts for display
 */
export async function getAlerts(acknowledged: boolean = false): Promise<Alert[]> {
  // In a real implementation, alerts would be stored in the database
  // For now, we'll generate them on the fly
  const allAlerts = await checkAlerts();
  return allAlerts.filter((alert) => alert.acknowledged === acknowledged);
}

/**
 * Acknowledge an alert
 */
export async function acknowledgeAlert(alertId: string): Promise<void> {
  // In a real implementation, this would update the database
  logger.info(`Alert acknowledged: ${alertId}`);
}


