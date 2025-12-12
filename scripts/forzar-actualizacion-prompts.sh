#!/bin/bash
# Script para forzar la actualización de prompts
# Elimina prompts del sistema y los vuelve a crear

set -e

echo "🔄 Forzando actualización de prompts..."
echo ""

cd /var/www/codekit-pro

# Obtener ID del usuario sistema
SYSTEM_USER_ID=$(docker compose exec -T postgres psql -U codekit_user -d codekit_pro -t -c "SELECT id FROM users WHERE email = 'system@codekit.pro';" | tr -d ' ')

if [ -z "$SYSTEM_USER_ID" ]; then
    echo "❌ No se encontró el usuario sistema"
    exit 1
fi

echo "Usuario sistema ID: $SYSTEM_USER_ID"
echo ""

# Opción 1: Eliminar prompts del sistema y reiniciar
echo "Eliminando prompts del sistema..."
docker compose exec -T postgres psql -U codekit_user -d codekit_pro -c "DELETE FROM prompts WHERE user_id = '$SYSTEM_USER_ID';"

echo "✅ Prompts eliminados"
echo "Reiniciando contenedor para recrear prompts..."
docker compose restart app

echo ""
echo "Esperando 15 segundos..."
sleep 15

echo ""
echo "=== Verificando prompts ==="
docker compose exec postgres psql -U codekit_user -d codekit_pro -c "SELECT COUNT(*) as total_prompts FROM prompts;"
docker compose exec postgres psql -U codekit_user -d codekit_pro -c "SELECT COUNT(*) as desarrollo_eficiente FROM prompts WHERE category = 'Desarrollo Eficiente';"

echo ""
echo "=== Últimos prompts añadidos ==="
docker compose exec postgres psql -U codekit_user -d codekit_pro -c "SELECT title, category FROM prompts ORDER BY \"createdAt\" DESC LIMIT 10;"

echo ""
echo "✅ Proceso completado"

