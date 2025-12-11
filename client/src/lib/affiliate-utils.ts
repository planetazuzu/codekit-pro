/**
 * Affiliate utilities for auto-insertion and link management
 */

import type { Affiliate } from "@shared/schema";

// Keyword to affiliate category mapping
const KEYWORD_AFFILIATE_MAP: Record<string, string[]> = {
  // Hosting
  hosting: ["Hostinger", "DigitalOcean", "Vercel"],
  host: ["Hostinger", "DigitalOcean"],
  servidor: ["Hostinger", "DigitalOcean"],
  server: ["Hostinger", "DigitalOcean"],
  
  // Deployment
  deploy: ["Vercel", "Netlify", "Railway"],
  desplegar: ["Vercel", "Netlify"],
  despliegue: ["Vercel", "Netlify"],
  
  // Cloud
  cloud: ["DigitalOcean", "Vercel"],
  nube: ["DigitalOcean"],
  
  // UI/Design
  ui: ["TailwindUI", "Canva"],
  tailwind: ["TailwindUI"],
  diseño: ["Canva", "TailwindUI"],
  design: ["Canva", "TailwindUI"],
  
  // AI
  ia: ["GitHub Copilot", "Jasper AI"],
  ai: ["GitHub Copilot", "Jasper AI"],
  copilot: ["GitHub Copilot"],
  gpt: ["Jasper AI"],
  
  // Productivity
  notas: ["Notion"],
  notes: ["Notion"],
  organización: ["Notion"],
  productividad: ["Notion"],
  
  // Development
  código: ["Replit", "GitHub Copilot"],
  code: ["Replit", "GitHub Copilot"],
  programar: ["Replit"],
  terminal: ["Replit"],
};

/**
 * Find matching affiliates based on text content
 */
export function findMatchingAffiliates(
  text: string,
  affiliates: Affiliate[],
  limit: number = 3
): Affiliate[] {
  const textLower = text.toLowerCase();
  const matchedNames = new Set<string>();

  // Find all matching affiliate names from keywords
  Object.entries(KEYWORD_AFFILIATE_MAP).forEach(([keyword, names]) => {
    if (textLower.includes(keyword)) {
      names.forEach((name) => matchedNames.add(name));
    }
  });

  // Filter and return matching affiliates
  return affiliates
    .filter((a) => matchedNames.has(a.name))
    .slice(0, limit);
}

/**
 * Inject affiliate links into text content
 * Replaces keywords with linked versions
 */
export function injectAffiliateLinks(
  text: string,
  affiliates: Affiliate[],
  format: "html" | "markdown" = "html"
): string {
  if (!affiliates.length) return text;

  let result = text;

  // Create affiliate lookup by name
  const affiliateByName = new Map(affiliates.map((a) => [a.name.toLowerCase(), a]));

  // Process each keyword mapping
  Object.entries(KEYWORD_AFFILIATE_MAP).forEach(([keyword, affiliateNames]) => {
    // Find first matching affiliate for this keyword
    const matchingAffiliate = affiliateNames
      .map((name) => affiliateByName.get(name.toLowerCase()))
      .find((a) => a !== undefined);

    if (!matchingAffiliate) return;

    // Build the link
    const shortlink = `/go/${matchingAffiliate.name.toLowerCase().replace(/\s+/g, "-")}`;
    
    // Replace keyword occurrences (case insensitive, word boundaries)
    const regex = new RegExp(`\\b(${keyword})\\b`, "gi");
    
    if (format === "html") {
      result = result.replace(
        regex,
        `<a href="${shortlink}" target="_blank" rel="noopener" class="affiliate-link">$1</a>`
      );
    } else {
      result = result.replace(regex, `[$1](${shortlink})`);
    }
  });

  return result;
}

/**
 * Generate a shortlink for an affiliate
 */
export function getAffiliateShortlink(affiliate: Affiliate): string {
  const slug = affiliate.name.toLowerCase().replace(/\s+/g, "-");
  return `/go/${slug}`;
}

/**
 * Build the final affiliate URL with UTM parameters
 */
export function buildAffiliateUrl(
  affiliate: Affiliate,
  source: string = "codekit",
  medium: string = "app",
  campaign: string = "affiliate"
): string {
  let finalUrl = affiliate.url;
  
  if (affiliate.utm) {
    const separator = affiliate.url.includes("?") ? "&" : "?";
    finalUrl = `${affiliate.url}${separator}${affiliate.utm.replace(/^\?/, "")}`;
  } else {
    const separator = affiliate.url.includes("?") ? "&" : "?";
    finalUrl = `${affiliate.url}${separator}utm_source=${source}&utm_medium=${medium}&utm_campaign=${campaign}`;
  }
  
  return finalUrl;
}

/**
 * Get affiliate category color
 */
export function getAffiliateCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    Hosting: "text-blue-400 bg-blue-400/10",
    Deployment: "text-green-400 bg-green-400/10",
    Cloud: "text-cyan-400 bg-cyan-400/10",
    IA: "text-purple-400 bg-purple-400/10",
    "IA & DevTools": "text-violet-400 bg-violet-400/10",
    "UI Kits": "text-pink-400 bg-pink-400/10",
    Productividad: "text-yellow-400 bg-yellow-400/10",
    Diseño: "text-orange-400 bg-orange-400/10",
    Educación: "text-teal-400 bg-teal-400/10",
    Desarrollo: "text-indigo-400 bg-indigo-400/10",
  };
  
  return colors[category] || "text-gray-400 bg-gray-400/10";
}

