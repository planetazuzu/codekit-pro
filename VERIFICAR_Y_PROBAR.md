# ✅ Verificar y Probar CI/CD Automático

## 📋 Paso 1: Verificar Configuración en el Servidor

Conecta al servidor y ejecuta estos comandos:

```bash
# 1. Conectar al servidor
ssh root@207.180.226.141

# 2. Ir al directorio
cd /var/www/codekit-pro

# 3. Verificar que USE_DOCKER está en .env
grep USE_DOCKER .env
# Debería mostrar: USE_DOCKER=true

# 4. Verificar que WEBHOOK_SECRET está
grep WEBHOOK_SECRET .env
# Debería mostrar: WEBHOOK_SECRET=Oe6OTVBc4Nh2UZ0XwdIuRlek10vpJdacKtXN8N6GsI8=

# 5. Reiniciar la aplicación para cargar las nuevas variables
docker compose restart app

# 6. Esperar unos segundos
sleep 5

# 7. Verificar que el webhook está configurado
curl http://localhost:8604/api/webhooks/status
```

**Resultado esperado:**
```json
{
  "configured": true,
  "message": "Webhook endpoint is configured"
}
```

Si ves `"configured": false`, verifica:
- Que el archivo `.env` tiene `WEBHOOK_SECRET`
- Que reiniciaste la aplicación después de agregar la variable
- Que no hay espacios extra en los valores

---

## 📋 Paso 2: Verificar en GitHub

1. Ve a: `https://github.com/planetazuzu/codekit-pro/settings/secrets/actions`
2. Verifica que tienes estos 2 secrets:
   - ✅ `WEBHOOK_SECRET` (debe ser el mismo que en el servidor)
   - ✅ `WEBHOOK_URL` (debe ser `https://codekitpro.app`)

---

## 📋 Paso 3: Probar el Despliegue Automático

### Opción A: Hacer un cambio pequeño

```bash
# En tu máquina local
cd "/home/planetazuzu/CodeKit Pro"

# Hacer un cambio pequeño
echo "" >> README.md
echo "<!-- Test CI/CD: $(date '+%Y-%m-%d %H:%M:%S') -->" >> README.md

# Commit y push
git add README.md
git commit -m "Test: Verificar despliegue automático CI/CD"
git push origin main
```

### Opción B: Ya hicimos un push de prueba antes

Si ya hiciste un push, simplemente verifica que funcionó.

---

## 📋 Paso 4: Monitorear el Despliegue

### En GitHub Actions (2-3 minutos):

1. Ve a: `https://github.com/planetazuzu/codekit-pro/actions`
2. Deberías ver el workflow "🚀 CI/CD Auto Deploy" ejecutándose
3. Click en el workflow para ver los detalles:
   - ✅ Job "Validar Código" - Debe pasar
   - ✅ Job "Desplegar a Producción" - Debe ejecutarse
   - ✅ "Trigger deployment webhook" - Debe ser exitoso

### En el Servidor (3-4 minutos):

```bash
# Ver logs en tiempo real
docker compose logs -f app

# O ver los últimos logs
docker compose logs --tail=50 app
```

**Logs esperados:**
```
[INFO] 🚀 Iniciando despliegue automático con Docker...
[INFO] Commit: abc1234
[INFO] Actualizando código desde Git...
[INFO] Reconstruyendo imagen Docker...
[INFO] Reiniciando aplicación...
[INFO] ✅ Aplicación saludable y respondiendo
```

---

## ✅ Verificación de Éxito

El despliegue fue exitoso si:

1. ✅ GitHub Actions completó sin errores
2. ✅ El webhook respondió con `success: true`
3. ✅ Los contenedores Docker se reiniciaron
4. ✅ El health check pasa: `curl http://localhost:8604/health`
5. ✅ Los cambios están visibles en producción

---

## 🐛 Troubleshooting

### El webhook dice "not configured"

```bash
# Verificar variables
docker compose exec app printenv | grep WEBHOOK

# Reiniciar completamente
docker compose down
docker compose up -d
```

### El workflow no se activa

- Verifica que estás haciendo push a `main` o `master`
- Verifica que el archivo `.github/workflows/webhook-deploy.yml` existe
- Revisa la pestaña "Actions" en GitHub

### El despliegue falla

```bash
# Ver logs detallados
docker compose logs app | tail -100

# Verificar permisos del script
chmod +x scripts/deploy-docker-auto.sh

# Verificar que Docker está corriendo
docker compose ps
```

---

## 🎯 Comandos Rápidos de Verificación

```bash
# Todo en uno - Verificar y probar
cd /var/www/codekit-pro && \
echo "=== Verificando .env ===" && \
grep -E "USE_DOCKER|WEBHOOK_SECRET" .env && \
echo "" && \
echo "=== Reiniciando ===" && \
docker compose restart app && \
sleep 5 && \
echo "" && \
echo "=== Verificando webhook ===" && \
curl http://localhost:8604/api/webhooks/status && \
echo "" && \
echo "=== Estado de contenedores ===" && \
docker compose ps
```

---

## 🎉 Próximos Pasos

Una vez que el despliegue automático funcione:

1. **Implementar Rollback Automático** (Fase 4.1 del plan)
2. **Agregar Notificaciones** (Fase 4.2 del plan)
3. **Mejorar Monitoreo** (Fase 4.4 del plan)

---

**¡Listo para probar!** 🚀

