import express, { type Express } from "express";
import fs from "fs";
import path from "path";

export function serveStatic(app: Express) {
  const distPath = path.resolve(__dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  // Servir archivos estáticos con los MIME types correctos
  app.use(express.static(distPath, {
    setHeaders: (res, filePath) => {
      // Asegurar MIME types correctos para archivos JS y CSS
      if (filePath.endsWith('.js')) {
        res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
      } else if (filePath.endsWith('.mjs')) {
        res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
      } else if (filePath.endsWith('.css')) {
        res.setHeader('Content-Type', 'text/css; charset=utf-8');
      }
    }
  }));

  // fall through to index.html ONLY if the file doesn't exist and it's not an API route
  app.use("*", (req, res, next) => {
    // No servir index.html para rutas de API o archivos estáticos
    if (req.path.startsWith("/api") || req.path.startsWith("/health")) {
      return next();
    }
    
    // Verificar si es un archivo estático (tiene extensión)
    const hasExtension = /\.\w+$/.test(req.path);
    if (hasExtension) {
      return next(); // Dejar que el middleware de error maneje 404
    }
    
    // Solo servir index.html para rutas de la SPA
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
