#!/bin/bash

# Script para detectar iconos de lucide-react usados sin importar

echo "🔍 Buscando iconos de lucide-react usados sin importar..."

# Buscar todos los archivos que usan iconos de lucide-react
find client/src -name "*.tsx" -o -name "*.ts" | while read file; do
  # Extraer todos los iconos usados en el archivo
  icons_used=$(grep -oE 'icon:\s*[A-Z][a-zA-Z0-9]+' "$file" 2>/dev/null | sed 's/icon:\s*//' | sort -u)
  
  if [ -n "$icons_used" ]; then
    # Verificar si están importados
    imports=$(grep -E "from ['\"]lucide-react['\"]" "$file" 2>/dev/null)
    
    if [ -n "$imports" ]; then
      # Extraer iconos importados
      imported_icons=$(echo "$imports" | grep -oE '[A-Z][a-zA-Z0-9]+' | sort -u)
      
      # Verificar cada icono usado
      for icon in $icons_used; do
        if ! echo "$imported_icons" | grep -q "^${icon}$"; then
          echo "❌ $file: Icono '$icon' usado pero NO importado"
        fi
      done
    else
      # Si hay iconos usados pero no hay imports de lucide-react
      for icon in $icons_used; do
        echo "⚠️  $file: Icono '$icon' usado pero no hay imports de lucide-react"
      done
    fi
  fi
done

echo "✅ Verificación completada"

