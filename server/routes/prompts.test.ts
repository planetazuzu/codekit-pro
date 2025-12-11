import { describe, it, expect, beforeEach, vi } from "vitest";
import request from "supertest";
import express from "express";
import { registerPromptsRoutes } from "./prompts";

// Mock storage
vi.mock("../storage", () => ({
  storage: {
    getPrompts: vi.fn(),
    getPrompt: vi.fn(),
    createPrompt: vi.fn(),
    updatePrompt: vi.fn(),
    deletePrompt: vi.fn(),
  },
}));

// Mock validation service
vi.mock("../services/validation.service", () => ({
  validatePrompt: (data: any) => data,
  validatePromptUpdate: (data: any) => data,
}));

// Mock response utils
vi.mock("../utils/response", () => ({
  sendSuccess: (res: any, data: any, status = 200) => {
    res.status(status).json({ success: true, data });
  },
  sendNotFound: (res: any, entity: string, id: string) => {
    res.status(404).json({ success: false, error: { message: `${entity} not found`, code: "NOT_FOUND" } });
  },
}));

// Mock middleware
vi.mock("../middleware/validation.middleware", () => ({
  validateParams: () => (req: any, res: any, next: any) => next(),
}));

describe("Prompts API", () => {
  let app: express.Application;
  let mockStorage: any;

  beforeEach(async () => {
    app = express();
    app.use(express.json());
    registerPromptsRoutes(app);
    
    // Get mocked storage
    const { storage } = await import("../storage");
    mockStorage = storage;
    
    vi.clearAllMocks();
  });

  it("GET /api/prompts returns list of prompts", async () => {
    const mockPrompts = [
      { id: "1", title: "Test Prompt", content: "Test content", createdAt: new Date(), updatedAt: new Date() },
    ];
    vi.mocked(mockStorage.getPrompts).mockResolvedValue(mockPrompts);

    const response = await request(app).get("/api/prompts");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  it("GET /api/prompts/:id returns single prompt", async () => {
    const mockPrompt = {
      id: "1",
      title: "Test Prompt",
      content: "Test content",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    vi.mocked(mockStorage.getPrompt).mockResolvedValue(mockPrompt);

    const response = await request(app).get("/api/prompts/1");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty("id", "1");
  });

  it("POST /api/prompts creates new prompt", async () => {
    const newPromptData = {
      title: "New Prompt",
      content: "New content",
      language: "typescript",
    };
    const createdPrompt = {
      id: "2",
      ...newPromptData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    vi.mocked(mockStorage.createPrompt).mockResolvedValue(createdPrompt);

    const response = await request(app)
      .post("/api/prompts")
      .send(newPromptData);

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty("title", "New Prompt");
  });
});

