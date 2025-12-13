# 🧪 Probar Despliegue Automático

## ✅ Verificación Previa

Antes de probar, verifica que todo está configurado:

### 1. Verificar Secrets en GitHub
- [x] `WEBHOOK_SECRET` configurado
- [x] `WEBHOOK_URL` configurado

### 2. Verificar en el Servidor
```bash
# Conectar al servidor
ssh root@tu_servidor

# Verificar que el webhook está configurado
curl http://localhost:8604/api/webhooks/status
```

Deberías ver:
```json
{
  "configured": true,
  "message": "Webhook endpoint is configured"
}
```

### 3. Verificar Docker
```bash
# En el servidor
docker compose ps
```

Deberías ver los contenedores corriendo:
- `codekit-pro` (app)
- `codekit-postgres` (postgres)

---

## 🚀 Probar el Despliegue

### Paso 1: Hacer un Cambio de Prueba

Vamos a hacer un cambio pequeño y visible para verificar que el despliegue funciona:

```bash
# En tu máquina local
cd "/home/planetazuzu/CodeKit Pro"

# Hacer un cambio pequeño (agregar un comentario o cambiar un texto)
# Por ejemplo, podemos agregar un timestamp al README
echo "" >> README.md
echo "<!-- Último despliegue: $(date) -->" >> README.md

# O hacer un cambio más visible
# Editar algún archivo de texto o componente
```

### Paso 2: Commit y Push

```bash
# Agregar cambios
git add .

# Commit con mensaje descriptivo
git commit -m "Test: Probar despliegue automático CI/CD"

# Push a GitHub
git push origin main
```

### Paso 3: Monitorear el Despliegue

#### En GitHub:
1. Ve a: `https://github.com/planetazuzu/codekit-pro/actions`
2. Deberías ver el workflow "🚀 CI/CD Auto Deploy" ejecutándose
3. Click en el workflow para ver los detalles
4. Verifica que:
   - ✅ Job "Validar Código" pasa
   - ✅ Job "Desplegar a Producción" se ejecuta
   - ✅ El webhook se llama correctamente

#### En el Servidor:
```bash
# Ver logs en tiempo real
docker compose logs -f app

# O ver los últimos logs
docker compose logs --tail=50 app
```

Deberías ver:
- Mensajes de despliegue
- Pull de código desde Git
- Rebuild de imagen Docker
- Restart de contenedores
- Health checks

### Paso 4: Verificar que el Cambio se Aplicó

```bash
# En el servidor, verificar que el cambio está presente
# Por ejemplo, si cambiaste el README:
cat README.md | tail -5

# O verificar la versión desplegada
docker compose exec app cat package.json | grep version
```

### Paso 5: Verificar que la Aplicación Funciona

```bash
# Health check
curl http://localhost:8604/health

# O desde fuera del servidor
curl https://codekitpro.app/health
```

Deberías recibir una respuesta exitosa.

---

## 📊 Qué Esperar

### Timeline Normal:
1. **0-30 segundos**: GitHub Actions inicia
2. **30-60 segundos**: Validación y build
3. **60-90 segundos**: Webhook llamado
4. **90-180 segundos**: Despliegue en servidor
5. **180-240 segundos**: Health checks y verificación

**Total: ~3-4 minutos**

### Logs Esperados:

#### En GitHub Actions:
```
✅ Validar Código
  - Checkout code
  - Setup Node.js
  - Instalar dependencias
  - Verificar tipos TypeScript
  - Build de aplicación

✅ Desplegar a Producción
  - Checkout code
  - Build application
  - Trigger deployment webhook
  - Verificar despliegue
```

#### En Servidor (Docker):
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
4. ✅ El health check pasa
5. ✅ Los cambios están visibles en producción
6. ✅ La aplicación funciona correctamente

---

## 🐛 Troubleshooting

### El workflow no se activa

**Solución:**
- Verifica que estás haciendo push a `main` o `master`
- Verifica que el archivo `.github/workflows/webhook-deploy.yml` existe
- Revisa la pestaña "Actions" en GitHub

### El webhook falla con 401/403

**Solución:**
```bash
# Verificar que el secret coincide
# En GitHub: Settings → Secrets → WEBHOOK_SECRET
# En servidor: grep WEBHOOK_SECRET .env

# Deben ser exactamente iguales
```

### El despliegue falla en el servidor

**Solución:**
```bash
# Ver logs detallados
docker compose logs app | tail -100

# Verificar que Docker está corriendo
docker compose ps

# Verificar permisos del script
ls -la scripts/deploy-docker-auto.sh
chmod +x scripts/deploy-docker-auto.sh
```

### Los cambios no aparecen

**Solución:**
```bash
# Verificar que el código se actualizó
cd /var/www/codekit-pro
git log -1

# Verificar que la imagen se reconstruyó
docker compose images

# Forzar rebuild
docker compose build --no-cache app
docker compose up -d app
```

---

## 🎯 Próximos Pasos

Después de verificar que el despliegue funciona:

1. **Implementar Rollback Automático** (Fase 4.1)
2. **Agregar Notificaciones** (Fase 4.2)
3. **Mejorar Monitoreo** (Fase 4.4)

---

## 📝 Notas

- El despliegue es **zero-downtime** (sin interrupciones)
- Los logs se guardan en Docker
- Puedes ver el historial en GitHub Actions
- Cada despliegue incluye health checks automáticos

---

**¡Listo para probar!** 🚀

