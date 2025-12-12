#!/bin/bash
# Script para forzar la inicialización de datos estáticos
# Útil cuando los datos no se cargaron correctamente

set -e

echo "🔄 Forzando inicialización de datos estáticos..."

cd /var/www/codekit-pro

# Reiniciar el contenedor para que ejecute initializeData()
echo "Reiniciando contenedor para inicializar datos..."
docker compose restart app

# Esperar a que el contenedor esté listo
echo "Esperando a que el servidor esté listo..."
sleep 10

# Verificar logs de inicialización
echo ""
echo "=== Verificando logs de inicialización ==="
docker compose logs app | grep -i "initialized\|initializing" | tail -10

# Verificar datos en la base de datos
echo ""
echo "=== Verificando datos en la base de datos ==="
echo "Prompts:"
docker compose exec postgres psql -U codekit_user -d codekit_pro -c "SELECT COUNT(*) FROM prompts;"

echo "Snippets:"
docker compose exec postgres psql -U codekit_user -d codekit_pro -c "SELECT COUNT(*) FROM snippets;"

echo "Links:"
docker compose exec postgres psql -U codekit_user -d codekit_pro -c "SELECT COUNT(*) FROM links;"

echo "Guides:"
docker compose exec postgres psql -U codekit_user -d codekit_pro -c "SELECT COUNT(*) FROM guides;"

echo ""
echo "✅ Verificación completada"

