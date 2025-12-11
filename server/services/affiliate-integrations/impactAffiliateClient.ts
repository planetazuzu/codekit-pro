/**
 * Impact.com Affiliate Integration Client
 * Real API implementation with fallback to mock data
 */

import { logger } from "../../utils/logger";

interface ImpactConversion {
  id: string;
  date: string;
  amount: number;
  status: string;
}

interface ImpactClick {
  id: string;
  date: string;
  url: string;
}

interface ImpactStats {
  totalClicks: number;
  totalConversions: number;
  estimatedRevenue: number;
  lastSync: string;
}

interface ImpactApiResponse<T> {
  data?: T;
  errors?: Array<{ message: string; code: string }>;
}

export class ImpactAffiliateClient {
  private apiKey: string;
  private apiSecret: string;
  private baseUrl = "https://api.impact.com";
  private useMockData: boolean;

  constructor(config: { apiKey: string; apiSecret: string }) {
    this.apiKey = config.apiKey;
    this.apiSecret = config.apiSecret;
    // Use mock data if credentials are missing or appear to be placeholders
    this.useMockData = !this.apiKey || !this.apiSecret || 
                       this.apiKey.includes("placeholder") || 
                       this.apiSecret.includes("placeholder");
  }

  /**
   * Make authenticated request to Impact API
   */
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    if (this.useMockData) {
      logger.warn(`[Impact] Using mock data - credentials not configured`);
      throw new Error("MOCK_DATA_REQUIRED");
    }

    try {
      const url = `${this.baseUrl}${endpoint}`;
      const response = await fetch(url, {
        ...options,
        headers: {
          "Authorization": `Bearer ${this.apiKey}`,
          "X-API-Secret": this.apiSecret,
          "Content-Type": "application/json",
          ...options.headers,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        logger.error(`[Impact] API error ${response.status}: ${errorText}`);
        throw new Error(`Impact API error: ${response.status} ${response.statusText}`);
      }

      const data: ImpactApiResponse<T> = await response.json();
      
      if (data.errors && data.errors.length > 0) {
        const errorMessages = data.errors.map(e => e.message).join(", ");
        logger.error(`[Impact] API errors: ${errorMessages}`);
        throw new Error(`Impact API errors: ${errorMessages}`);
      }

      return data.data as T;
    } catch (error: any) {
      if (error.message === "MOCK_DATA_REQUIRED") {
        throw error;
      }
      logger.error(`[Impact] Request failed:`, error);
      throw new Error(`Failed to fetch from Impact API: ${error.message}`);
    }
  }

  /**
   * Fetch conversions for an affiliate program
   */
  async fetchConversions(affiliateId: string): Promise<ImpactConversion[]> {
    try {
      // Impact API endpoint for conversions
      // Note: Actual endpoint may vary based on Impact API version
      const conversions = await this.makeRequest<ImpactConversion[]>(
        `/Brands/Conversions?advertiserId=${affiliateId}&startDate=${this.getStartDate()}&endDate=${this.getEndDate()}`
      );
      
      logger.info(`[Impact] Fetched ${conversions?.length || 0} conversions for ${affiliateId}`);
      return conversions || [];
    } catch (error: any) {
      if (error.message === "MOCK_DATA_REQUIRED") {
        // Fallback to mock data
        logger.warn(`[Impact] Using mock conversions data`);
        return [
          {
            id: `conv-${Date.now()}`,
            date: new Date().toISOString(),
            amount: 25.50,
            status: "approved",
          },
        ];
      }
      logger.error(`[Impact] Failed to fetch conversions:`, error);
      return [];
    }
  }

  /**
   * Fetch clicks for an affiliate program
   */
  async fetchClicks(affiliateId: string): Promise<ImpactClick[]> {
    try {
      // Impact API endpoint for clicks
      const clicks = await this.makeRequest<ImpactClick[]>(
        `/Brands/Clicks?advertiserId=${affiliateId}&startDate=${this.getStartDate()}&endDate=${this.getEndDate()}`
      );
      
      logger.info(`[Impact] Fetched ${clicks?.length || 0} clicks for ${affiliateId}`);
      return clicks || [];
    } catch (error: any) {
      if (error.message === "MOCK_DATA_REQUIRED") {
        // Fallback to mock data
        logger.warn(`[Impact] Using mock clicks data`);
        return [
          {
            id: `click-${Date.now()}`,
            date: new Date().toISOString(),
            url: "https://example.com",
          },
        ];
      }
      logger.error(`[Impact] Failed to fetch clicks:`, error);
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
      
      logger.info(`[Impact] Calculated revenue ${totalRevenue} for ${affiliateId}`);
      return totalRevenue;
    } catch (error: any) {
      if (error.message === "MOCK_DATA_REQUIRED") {
        // Fallback to mock data
        logger.warn(`[Impact] Using mock revenue data`);
        return 125.75;
      }
      logger.error(`[Impact] Failed to fetch revenue:`, error);
      return 0;
    }
  }

  /**
   * Get comprehensive stats
   */
  async getStats(affiliateId: string): Promise<ImpactStats> {
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
      logger.error(`[Impact] Failed to get stats:`, error);
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

