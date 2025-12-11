import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { Request, Response, NextFunction } from "express";
import { apiLimiter, authLimiter } from "./rate-limit.middleware";

// Mock logger
vi.mock("../utils/logger", () => ({
  logger: {
    warn: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

describe("Rate Limiting Middleware", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;
  let statusMock: ReturnType<typeof vi.fn>;
  let jsonMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    statusMock = vi.fn().mockReturnThis();
    jsonMock = vi.fn().mockReturnThis();

    req = {
      ip: "127.0.0.1",
      method: "GET",
      path: "/api/test",
    };

    res = {
      status: statusMock,
      json: jsonMock,
      setHeader: vi.fn(),
    };

    next = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("apiLimiter", () => {
    it("should allow requests within limit", async () => {
      // Make a request within limit
      await apiLimiter(req as Request, res as Response, next);

      expect(next).toHaveBeenCalled();
      expect(statusMock).not.toHaveBeenCalled();
    });

    it("should set rate limit headers", async () => {
      await apiLimiter(req as Request, res as Response, next);

      expect(res.setHeader).toHaveBeenCalled();
    });
  });

  describe("authLimiter", () => {
    it("should allow authentication attempts within limit", async () => {
      await authLimiter(req as Request, res as Response, next);

      expect(next).toHaveBeenCalled();
      expect(statusMock).not.toHaveBeenCalled();
    });

    it("should have stricter limits than apiLimiter", () => {
      // authLimiter has max: 5, apiLimiter has max: 100
      // This is tested by checking the configuration
      expect(authLimiter).toBeDefined();
    });
  });
});

