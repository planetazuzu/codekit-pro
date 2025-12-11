/**
 * PartnerStack Affiliate Integration Client
 * Real API implementation with fallback to mock data
 */

import { logger } from "../../utils/logger";

interface PartnerStackConversion {
  id: string;
  date: string;
  amount: number;
  status: string;
}

interface PartnerStackClick {
  id: string;
  date: string;
  url: string;
}

interface PartnerStackStats {
  totalClicks: number;
  totalConversions: number;
  estimatedRevenue: number;
  lastSync: string;
}

interface PartnerStackApiResponse<T> {
  data?: T;
  errors?: Array<{ message: string; code: string }>;
}

export class PartnerStackAffiliateClient {
  private apiKey: string;
  private baseUrl = "https://api.partnerstack.com/v2";
  private useMockData: boolean;

  constructor(config: { apiKey: string }) {
    this.apiKey = config.apiKey;
    // Use mock data if credentials are missing or appear to be placeholders
    this.useMockData = !this.apiKey || this.apiKey.includes("placeholder");
  }

  /**
   * Make authenticated request to PartnerStack API
   */
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    if (this.useMockData) {
      logger.warn(`[PartnerStack] Using mock data - credentials not configured`);
      throw new Error("MOCK_DATA_REQUIRED");
    }

    try {
      const url = `${this.baseUrl}${endpoint}`;
      const response = await fetch(url, {
        ...options,
        headers: {
          "Authorization": `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
          ...options.headers,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        logger.error(`[PartnerStack] API error ${response.status}: ${errorText}`);
        throw new Error(`PartnerStack API error: ${response.status} ${response.statusText}`);
      }

      const data: PartnerStackApiResponse<T> = await response.json();
      
      if (data.errors && data.errors.length > 0) {
        const errorMessages = data.errors.map(e => e.message).join(", ");
        logger.error(`[PartnerStack] API errors: ${errorMessages}`);
        throw new Error(`PartnerStack API errors: ${errorMessages}`);
      }

      return data.data as T;
    } catch (error: any) {
      if (error.message === "MOCK_DATA_REQUIRED") {
        throw error;
      }
      logger.error(`[PartnerStack] Request failed:`, error);
      throw new Error(`Failed to fetch from PartnerStack API: ${error.message}`);
    }
  }

  /**
   * Fetch conversions for an affiliate program
   */
  async fetchConversions(affiliateId: string): Promise<PartnerStackConversion[]> {
    try {
      // PartnerStack API endpoint for conversions
      const conversions = await this.makeRequest<PartnerStackConversion[]>(
        `/conversions?partner_id=${affiliateId}&start_date=${this.getStartDate()}&end_date=${this.getEndDate()}`
      );
      
      logger.info(`[PartnerStack] Fetched ${conversions?.length || 0} conversions for ${affiliateId}`);
      return conversions || [];
    } catch (error: any) {
      if (error.message === "MOCK_DATA_REQUIRED") {
        // Fallback to mock data
        logger.warn(`[PartnerStack] Using mock conversions data`);
        return [
          {
            id: `conv-${Date.now()}`,
            date: new Date().toISOString(),
            amount: 30.00,
            status: "approved",
          },
        ];
      }
      logger.error(`[PartnerStack] Failed to fetch conversions:`, error);
      return [];
    }
  }

  /**
   * Fetch clicks for an affiliate program
   */
  async fetchClicks(affiliateId: string): Promise<PartnerStackClick[]> {
    try {
      // PartnerStack API endpoint for clicks
      const clicks = await this.makeRequest<PartnerStackClick[]>(
        `/clicks?partner_id=${affiliateId}&start_date=${this.getStartDate()}&end_date=${this.getEndDate()}`
      );
      
      logger.info(`[PartnerStack] Fetched ${clicks?.length || 0} clicks for ${affiliateId}`);
      return clicks || [];
    } catch (error: any) {
      if (error.message === "MOCK_DATA_REQUIRED") {
        // Fallback to mock data
        logger.warn(`[PartnerStack] Using mock clicks data`);
        return [
          {
            id: `click-${Date.now()}`,
            date: new Date().toISOString(),
            url: "https://example.com",
          },
        ];
      }
      logger.error(`[PartnerStack] Failed to fetch clicks:`, error);
      return [];
    }
  }

  /**
   * Fetch estimated revenue
   */
  async fetchEstimatedRevenue(affiliateId: string): Promise<number> {
    try {
      // Calculate revenue from conversions
      const conversions = await this.fetchConversions(affiliateId);
      const totalRevenue = conversions.reduce((sum, conv) => {
        return sum + (conv.amount || 0);
      }, 0);
      
      logger.info(`[PartnerStack] Calculated revenue ${totalRevenue} for ${affiliateId}`);
      return totalRevenue;
    } catch (error: any) {
      if (error.message === "MOCK_DATA_REQUIRED") {
        // Fallback to mock data
        logger.warn(`[PartnerStack] Using mock revenue data`);
        return 150.25;
      }
      logger.error(`[PartnerStack] Failed to fetch revenue:`, error);
      return 0;
    }
  }

  /**
   * Get comprehensive stats
   */
  async getStats(affiliateId: string): Promise<PartnerStackStats> {
    try {
      const [clicks, conversions, revenue] = await Promise.all([
        this.fetchClicks(affiliateId),
        this.fetchConversions(affiliateId),
        this.fetchEstimatedRevenue(affiliateId),
      ]);

      return {
        totalClicks: clicks.length,
        totalConversions: conversions.length,
        estimatedRevenue: revenue,
        lastSync: new Date().toISOString(),
      };
    } catch (error: any) {
      logger.error(`[PartnerStack] Failed to get stats:`, error);
      // Return empty stats on error
      return {
        totalClicks: 0,
        totalConversions: 0,
        estimatedRevenue: 0,
        lastSync: new Date().toISOString(),
      };
    }
  }

  /**
   * Get start date for API queries (last 30 days)
   */
  private getStartDate(): string {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString().split("T")[0];
  }

  /**
   * Get end date for API queries (today)
   */
  private getEndDate(): string {
    return new Date().toISOString().split("T")[0];
  }
}

