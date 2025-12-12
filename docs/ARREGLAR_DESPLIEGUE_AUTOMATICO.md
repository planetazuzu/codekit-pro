# 🔧 Arreglar Despliegue Automático desde GitHub

## 🔍 Problema Identificado

El despliegue automático no está funcionando correctamente. Los cambios se suben a GitHub pero no se reflejan en producción.

## ✅ Correcciones Aplicadas

### 1. Mejora en el Webhook (`server/routes/webhooks.ts`)
- ✅ Asegurar que `PROJECT_DIR` se pase correctamente al script
- ✅ Configurar directorio por defecto: `/var/www/codekit-pro`

### 2. Mejora en el Script de Despliegue (`scripts/deploy-docker-auto.sh`)
- ✅ Mejor detección de commits pendientes
- ✅ Mejor manejo de errores en `git pull/reset`
- ✅ Logging más detallado para diagnóstico
- ✅ Verificación de rama actual
- ✅ Mostrar último commit después de actualizar

### 3. Optimización del Build
- ✅ Cambiar de `--no-cache` a build normal (más rápido)
- ✅ Solo reconstruir cuando hay cambios

## 🚀 Cómo Verificar que Funciona

### Paso 1: Verificar que los Cambios Están en el Repositorio

```bash
# En tu máquina local
git log --oneline -1
git push origin main
```

### Paso 2: Verificar que el Webhook se Recibe

```bash
# En el servidor
ssh root@207.180.226.141
cd /var/www/codekit-pro
docker compose logs app --tail=50 | grep -i "webhook\|deploy"
```

Deberías ver algo como:
```
[INFO] Deployment webhook triggered
[INFO] Executing deployment script: .../deploy-docker-auto.sh
```

### Paso 3: Verificar que el Script se Ejecuta

```bash
# En el servidor
docker compose logs app | grep -A 20 "Iniciando despliegue"
```

Deberías ver:
```
[INFO] 🚀 Iniciando despliegue automático con Docker...
[INFO] Commit: abc1234
[INFO] Ref: refs/heads/main
[INFO] Directorio: /var/www/codekit-pro
[INFO] Actualizando código desde Git...
```

### Paso 4: Verificar que el Código se Actualiza

```bash
# En el servidor
cd /var/www/codekit-pro
git log --oneline -1
# Debería mostrar el último commit de GitHub
```

### Paso 5: Verificar que la Aplicación se Reconstruye

```bash
# En el servidor
docker compose logs app | grep -i "reconstruyendo\|build"
```

### Paso 6: Verificar que la Aplicación se Reinicia

```bash
# En el servidor
docker compose ps app
# Debería mostrar "Up" o "healthy"
```

## 🔧 Si Aún No Funciona

### Diagnóstico Completo

```bash
# En el servidor
cd /var/www/codekit-pro
bash scripts/verificar-despliegue.sh
```

Este script te mostrará:
- Estado de Git (commits pendientes)
- Estado de Docker
- Estado de contenedores
- Logs recientes
- Si el webhook funcionó

### Forzar Despliegue Manual

Si el automático no funciona, puedes forzar un despliegue:

```bash
# En el servidor
cd /var/www/codekit-pro
bash scripts/forzar-despliegue-manual.sh
```

### Verificar Variables de Entorno

```bash
# En el servidor
docker compose exec app printenv | grep -E "PROJECT_DIR|USE_DOCKER|WEBHOOK"
```

Deberías ver:
- `USE_DOCKER=true`
- `PROJECT_DIR=/var/www/codekit-pro` (o el directorio correcto)

## 📝 Configuración Necesaria en el Servidor

Asegúrate de que el archivo `.env` en el servidor tenga:

```bash
USE_DOCKER=true
PROJECT_DIR=/var/www/codekit-pro
WEBHOOK_SECRET=tu-secret-aqui
```

## 🎯 Prueba Rápida

1. **Hacer un cambio pequeño** (por ejemplo, cambiar un texto)
2. **Commit y push:**
   ```bash
   git add .
   git commit -m "Test: Verificar despliegue automático"
   git push origin main
   ```
3. **Esperar 2-3 minutos** (tiempo de build)
4. **Verificar en producción** que el cambio se ve

## ✅ Checklist de Verificación

- [ ] Cambios subidos a GitHub
- [ ] GitHub Actions ejecuta workflow
- [ ] Webhook se recibe en el servidor (ver logs)
- [ ] Script de despliegue se ejecuta (ver logs)
- [ ] Git pull/reset funciona (ver logs)
- [ ] Docker build se ejecuta (ver logs)
- [ ] Contenedor se reinicia (ver `docker compose ps`)
- [ ] Health check pasa (`curl http://localhost:8604/health`)
- [ ] Cambios visibles en producción

## 🐛 Troubleshooting

### Problema: Webhook no se recibe
**Solución:** Verificar `WEBHOOK_SECRET` en GitHub y servidor

### Problema: Git pull falla
**Solución:** Verificar permisos y conexión a GitHub desde el servidor

### Problema: Docker build falla
**Solución:** Ver logs con `docker compose logs app` y revisar errores

### Problema: Contenedor no inicia
**Solución:** Ver logs y verificar variables de entorno

---

**Última actualización:** 2025-12-12  
**Estado:** Correcciones aplicadas, pendiente de verificación

