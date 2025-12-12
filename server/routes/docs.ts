/**
 * Documentation routes
 * Serves Markdown documentation files
 */

import { Router, Request, Response } from "express";
import fs from "fs";
import path from "path";
import { logger } from "../utils/logger";

const router = Router();

// Path to docs directory
const docsPath = path.resolve(__dirname, "../../docs");

/**
 * GET /api/docs/:path*
 * Serves Markdown documentation files
 */
router.get("/:path*", (req: Request, res: Response) => {
  try {
    // Get the requested path
    const requestedPath = req.params.path || "";
    const fullPath = path.join(docsPath, requestedPath);

    // Security: Prevent directory traversal
    if (!fullPath.startsWith(docsPath)) {
      return res.status(403).json({ error: "Access denied" });
    }

    // Check if file exists
    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ error: "Document not found" });
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

