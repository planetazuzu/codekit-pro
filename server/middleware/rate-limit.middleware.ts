/**
 * Rate Limiting Middleware
 * Protects API endpoints from abuse and DDoS attacks
 */

import rateLimit from "express-rate-limit";
import { logger } from "../utils/logger";
import { env } from "../config/env";

/**
 * General API rate limiter
 * 100 requests per 15 minutes per IP
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: {
      message: "Too many requests from this IP, please try again later.",
      code: "RATE_LIMIT_EXCEEDED",
    },
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req, res) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      success: false,
      error: {
        message: "Too many requests from this IP, please try again later.",
        code: "RATE_LIMIT_EXCEEDED",
      },
    });
  },
});

/**
 * Strict rate limiter for authentication endpoints
 * 5 requests per 15 minutes per IP
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login attempts per windowMs
  message: {
    success: false,
    error: {
      message: "Too many authentication attempts, please try again later.",
      code: "AUTH_RATE_LIMIT_EXCEEDED",
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful requests
  handler: (req, res) => {
    logger.warn(`Auth rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      success: false,
      error: {
        message: "Too many authentication attempts, please try again later.",
        code: "AUTH_RATE_LIMIT_EXCEEDED",
      },
    });
  },
});

/**
 * Rate limiter for affiliate click tracking
 * 1000 clicks per hour per IP (to prevent abuse)
 */
export const affiliateClickLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 1000, // Limit each IP to 1000 clicks per hour
  message: {
    success: false,
    error: {
      message: "Too many affiliate clicks from this IP, please try again later.",
      code: "CLICK_RATE_LIMIT_EXCEEDED",
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiter for admin endpoints
 * 200 requests per 15 minutes per IP
 */
export const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limit each IP to 200 requests per windowMs
  message: {
    success: false,
    error: {
      message: "Too many admin requests, please try again later.",
      code: "ADMIN_RATE_LIMIT_EXCEEDED",
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(`Admin rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      success: false,
      error: {
        message: "Too many admin requests, please try again later.",
        code: "ADMIN_RATE_LIMIT_EXCEEDED",
      },
    });
  },
});

/**
 * Rate limiter specifically for analytics view tracking
 * More permissive than general API limiter since page views are expected to be frequent
 * 300 requests per 15 minutes per IP (allows for navigation tracking)
 */
export const analyticsViewLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Limit each IP to 300 view tracking requests per windowMs
  message: {
    success: false,
    error: {
      message: "Too many analytics requests from this IP, please try again later.",
      code: "ANALYTICS_RATE_LIMIT_EXCEEDED",
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false, // Count all requests, even successful ones
  handler: (req, res) => {
    logger.warn(`Analytics rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      success: false,
      error: {
        message: "Too many analytics requests from this IP, please try again later.",
        code: "ANALYTICS_RATE_LIMIT_EXCEEDED",
      },
    });
  },
});

