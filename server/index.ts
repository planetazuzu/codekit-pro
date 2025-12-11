// Load .env file first, before any other imports
import { config } from "dotenv";
config();

import express, { type Request, Response, NextFunction } from "express";
import cookieParser from "cookie-parser";
import session from "express-session";
import { registerRoutes } from "./routes/index";
import { serveStatic } from "./static";
import { createServer } from "http";
import { initializeData } from "./init-data";
import { initStorage } from "./storage/index";
import { errorMiddleware, notFoundMiddleware } from "./middleware/error.middleware";
import { logger } from "./utils/logger";
import { validateEnv, env } from "./config/env";
import { securityHeaders, configureTrustProxy, sanitizeInput, validateContentType } from "./middleware/security.middleware";
import { getSessionConfig } from "./config/session";

const app = express();
const httpServer = createServer(app);

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

// Security: Configure trust proxy first
configureTrustProxy(app);

// Security: Apply security headers
app.use(securityHeaders);

// Body parsing
app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
    limit: "10mb", // Limit request body size
  }),
);

app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// Session management will be configured after env validation

// Legacy log function for backward compatibility
export function log(message: string, source: string = "express") {
  logger.info(message, { source });
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  try {
    // Validate environment variables first
    validateEnv();
    logger.info("Environment variables validated");

    // Configure session management (must be after env validation)
    app.use(session(getSessionConfig()));
    logger.info("Session management configured");

    // Initialize storage (PostgreSQL or MemStorage)
    await initStorage();
    logger.info("Storage initialized");

    // Initialize static data
    await initializeData();
    
    // Health check endpoint (no rate limit)
    app.get("/health", (_req, res) => {
      res.json({ status: "ok", timestamp: new Date().toISOString() });
    });
    
    // Register API routes (with rate limiting applied in routes)
    registerRoutes(app);

    // Setup Vite (dev) or static files (prod) BEFORE 404 handler
    // This ensures client routes are handled before the 404 middleware
    if (env.NODE_ENV === "production") {
      serveStatic(app);
    } else {
      const { setupVite } = await import("./vite");
      await setupVite(httpServer, app);
    }

    // 404 handler - must be after all routes (including Vite catch-all)
    app.use(notFoundMiddleware);

    // Error handler - must be last
    app.use(errorMiddleware);

    // ALWAYS serve the app on the port specified in the environment variable PORT
    // Other ports are firewalled. Default to 5000 if not specified.
    // this serves both the API and the client.
    // It is the only port that is not firewalled.
    const port = env.PORT;
    httpServer.listen(
      {
        port,
        host: "0.0.0.0",
        reusePort: true,
      },
      () => {
        log(`serving on port ${port}`);
      },
    );
  } catch (error) {
    logger.error("Failed to start server:", error);
    process.exit(1);
  }
})();
