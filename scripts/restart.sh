#!/bin/bash

# ============================================
# Script para Reiniciar CodeKit Pro
# ============================================

PM2_NAME="codekit-pro-8604"

echo "🔄 Reiniciando CodeKit Pro..."

if command -v pm2 &> /dev/null; then
    if pm2 list | grep -q "$PM2_NAME"; then
        pm2 restart "$PM2_NAME"
        echo "✅ Aplicación reiniciada"
        echo "📊 Ver logs: pm2 logs $PM2_NAME"
    else
        echo "⚠️  Aplicación no encontrada con PM2. Ejecuta deploy.sh primero."
        exit 1
    fi
else
    echo "⚠️  PM2 no encontrado. Usa deploy.sh para reiniciar."
    exit 1
fi

