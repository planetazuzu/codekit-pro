FROM node:20-alpine AS builder

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./
RUN npm ci --legacy-peer-deps

# Copiar código fuente
COPY . .

# Build de la aplicación
RUN npm run build

# Imagen de producción
FROM node:20-alpine

WORKDIR /app

# Instalar curl para healthcheck
RUN apk add --no-cache curl

# Copiar solo dependencias de producción
COPY package*.json ./
RUN npm ci --only=production --legacy-peer-deps && npm cache clean --force

# Instalar drizzle-kit globalmente para poder ejecutar db:push
RUN npm install -g drizzle-kit@^0.31.4 --legacy-peer-deps

# Copiar archivos compilados
COPY --from=builder /app/dist ./dist

# Exponer puerto
EXPOSE 8604

# Variables de entorno por defecto
ENV NODE_ENV=production
ENV PORT=8604

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:8604/health || exit 1

# Comando de inicio
CMD ["node", "dist/index.cjs"]

