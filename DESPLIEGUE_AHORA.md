# 🚀 Comandos para Desplegar Ahora

## Opción 1: Comando Completo (Una Línea)

```bash
cd /var/www/codekit-pro && git pull origin main && docker compose down && docker compose build --no-cache app && docker compose up -d && sleep 15 && docker compose ps && curl http://localhost:8604/api/health
```

## Opción 2: Paso a Paso (Recomendado)

```bash
# 1. Ir al directorio del proyecto
cd /var/www/codekit-pro

# 2. Actualizar código desde GitHub
git pull origin main

# 3. Verificar que se actualizó correctamente
git log --oneline -3

# 4. Detener contenedores
docker compose down

# 5. Reconstruir imagen sin caché (esto puede tardar varios minutos)
docker compose build --no-cache app

# 6. Iniciar contenedores
docker compose up -d

# 7. Esperar a que inicie (15 segundos)
sleep 15

# 8. Verificar estado de contenedores
docker compose ps

# 9. Verificar que la app responde
curl http://localhost:8604/api/health

# 10. Ver logs recientes para verificar que todo está bien
docker compose logs --tail=50 app
```

## Verificación Adicional

Si quieres ver más detalles:

```bash
# Ver logs en tiempo real
docker compose logs -f app

# Verificar que el endpoint de docs funciona
curl http://localhost:8604/api/docs/public/README.md

# Verificar que el webhook está configurado
curl http://localhost:8604/api/webhooks/status
```

## Si Algo Sale Mal

```bash
# Ver logs de errores
docker compose logs app | grep -i error

# Reiniciar solo el contenedor de la app
docker compose restart app

# Ver estado detallado
docker compose ps -a
```


