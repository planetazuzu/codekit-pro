#!/bin/bash
# Script para actualizar en el servidor (ejecutar una vez dentro del servidor)

cd /var/www/codekit-pro

echo "🔄 Actualizando código desde GitHub..."
git pull origin main

echo "🛑 Deteniendo contenedores..."
docker compose down

echo "🔨 Reconstruyendo imagen (sin cache)..."
docker compose build --no-cache app

echo "🚀 Iniciando contenedores..."
docker compose up -d

echo "⏳ Esperando a que inicie (15 segundos)..."
sleep 15

echo ""
echo "=== Estado de Contenedores ==="
docker compose ps

echo ""
echo "=== Últimos Logs ==="
docker compose logs --tail=30 app

echo ""
echo "=== Health Check ==="
curl http://localhost:8604/api/health

echo ""
echo "✅ Actualización completada"
