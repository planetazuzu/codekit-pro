# 🚀 Comandos para Ejecutar Despliegue Manual

## Opción 1: Usar el Script Automático (Recomendado)

```bash
ssh root@207.180.226.141
cd /var/www/codekit-pro
bash scripts/forzar-despliegue-manual.sh
```

## Opción 2: Comandos Manuales Paso a Paso

Copia y pega estos comandos uno por uno:

```bash
# 1. Conectar al servidor
ssh root@207.180.226.141

# 2. Ir al directorio del proyecto
cd /var/www/codekit-pro

# 3. Actualizar código desde Git
git fetch origin main
git pull origin main

# 4. Verificar que se actualizó
git log --oneline -1

# 5. Reconstruir imagen Docker
docker compose build app

# 6. Reiniciar contenedor
docker compose restart app

# 7. Esperar 15 segundos
sleep 15

# 8. Verificar health check
curl http://localhost:8604/health

# 9. Verificar nueva funcionalidad
curl http://localhost:8604/api/docs/README.md | head -10

# 10. Ver logs recientes
docker compose logs app --tail=30
```

## Opción 3: Todo en un Solo Comando

```bash
ssh root@207.180.226.141 "cd /var/www/codekit-pro && git pull origin main && docker compose build app && docker compose restart app && sleep 15 && curl http://localhost:8604/health"
```

## Verificación Final

Después de ejecutar el despliegue:

1. **En el servidor:**
   ```bash
   curl http://localhost:8604/health
   curl http://localhost:8604/api/docs/README.md | head -5
   ```

2. **En tu navegador:**
   - Limpia la caché (Ctrl+Shift+R)
   - Ve a: https://codekitpro.app/docs
   - Deberías ver la nueva sección de documentación

## Si Algo Falla

```bash
# Ver logs detallados
docker compose logs app --tail=100

# Ver estado de contenedores
docker compose ps

# Verificar estado de Git
git status
git log --oneline -5
```

