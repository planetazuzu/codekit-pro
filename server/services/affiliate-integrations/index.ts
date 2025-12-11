/**
 * Affiliate Integration Services
 * Centralized export for all integration clients
 */

export { ImpactAffiliateClient } from "./impactAffiliateClient";
export { PartnerStackAffiliateClient } from "./partnerStackAffiliateClient";
export { AwinAffiliateClient } from "./awinAffiliateClient";

/**
 * Get the appropriate client based on integration type
 */
export function getAffiliateClient(
  integrationType: string,
  config: Record<string, string>
) {
  switch (integrationType) {
    case "impact":
      if (!config.apiKey || !config.apiSecret) return null;
      return new (require("./impactAffiliateClient").ImpactAffiliateClient)({
        apiKey: config.apiKey,
        apiSecret: config.apiSecret,
      });
    case "partnerstack":
      if (!config.apiKey) return null;
      return new (require("./partnerStackAffiliateClient").PartnerStackAffiliateClient)({
        apiKey: config.apiKey,
      });
    case "awin":
      if (!config.apiKey || !config.apiSecret) return null;
      return new (require("./awinAffiliateClient").AwinAffiliateClient)({
        apiKey: config.apiKey,
        apiSecret: config.apiSecret,
      });
    default:
      return null;
  }
}

