#!/bin/bash
# Script para verificar que los datos se hayan actualizado correctamente

echo "🔍 Verificando datos actualizados..."
echo ""

# Verificar prompts
echo "=== PROMPTS ==="
echo "Total de prompts:"
docker compose exec -T postgres psql -U codekit_user -d codekit_pro -c "SELECT COUNT(*) as total FROM prompts;" 2>/dev/null | grep -E "^\s*[0-9]+" || echo "Error al contar prompts"

echo ""
echo "Prompts de 'Desarrollo Eficiente' (nuevos):"
docker compose exec -T postgres psql -U codekit_user -d codekit_pro -c "SELECT COUNT(*) as total FROM prompts WHERE category = 'Desarrollo Eficiente';" 2>/dev/null | grep -E "^\s*[0-9]+" || echo "0"

echo ""
echo "Últimos 5 prompts añadidos:"
docker compose exec -T postgres psql -U codekit_user -d codekit_pro -c "SELECT title, category FROM prompts ORDER BY created_at DESC LIMIT 5;" 2>/dev/null || echo "Error al obtener prompts"

echo ""
echo "=== SNIPPETS ==="
echo "Total de snippets:"
docker compose exec -T postgres psql -U codekit_user -d codekit_pro -c "SELECT COUNT(*) as total FROM snippets;" 2>/dev/null | grep -E "^\s*[0-9]+" || echo "Error al contar snippets"

echo ""
echo "=== GUIDES ==="
echo "Total de guides:"
docker compose exec -T postgres psql -U codekit_user -d codekit_pro -c "SELECT COUNT(*) as total FROM guides;" 2>/dev/null | grep -E "^\s*[0-9]+" || echo "Error al contar guides"

echo ""
echo "✅ Verificación completada"

