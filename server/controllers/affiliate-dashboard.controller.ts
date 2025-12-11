/**
 * Affiliate Dashboard Controller
 * Advanced revenue dashboard with projections and analytics
 */

import type { Request, Response, NextFunction } from "express";
import { storage } from "../storage/index";
import { sendSuccess, sendError } from "../utils/response";
import { logger } from "../utils/logger";

/**
 * Get comprehensive revenue dashboard data
 * GET /api/affiliates/dashboard
 */
export async function getRevenueDashboard(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { days = 30 } = req.query;
    const daysNumber = parseInt(days as string, 10) || 30;

    // Get all affiliate programs
    const programs = await storage.getAffiliatePrograms();
    
    // Get all affiliate clicks
    const allClicks = await storage.getAffiliateClicks(undefined, daysNumber);
    
    // Get all affiliates
    const affiliates = await storage.getAffiliates();

    // Calculate total clicks
    const totalClicks = allClicks.length;

    // Calculate estimated revenue (sum of estimated revenue from programs)
    const totalEstimatedRevenue = programs.reduce((sum, program) => {
      return sum + (parseFloat(program.estimatedRevenue || "0") || 0);
    }, 0);

    // Calculate revenue by category
    const revenueByCategory = programs.reduce((acc, program) => {
      const category = program.category || "Other";
      const revenue = parseFloat(program.estimatedRevenue || "0") || 0;
      acc[category] = (acc[category] || 0) + revenue;
      return acc;
    }, {} as Record<string, number>);

    // Calculate clicks by day
    const clicksByDay: Record<string, number> = {};
    allClicks.forEach((click) => {
      const date = new Date(click.timestamp).toISOString().split("T")[0];
      clicksByDay[date] = (clicksByDay[date] || 0) + 1;
    });

    // Convert to array format
    const clicksByDayArray = Object.entries(clicksByDay)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Calculate revenue by program
    const revenueByProgram = programs
      .map((program) => ({
        programId: program.id,
        programName: program.name,
        category: program.category,
        estimatedRevenue: parseFloat(program.estimatedRevenue || "0") || 0,
        totalClicks: parseFloat(program.totalClicks || "0") || 0,
      }))
      .filter((p) => p.estimatedRevenue > 0 || p.totalClicks > 0)
      .sort((a, b) => b.estimatedRevenue - a.estimatedRevenue);

    // Calculate revenue by category (pie chart data)
    const revenueByCategoryArray = Object.entries(revenueByCategory)
      .map(([category, revenue]) => ({
        category,
        revenue,
        percentage: totalEstimatedRevenue > 0 
          ? (revenue / totalEstimatedRevenue) * 100 
          : 0,
      }))
      .sort((a, b) => b.revenue - a.revenue);

    // Calculate revenue projection
    const dailyAverage = totalEstimatedRevenue / daysNumber;
    const monthlyProjection = dailyAverage * 30;
    const quarterlyProjection = dailyAverage * 90;

    // Get top affiliates (by revenue or clicks)
    const topAffiliates = affiliates
      .map((affiliate) => {
        const affiliateClicks = allClicks.filter((c) => c.affiliateId === affiliate.id);
        return {
          id: affiliate.id,
          name: affiliate.name,
          category: affiliate.category,
          totalClicks: affiliateClicks.length,
          // Estimate revenue based on commission if available
          estimatedRevenue: 0, // Would need to calculate based on commission rate
        };
      })
      .sort((a, b) => b.totalClicks - a.totalClicks)
      .slice(0, 10);

    // Calculate conversion rate (if we had conversion data)
    const totalConversions = programs.reduce((sum, p) => {
      return sum + (parseInt(p.totalConversions || "0", 10) || 0);
    }, 0);
    const conversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;

    sendSuccess(res, {
      summary: {
        totalClicks,
        totalEstimatedRevenue,
        totalConversions,
        conversionRate: parseFloat(conversionRate.toFixed(2)),
        activePrograms: programs.filter((p) => p.status === "approved").length,
        totalPrograms: programs.length,
      },
      projections: {
        dailyAverage: parseFloat(dailyAverage.toFixed(2)),
        monthlyProjection: parseFloat(monthlyProjection.toFixed(2)),
        quarterlyProjection: parseFloat(quarterlyProjection.toFixed(2)),
        disclaimer: "Projections are based on the last " + daysNumber + " days of data. Actual revenue may vary.",
      },
      charts: {
        clicksByDay: clicksByDayArray,
        revenueByProgram: revenueByProgram.slice(0, 10), // Top 10
        revenueByCategory: revenueByCategoryArray,
      },
      topAffiliates,
      timeRange: {
        days: daysNumber,
        startDate: new Date(Date.now() - daysNumber * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date().toISOString(),
      },
    });
  } catch (error) {
    logger.error("Error getting revenue dashboard:", error);
    next(error);
  }
}

/**
 * Get detailed analytics for a specific affiliate program
 * GET /api/affiliates/dashboard/program/:id
 */
export async function getProgramAnalytics(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const { days = 30 } = req.query;
    const daysNumber = parseInt(days as string, 10) || 30;

    const program = await storage.getAffiliateProgram(id);
    
    if (!program) {
      sendError(res, "Affiliate program not found", 404, "NOT_FOUND");
      return;
    }

    // Get clicks for this program's affiliates
    const affiliates = await storage.getAffiliates();
    const programAffiliates = affiliates.filter((a) => 
      a.category === program.category || a.name.toLowerCase().includes(program.name.toLowerCase())
    );

    const affiliateIds = programAffiliates.map((a) => a.id);
    const clicks = await storage.getAffiliateClicks(undefined, daysNumber);
    const programClicks = clicks.filter((c) => affiliateIds.includes(c.affiliateId));

    // Calculate metrics
    const totalClicks = programClicks.length;
    const estimatedRevenue = parseFloat(program.estimatedRevenue || "0") || 0;
    const totalConversions = parseInt(program.totalConversions || "0", 10) || 0;
    const conversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;

    // Clicks by day
    const clicksByDay: Record<string, number> = {};
    programClicks.forEach((click) => {
      const date = new Date(click.timestamp).toISOString().split("T")[0];
      clicksByDay[date] = (clicksByDay[date] || 0) + 1;
    });

    const clicksByDayArray = Object.entries(clicksByDay)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    sendSuccess(res, {
      program: {
        id: program.id,
        name: program.name,
        category: program.category,
        status: program.status,
      },
      metrics: {
        totalClicks,
        estimatedRevenue: parseFloat(estimatedRevenue.toFixed(2)),
        totalConversions,
        conversionRate: parseFloat(conversionRate.toFixed(2)),
        averageClicksPerDay: parseFloat((totalClicks / daysNumber).toFixed(2)),
      },
      clicksByDay: clicksByDayArray,
      lastSync: program.lastSyncDate,
    });
  } catch (error) {
    logger.error("Error getting program analytics:", error);
    next(error);
  }
}


