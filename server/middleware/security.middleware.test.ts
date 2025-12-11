import { describe, it, expect, beforeEach } from "vitest";
import { Request, Response, NextFunction } from "express";
import { sanitizeInput } from "./security.middleware";

describe("Security Middleware", () => {
  describe("sanitizeInput", () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let next: NextFunction;

    beforeEach(() => {
      req = {
        body: {},
      };
      res = {};
      next = () => {};
    });

    it("should sanitize XSS attempts in strings", () => {
      req.body = {
        title: '<script>alert("XSS")</script>Hello',
        content: 'javascript:alert("XSS")',
        description: 'onclick="alert(\'XSS\')"',
      };

      sanitizeInput(req as Request, res as Response, next);

      // DOMPurify should remove script tags and dangerous attributes
      expect(req.body.title).not.toContain("<script>");
      expect(req.body.title).toContain("Hello"); // Content preserved
      expect(req.body.content).not.toContain("javascript:");
      expect(req.body.description).not.toContain("onclick");
    });

    it("should sanitize nested objects", () => {
      req.body = {
        user: {
          name: '<script>alert("XSS")</script>',
          bio: 'javascript:void(0)',
        },
        tags: ['<script>', 'safe-tag'],
      };

      sanitizeInput(req as Request, res as Response, next);

      expect(req.body.user.name).not.toContain("<script>");
      expect(req.body.user.bio).not.toContain("javascript:");
      expect(req.body.tags[0]).not.toContain("<script>");
      expect(req.body.tags[1]).toBe("safe-tag");
    });

    it("should handle arrays", () => {
      req.body = {
        items: [
          '<script>alert("XSS")</script>',
          'normal text',
          'javascript:void(0)',
        ],
      };

      sanitizeInput(req as Request, res as Response, next);

      expect(req.body.items[0]).not.toContain("<script>");
      expect(req.body.items[1]).toBe("normal text");
      expect(req.body.items[2]).not.toContain("javascript:");
    });

    it("should preserve safe content", () => {
      req.body = {
        title: "Safe Title",
        content: "This is safe content with numbers 123",
        tags: ["react", "typescript"],
      };

      sanitizeInput(req as Request, res as Response, next);

      expect(req.body.title).toBe("Safe Title");
      expect(req.body.content).toBe("This is safe content with numbers 123");
      expect(req.body.tags).toEqual(["react", "typescript"]);
    });

    it("should handle empty objects", () => {
      req.body = {};

      sanitizeInput(req as Request, res as Response, next);

      expect(req.body).toEqual({});
    });

    it("should handle null/undefined body", () => {
      req.body = undefined;

      sanitizeInput(req as Request, res as Response, next);

      expect(req.body).toBeUndefined();
    });

    it("should sanitize complex nested structures", () => {
      req.body = {
        prompt: {
          title: '<script>alert("XSS")</script>',
          content: "Safe content",
          metadata: {
            author: 'onerror="alert(1)"',
            tags: ['<script>', 'safe'],
          },
        },
      };

      sanitizeInput(req as Request, res as Response, next);

      expect(req.body.prompt.title).not.toContain("<script>");
      expect(req.body.prompt.content).toBe("Safe content");
      expect(req.body.prompt.metadata.author).not.toContain("onerror");
      expect(req.body.prompt.metadata.tags[0]).not.toContain("<script>");
      expect(req.body.prompt.metadata.tags[1]).toBe("safe");
    });
  });
});

