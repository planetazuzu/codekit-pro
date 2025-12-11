FROM node:20-alpine AS builder

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./
RUN npm ci

# Copiar código fuente
COPY . .

# Build de la aplicación
RUN npm run build

# Imagen de producción
FROM node:20-alpine

WORKDIR /app

# Copiar solo dependencias de producción
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copiar archivos compilados
COPY --from=builder /app/dist ./dist

# Exponer puerto
EXPOSE 5000

# Variables de entorno
ENV NODE_ENV=production
ENV PORT=5000

# Comando de inicio
CMD ["node", "dist/index.cjs"]

