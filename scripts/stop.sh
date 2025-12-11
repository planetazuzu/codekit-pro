#!/bin/bash

# ============================================
# Script para Detener CodeKit Pro
# ============================================

PM2_NAME="codekit-pro-8604"
PORT=8604

echo "🛑 Deteniendo CodeKit Pro..."

# Intentar detener con PM2
if command -v pm2 &> /dev/null; then
    if pm2 list | grep -q "$PM2_NAME"; then
        pm2 stop "$PM2_NAME"
        pm2 delete "$PM2_NAME"
        echo "✅ Aplicación detenida (PM2)"
    else
        echo "ℹ️  No se encontró aplicación corriendo con PM2"
    fi
fi

# Intentar detener proceso en el puerto
if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    PID=$(lsof -Pi :$PORT -sTCP:LISTEN -t)
    echo "⚠️  Proceso encontrado en puerto $PORT (PID: $PID)"
    read -p "¿Detener el proceso? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        kill $PID
        echo "✅ Proceso detenido"
    fi
else
    echo "ℹ️  No hay proceso corriendo en puerto $PORT"
fi

echo "✅ Completado"

