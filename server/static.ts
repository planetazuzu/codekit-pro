import express, { type Express, Request, Response, NextFunction } from "express";
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
      if (filePath.endsWith('.js') || filePath.endsWith('.mjs')) {
        res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
      } else if (filePath.endsWith('.css')) {
        res.setHeader('Content-Type', 'text/css; charset=utf-8');
      }
    },
    // No servir index.html automáticamente para archivos que no existen
    fallthrough: true
  }));

  // Catch-all para rutas de SPA - solo para rutas que NO sean archivos estáticos
  app.get("*", (req: Request, res: Response, next: NextFunction) => {
    // No servir index.html para rutas de API
    if (req.path.startsWith("/api") || req.path.startsWith("/health")) {
      return next();
    }
    
    // Verificar si es un archivo estático (tiene extensión de archivo)
    const hasFileExtension = /\.\w+$/.test(req.path);
    if (hasFileExtension) {
      // Si es un archivo estático que no existe, devolver 404
      return next();
    }
    
    // Verificar si el archivo existe antes de servir index.html
    const requestedFile = path.join(distPath, req.path);
    if (fs.existsSync(requestedFile) && fs.statSync(requestedFile).isFile()) {
      // El archivo existe, express.static debería haberlo servido
      return next();
    }
    
    // Solo servir index.html para rutas de la SPA (sin extensión)
    res.sendFile(path.resolve(distPath, "index.html"), (err) => {
      if (err) {
        next(err);
      }
    });
  });
}
