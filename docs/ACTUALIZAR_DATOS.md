# 🔄 Actualizar Datos Estáticos

Este documento explica cómo actualizar los datos estáticos (prompts, snippets, guides, etc.) en CodeKit Pro.

## 📋 Opciones Disponibles

### Opción 1: Usar el Script Automático (Recomendado)

```bash
# Desde el servidor
cd /var/www/codekit-pro
bash scripts/update-data.sh
```

### Opción 2: Usar la API Directamente

```bash
# Desde el servidor
curl -X POST http://localhost:8604/api/admin/reinitialize-data
```

### Opción 3: Reiniciar el Contenedor Docker

```bash
# Reinicia el contenedor, lo que ejecutará initializeData() automáticamente
cd /var/www/codekit-pro
docker compose restart app
```

### Opción 4: Desde el Código (Desarrollo)

Si estás en desarrollo local, los datos se inicializan automáticamente al iniciar el servidor. Si necesitas forzarlo:

```bash
npm run dev
# O si tienes un script específico:
npm run init-data
```

## 🔍 Verificar que los Datos se Actualizaron

### Verificar Prompts

```bash
# Contar prompts en la base de datos
docker compose exec postgres psql -U codekit_user -d codekit_pro -c "SELECT COUNT(*) FROM prompts;"

# Ver algunos prompts recientes
docker compose exec postgres psql -U codekit_user -d codekit_pro -c "SELECT title, category FROM prompts ORDER BY created_at DESC LIMIT 10;"
```

### Verificar Snippets

```bash
docker compose exec postgres psql -U codekit_user -d codekit_pro -c "SELECT COUNT(*) FROM snippets;"
```

### Verificar Guides

```bash
docker compose exec postgres psql -U codekit_user -d codekit_pro -c "SELECT COUNT(*) FROM guides;"
```

## 📊 Datos que se Actualizan

El endpoint `/api/admin/reinitialize-data` actualiza:

- ✅ **Prompts**: Todos los prompts estáticos (incluyendo los nuevos de "Desarrollo Eficiente")
- ✅ **Snippets**: Snippets de código predefinidos
- ✅ **Guides**: Guías visuales y documentación
- ✅ **Links**: Enlaces rápidos (si están definidos)

## ⚠️ Notas Importantes

1. **No elimina datos existentes**: El sistema solo añade datos que no existen (basado en título/contenido)
2. **Idempotente**: Puedes ejecutarlo múltiples veces sin problemas
3. **Requiere servidor activo**: El servidor debe estar corriendo para usar el endpoint API
4. **Tiempo de ejecución**: Puede tardar unos segundos dependiendo de la cantidad de datos

## 🐛 Troubleshooting

### Error: "Connection refused"

El servidor no está corriendo. Inícialo primero:

```bash
docker compose up -d app
```

### Error: "Failed to reinitialize data"

Revisa los logs del servidor:

```bash
docker compose logs app | tail -50
```

### Los datos no aparecen en la interfaz

1. Verifica que se añadieron a la base de datos (ver sección "Verificar")
2. Limpia la caché del navegador
3. Verifica que el frontend esté haciendo las peticiones correctas

## 🔄 Automatización

Si quieres que los datos se actualicen automáticamente después de cada despliegue, puedes añadir esto al script de despliegue:

```bash
# Al final de deploy-docker-auto.sh
sleep 5  # Esperar a que el servidor esté listo
curl -X POST http://localhost:8604/api/admin/reinitialize-data || echo "Warning: Could not reinitialize data"
```

