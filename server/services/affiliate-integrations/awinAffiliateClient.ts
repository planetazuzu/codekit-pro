/**
 * Awin Affiliate Integration Client
 * Real API implementation with fallback to mock data
 */

import { logger } from "../../utils/logger";

interface AwinConversion {
  id: string;
  date: string;
  amount: number;
  status: string;
}

interface AwinClick {
  id: string;
  date: string;
  url: string;
}

interface AwinStats {
  totalClicks: number;
  totalConversions: number;
  estimatedRevenue: number;
  lastSync: string;
}

interface AwinApiResponse<T> {
  data?: T;
  errors?: Array<{ message: string; code: string }>;
}

export class AwinAffiliateClient {
  private apiKey: string;
  private apiSecret: string;
  private publisherId?: string;
  private baseUrl = "https://api.awin.com";
  private useMockData: boolean;

  constructor(config: { apiKey: string; apiSecret: string; publisherId?: string }) {
    this.apiKey = config.apiKey;
    this.apiSecret = config.apiSecret;
    this.publisherId = config.publisherId;
    // Use mock data if credentials are missing or appear to be placeholders
    this.useMockData = !this.apiKey || !this.apiSecret || 
                       this.apiKey.includes("placeholder") || 
                       this.apiSecret.includes("placeholder");
  }

  /**
   * Generate OAuth token for Awin API (simplified - may need adjustment based on Awin's auth method)
   */
  private async getAuthToken(): Promise<string> {
    // Awin uses OAuth 2.0 - this is a simplified implementation
    // You may need to adjust based on Awin's specific OAuth flow
    try {
      const response = await fetch(`${this.baseUrl}/auth/token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          grant_type: "client_credentials",
          client_id: this.apiKey,
          client_secret: this.apiSecret,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to get Awin auth token: ${response.statusText}`);
      }

      const data = await response.json();
      return data.access_token;
    } catch (error: any) {
      logger.error(`[Awin] Failed to get auth token:`, error);
      throw error;
    }
  }

  /**
   * Make authenticated request to Awin API
   */
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    if (this.useMockData) {
      logger.warn(`[Awin] Using mock data - credentials not configured`);
      throw new Error("MOCK_DATA_REQUIRED");
    }

    try {
      // Get auth token
      const token = await this.getAuthToken();
      const url = `${this.baseUrl}${endpoint}`;
      
      const response = await fetch(url, {
        ...options,
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
          ...options.headers,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        logger.error(`[Awin] API error ${response.status}: ${errorText}`);
        throw new Error(`Awin API error: ${response.status} ${response.statusText}`);
      }

      const data: AwinApiResponse<T> = await response.json();
      
      if (data.errors && data.errors.length > 0) {
        const errorMessages = data.errors.map(e => e.message).join(", ");
        logger.error(`[Awin] API errors: ${errorMessages}`);
        throw new Error(`Awin API errors: ${errorMessages}`);
      }

      return data.data as T;
    } catch (error: any) {
      if (error.message === "MOCK_DATA_REQUIRED") {
        throw error;
      }
      logger.error(`[Awin] Request failed:`, error);
      throw new Error(`Failed to fetch from Awin API: ${error.message}`);
    }
  }

  /**
   * Fetch conversions for an affiliate program
   */
  async fetchConversions(affiliateId: string): Promise<AwinConversion[]> {
    try {
      const publisherId = this.publisherId || affiliateId;
      // Awin API endpoint for transactions/conversions
      const transactions = await this.makeRequest<AwinConversion[]>(
        `/publishers/${publisherId}/transactions?startDate=${this.getStartDate()}&endDate=${this.getEndDate()}`
      );
      
      logger.info(`[Awin] Fetched ${transactions?.length || 0} conversions for ${publisherId}`);
      return transactions || [];
    } catch (error: any) {
      if (error.message === "MOCK_DATA_REQUIRED") {
        // Fallback to mock data
        logger.warn(`[Awin] Using mock conversions data`);
        return [
          {
            id: `conv-${Date.now()}`,
            date: new Date().toISOString(),
            amount: 20.00,
            status: "approved",
          },
        ];
      }
      logger.error(`[Awin] Failed to fetch conversions:`, error);
      return [];
    }
  }

  /**
   * Fetch clicks for an affiliate program
   */
  async fetchClicks(affiliateId: string): Promise<AwinClick[]> {
    try {
      const publisherId = this.publisherId || affiliateId;
      // Awin API endpoint for clicks
      const clicks = await this.makeRequest<AwinClick[]>(
        `/publishers/${publisherId}/clicks?startDate=${this.getStartDate()}&endDate=${this.getEndDate()}`
      );
      
      logger.info(`[Awin] Fetched ${clicks?.length || 0} clicks for ${publisherId}`);
      return clicks || [];
    } catch (error: any) {
      if (error.message === "MOCK_DATA_REQUIRED") {
        // Fallback to mock data
        logger.warn(`[Awin] Using mock clicks data`);
        return [
          {
            id: `click-${Date.now()}`,
            date: new Date().toISOString(),
            url: "https://example.com",
          },
        ];
      }
      logger.error(`[Awin] Failed to fetch clicks:`, error);
      return [];
    }
  }

  /**
   * Fetch estimated revenue
   */
  async fetchEstimatedRevenue(affiliateId: string): Promise<number> {
    try {
      // Calculate revenue from conversions/transactions
      const conversions = await this.fetchConversions(affiliateId);
      const totalRevenue = conversions.reduce((sum, conv) => {
        return sum + (conv.amount || 0);
      }, 0);
      
      logger.info(`[Awin] Calculated revenue ${totalRevenue} for ${affiliateId}`);
      return totalRevenue;
    } catch (error: any) {
      if (error.message === "MOCK_DATA_REQUIRED") {
        // Fallback to mock data
        logger.warn(`[Awin] Using mock revenue data`);
        return 100.50;
      }
      logger.error(`[Awin] Failed to fetch revenue:`, error);
      return 0;
    }
  }

  /**
   * Get comprehensive stats
   */
  async getStats(affiliateId: string): Promise<AwinStats> {
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
      logger.error(`[Awin] Failed to get stats:`, error);
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

