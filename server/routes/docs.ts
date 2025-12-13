/**
 * Documentation routes
 * Serves Markdown documentation files
 */

import { Router, Request, Response } from "express";
import fs from "fs";
import path from "path";
import { logger } from "../utils/logger";

const router = Router();

// Path to docs directory - prioritize public docs
// In production (Docker), __dirname points to dist/server/routes
// In development, __dirname points to server/routes
// So we need to go up to project root, then to docs
const isProduction = process.env.NODE_ENV === "production";

// Try multiple possible paths
const possiblePaths = isProduction
  ? [
      path.resolve(__dirname, "../../../docs"),  // dist/server/routes -> ../../../docs
      path.resolve(process.cwd(), "docs"),       // From working directory
      "/app/docs",                                // Absolute path in Docker
    ]
  : [
      path.resolve(__dirname, "../../docs"),     // server/routes -> ../../docs
      path.resolve(process.cwd(), "docs"),       // From working directory
    ];

// Find the first path that exists
let docsPath: string | null = null;
for (const possiblePath of possiblePaths) {
  if (fs.existsSync(possiblePath)) {
    docsPath = possiblePath;
    logger.info(`Using docs path: ${docsPath}`);
    break;
  }
}

if (!docsPath) {
  logger.error("Docs directory not found. Tried paths:", possiblePaths);
  // Fallback to first path
  docsPath = possiblePaths[0];
}

const publicDocsPath = path.join(docsPath, "public");

/**
 * GET /api/docs/:path*
 * Serves Markdown documentation files
 */
router.get("/:path*", (req: Request, res: Response) => {
  try {
    // Get the requested path
    let requestedPath = req.params.path || "";
    
    // If no path or root, default to public README
    if (!requestedPath || requestedPath === "" || requestedPath === "README.md") {
      requestedPath = "public/README.md";
    } else if (!requestedPath.startsWith("public/") && !requestedPath.startsWith("internal/")) {
      // If path doesn't specify public/internal, default to public
      // But check if it's a direct file request first
      if (requestedPath.endsWith(".md")) {
        requestedPath = `public/${requestedPath}`;
      } else {
        // It's a directory path, try public first
        requestedPath = `public/${requestedPath}`;
      }
    }
    
    const fullPath = path.join(docsPath, requestedPath);

    // Security: Prevent directory traversal
    if (!fullPath.startsWith(docsPath)) {
      return res.status(403).json({ error: "Access denied" });
    }

    // Check if file exists
    if (!fs.existsSync(fullPath)) {
      logger.warn(`Document not found: ${requestedPath}`, {
        fullPath,
        docsPath,
        requestedPath,
        exists: fs.existsSync(docsPath),
        publicExists: fs.existsSync(publicDocsPath),
      });
      return res.status(404).json({ 
        error: `Documento no encontrado: ${requestedPath}`,
        debug: isProduction ? undefined : { fullPath, docsPath, requestedPath }
      });
    }

    // Check if it's a directory
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      // If directory, try to serve README.md
      const readmePath = path.join(fullPath, "README.md");
      if (fs.existsSync(readmePath)) {
        const content = fs.readFileSync(readmePath, "utf-8");
        return res.setHeader("Content-Type", "text/markdown; charset=utf-8").send(content);
      }
      return res.status(404).json({ error: "No README.md found in directory" });
    }

    // Check if it's a markdown file
    if (!fullPath.endsWith(".md")) {
      return res.status(400).json({ error: "Only Markdown files are supported" });
    }

    // Read and serve the file
    const content = fs.readFileSync(fullPath, "utf-8");
    res.setHeader("Content-Type", "text/markdown; charset=utf-8");
    res.send(content);
  } catch (error: any) {
    logger.error("Error serving documentation:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export { router as docsRouter };

