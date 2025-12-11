#!/bin/bash

# ============================================
# Script de Despliegue Rápido - CodeKit Pro
# Puerto: 8604
# Versión simplificada sin interacciones
# ============================================

set -e

PORT=8604
PM2_NAME="codekit-pro-8604"

echo "🚀 Desplegando CodeKit Pro en puerto $PORT..."

# Actualizar PORT en .env
if [ -f ".env" ]; then
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' "s/^PORT=.*/PORT=$PORT/" .env 2>/dev/null || echo "PORT=$PORT" >> .env
    else
        sed -i "s/^PORT=.*/PORT=$PORT/" .env 2>/dev/null || echo "PORT=$PORT" >> .env
    fi
    echo "NODE_ENV=production" >> .env
fi

# Build
echo "📦 Construyendo aplicación..."
npm ci --legacy-peer-deps
npm run build

# PM2
if command -v pm2 &> /dev/null; then
    echo "🔄 Reiniciando con PM2..."
    pm2 stop "$PM2_NAME" 2>/dev/null || true
    pm2 delete "$PM2_NAME" 2>/dev/null || true
    
    cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: '$PM2_NAME',
    script: './dist/index.cjs',
    env: { NODE_ENV: 'production', PORT: $PORT },
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    autorestart: true
  }]
};
EOF
    
    mkdir -p logs
    pm2 start ecosystem.config.js
    pm2 save
    
    echo "✅ Desplegado en puerto $PORT"
    echo "📊 Ver logs: pm2 logs $PM2_NAME"
else
    echo "⚠️  PM2 no encontrado. Iniciando directamente..."
    NODE_ENV=production PORT=$PORT node dist/index.cjs
fi

