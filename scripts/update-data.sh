#!/bin/bash
# Script para actualizar datos estáticos (prompts, snippets, guides, etc.)
# Ejecuta la reinicialización de datos vía API

set -e

PORT=${PORT:-8604}
API_URL="http://localhost:${PORT}/api/admin/reinitialize-data"

echo "🔄 Actualizando datos estáticos..."
echo "URL: ${API_URL}"

# Intentar hacer la petición
if command -v curl &> /dev/null; then
    response=$(curl -s -X POST "${API_URL}" -H "Content-Type: application/json" -w "\n%{http_code}")
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" = "200" ]; then
        echo "✅ Datos actualizados exitosamente"
        echo "$body" | jq '.' 2>/dev/null || echo "$body"
    else
        echo "❌ Error al actualizar datos (HTTP $http_code)"
        echo "$body"
        exit 1
    fi
else
    echo "❌ curl no está instalado. Por favor instala curl o ejecuta manualmente:"
    echo "curl -X POST ${API_URL}"
    exit 1
fi

