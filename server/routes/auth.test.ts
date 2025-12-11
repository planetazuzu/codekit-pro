import { describe, it, expect, beforeEach, vi } from "vitest";
import request from "supertest";
import express from "express";
import session from "express-session";
import { registerAuthRoutes } from "./auth";
import { env } from "../config/env";

// Mock session store
const MemoryStore = require("memorystore")(session);

// Mock environment
vi.mock("../config/env", () => ({
  env: {
    ADMIN_PASSWORD: "test-password",
    JWT_SECRET: "test-secret",
    NODE_ENV: "test",
  },
}));

describe("Auth API", () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use(
      session({
        secret: "test-secret",
        resave: false,
        saveUninitialized: false,
        store: new MemoryStore({
          checkPeriod: 86400000,
        }),
      })
    );
    registerAuthRoutes(app);
  });

  describe("POST /api/auth/admin/login", () => {
    it("should login with correct password", async () => {
      const response = await request(app)
        .post("/api/auth/admin/login")
        .send({ password: "test-password" });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.authenticated).toBe(true);
      expect(response.headers["set-cookie"]).toBeDefined();
    });

    it("should reject incorrect password", async () => {
      const response = await request(app)
        .post("/api/auth/admin/login")
        .send({ password: "wrong-password" });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe("INVALID_PASSWORD");
    });

    it("should reject request without password", async () => {
      const response = await request(app)
        .post("/api/auth/admin/login")
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe("MISSING_PASSWORD");
    });
  });

  describe("GET /api/auth/admin/check", () => {
    it("should return false when not authenticated", async () => {
      const response = await request(app).get("/api/auth/admin/check");

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.authenticated).toBe(false);
    });

    it("should return true when authenticated", async () => {
      // First login
      const loginResponse = await request(app)
        .post("/api/auth/admin/login")
        .send({ password: "test-password" });

      const cookies = loginResponse.headers["set-cookie"];

      // Then check auth status
      const response = await request(app)
        .get("/api/auth/admin/check")
        .set("Cookie", cookies);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.authenticated).toBe(true);
    });
  });

  describe("POST /api/auth/admin/logout", () => {
    it("should logout authenticated user", async () => {
      // First login
      const loginResponse = await request(app)
        .post("/api/auth/admin/login")
        .send({ password: "test-password" });

      const cookies = loginResponse.headers["set-cookie"];

      // Then logout
      const response = await request(app)
        .post("/api/auth/admin/logout")
        .set("Cookie", cookies);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.authenticated).toBe(false);
    });

    it("should handle logout when not authenticated", async () => {
      const response = await request(app).post("/api/auth/admin/logout");

      // Should still return success (idempotent)
      expect(response.status).toBe(200);
    });
  });
});

