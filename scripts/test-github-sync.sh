#!/bin/bash
# Script para probar la sincronización con GitHub

echo "🧪 Probando sincronización con GitHub..."
echo ""

# Verificar variables de entorno
echo "📋 Verificando variables de entorno..."
if grep -q "GITHUB_TOKEN=ghp_" .env 2>/dev/null; then
    echo "✅ GITHUB_TOKEN configurado"
else
    echo "❌ GITHUB_TOKEN no encontrado"
    exit 1
fi

if grep -q "GITHUB_REPO_OWNER=planetazuzu" .env 2>/dev/null; then
    echo "✅ GITHUB_REPO_OWNER configurado"
else
    echo "❌ GITHUB_REPO_OWNER no encontrado"
    exit 1
fi

if grep -q "GITHUB_REPO_NAME=codekit-pro-data" .env 2>/dev/null; then
    echo "✅ GITHUB_REPO_NAME configurado"
else
    echo "❌ GITHUB_REPO_NAME no encontrado"
    exit 1
fi

echo ""
echo "🔗 Verificando conexión con GitHub..."

# Verificar que el repositorio existe
REPO_CHECK=$(curl -s -H "Authorization: token $(grep GITHUB_TOKEN .env | cut -d'=' -f2)" \
    https://api.github.com/repos/planetazuzu/codekit-pro-data 2>&1)

if echo "$REPO_CHECK" | grep -q '"name"'; then
    echo "✅ Repositorio encontrado: planetazuzu/codekit-pro-data"
    REPO_NAME=$(echo "$REPO_CHECK" | grep '"name"' | head -1 | cut -d'"' -f4)
    echo "   Nombre: $REPO_NAME"
else
    echo "❌ No se pudo acceder al repositorio"
    echo "$REPO_CHECK" | head -5
    exit 1
fi

echo ""
echo "📁 Verificando estructura del repositorio..."

# Verificar carpetas
for folder in prompts snippets links guides; do
    FOLDER_CHECK=$(curl -s -H "Authorization: token $(grep GITHUB_TOKEN .env | cut -d'=' -f2)" \
        "https://api.github.com/repos/planetazuzu/codekit-pro-data/contents/$folder" 2>&1)
    
    if echo "$FOLDER_CHECK" | grep -q '"name"'; then
        FILE_COUNT=$(echo "$FOLDER_CHECK" | grep -c '"type":"file"')
        echo "✅ Carpeta $folder existe ($FILE_COUNT archivos)"
    else
        echo "⚠️  Carpeta $folder no existe o está vacía"
    fi
done

echo ""
echo "✅ Prueba de conexión completada"
echo ""
echo "💡 Para probar la sincronización completa:"
echo "   1. Ve a http://localhost:8604/admin"
echo "   2. Ingresa tu contraseña de admin"
echo "   3. Click en la pestaña 'GitHub Sync'"
echo "   4. Verifica el estado y prueba sincronizar"

