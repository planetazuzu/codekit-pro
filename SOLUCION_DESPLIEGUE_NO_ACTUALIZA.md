# 🔧 Solución: App No Se Actualiza en el Servidor

## Problema

El contenedor Docker se reinicia pero los cambios nuevos no aparecen. Las rutas `/api/health` y `/api/docs` siguen dando 404.

## Causa

Docker está usando una imagen cacheada que no incluye los cambios nuevos. Un simple `docker compose restart` no reconstruye la imagen.

## Solución: Rebuild Completo

### Opción 1: Script Automático (Recomendado)

En el servidor, ejecuta:

```bash
cd /var/www/codekit-pro
bash scripts/forzar-rebuild-completo.sh
```

Este script:
1. Detiene los contenedores
2. Elimina la imagen antigua
3. Limpia el cache de build
4. Actualiza el código desde GitHub
5. Reconstruye la imagen desde cero (sin cache)
6. Inicia los contenedores
7. Verifica que todo funciona

### Opción 2: Manual

Si prefieres hacerlo manualmente:

```bash
cd /var/www/codekit-pro

# 1. Detener contenedores
docker compose down

# 2. Actualizar código
git pull origin main

# 3. Reconstruir SIN cache
docker compose build --no-cache app

# 4. Iniciar
docker compose up -d

# 5. Esperar e verificar
sleep 20
curl http://localhost:8604/api/health
```

## Verificación

Después del rebuild, verifica:

```bash
# Health check
curl http://localhost:8604/api/health

# Docs API
curl http://localhost:8604/api/docs/README.md

# Ver logs si hay problemas
docker compose logs --tail=50 app
```

## Prevención

Para evitar este problema en el futuro:

1. **Asegurar que el webhook ejecuta rebuild:**
   - Verificar que `deploy-docker-auto.sh` incluye `docker compose build app`
   - O mejor: usar `docker compose build --no-cache app` cuando hay cambios importantes

2. **Verificar cambios antes de reiniciar:**
   ```bash
   # Ver qué commit está desplegado
   docker compose exec app git log --oneline -1
   
   # Comparar con GitHub
   git log --oneline -1 origin/main
   ```

3. **Usar el script de rebuild completo** cuando:
   - Se añaden nuevas rutas API
   - Se añaden nuevos archivos al servidor
   - Se cambian dependencias
   - Se modifican archivos de configuración

## Notas

- El rebuild completo toma ~2-3 minutos
- Durante el rebuild, la app estará offline
- El flag `--no-cache` asegura que todos los cambios se incluyan
- Después del rebuild, verifica siempre con los curl commands

