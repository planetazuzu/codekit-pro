# 🔔 Cómo Funciona el Webhook de Despliegue

Explicación detallada del flujo completo del sistema de webhook.

---

## 📊 Flujo Visual

```
┌─────────────────┐
│  Tu Computadora │
│                 │
│  git push       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│     GitHub      │
│                 │
│  1. Recibe push │
│  2. Trigger     │
│     workflow    │
└────────┬────────┘
         │
         │ GitHub Actions ejecuta:
         │ - npm ci
         │ - npm run build
         │
         ▼
┌─────────────────┐
│  GitHub Actions │
│                 │
│  Hace POST a:   │
│  /api/webhooks/ │
│  deploy         │
└────────┬────────┘
         │
         │ HTTP POST con:
         │ - Authorization: Bearer SECRET
         │ - Body: { ref, commit, ... }
         │
         ▼
┌─────────────────┐
│  Tu Servidor    │
│                 │
│  1. Recibe      │
│     webhook     │
│  2. Verifica     │
│     secreto     │
│  3. Ejecuta      │
│     deploy-auto │
│  4. Reinicia    │
│     aplicación  │
└─────────────────┘
```

---

## 🔄 Paso a Paso Detallado

### Paso 1: Haces Push a GitHub

```bash
git add .
git commit -m "Nueva funcionalidad"
git push origin main
```

### Paso 2: GitHub Detecta el Push

GitHub detecta que se hizo push a la rama `main` y activa el workflow `.github/workflows/webhook-deploy.yml`.

### Paso 3: GitHub Actions Ejecuta

El workflow hace lo siguiente:

```yaml
1. 📥 Checkout code          # Descarga el código
2. 🏗️ Build application      # npm ci && npm run build
3. 🔔 Trigger webhook         # Llama a tu servidor
```

**Código del workflow:**
```yaml
- name: 🔔 Trigger deployment webhook
  run: |
    curl -X POST \
      -H "Authorization: Bearer ${{ secrets.WEBHOOK_SECRET }}" \
      -H "Content-Type: application/json" \
      -d '{
        "ref": "${{ github.ref }}",
        "commit": "${{ github.sha }}",
        "repository": "${{ github.repository }}",
        "pusher": "${{ github.actor }}"
      }' \
      ${{ secrets.WEBHOOK_URL }}/api/webhooks/deploy
```

### Paso 4: Tu Servidor Recibe el Webhook

El endpoint `/api/webhooks/deploy` en tu servidor recibe la petición:

**Archivo:** `server/routes/webhooks.ts`

```typescript
router.post("/deploy", verifyWebhookSecret, async (req, res) => {
  // 1. Verifica el secreto (seguridad)
  // 2. Verifica que es de la rama main/master
  // 3. Ejecuta el script de despliegue
  // 4. Responde con éxito o error
});
```

### Paso 5: Verificación de Seguridad

El servidor verifica que la petición es válida:

```typescript
function verifyWebhookSecret(req, res, next) {
  // 1. Lee el header Authorization
  const authHeader = req.headers.authorization;
  
  // 2. Compara con WEBHOOK_SECRET del .env
  const token = authHeader.substring(7); // "Bearer TOKEN"
  
  // 3. Si coincide, permite continuar
  // 4. Si no, rechaza con 403
}
```

**¿Por qué es importante?**
- Sin esto, cualquiera podría hacer POST a tu endpoint
- El secreto asegura que solo GitHub Actions puede desplegar

### Paso 6: Ejecución del Script de Despliegue

Si todo está bien, el servidor ejecuta:

```bash
bash scripts/deploy-auto.sh
```

**El script hace:**
1. ✅ Pull del código más reciente (si está en Git)
2. ✅ `npm ci` - Instala dependencias
3. ✅ `npm run build` - Construye la aplicación
4. ✅ `npm run db:push` - Aplica migraciones de BD
5. ✅ `pm2 restart` - Reinicia la aplicación

### Paso 7: Respuesta al Webhook

El servidor responde a GitHub Actions:

```json
{
  "success": true,
  "message": "Deployment triggered successfully",
  "commit": "abc1234",
  "ref": "refs/heads/main"
}
```

---

## 🔐 Componentes de Seguridad

### 1. WEBHOOK_SECRET

**En el servidor (.env):**
```env
WEBHOOK_SECRET=mi-secreto-super-seguro-12345
```

**En GitHub Secrets:**
```
WEBHOOK_SECRET = mi-secreto-super-seguro-12345
```

**¿Por qué el mismo valor?**
- El servidor espera este secreto
- GitHub Actions lo envía en el header
- Si no coincide, el servidor rechaza la petición

### 2. Verificación de Rama

El webhook solo despliega si es de `main` o `master`:

```typescript
if (ref !== "refs/heads/main" && ref !== "refs/heads/master") {
  return res.json({
    success: true,
    message: "Skipped deployment (not main/master branch)",
  });
}
```

**Esto significa:**
- ✅ Push a `main` → Despliega
- ✅ Push a `master` → Despliega
- ❌ Push a `develop` → No despliega
- ❌ Push a `feature/nueva-funcion` → No despliega

---

## 📋 Configuración Necesaria

### En el Servidor

**1. Variable de entorno (.env):**
```env
WEBHOOK_SECRET=tu-secreto-aqui
```

**2. Endpoint disponible:**
```
POST https://tu-servidor.com/api/webhooks/deploy
```

**3. Script ejecutable:**
```bash
chmod +x scripts/deploy-auto.sh
```

### En GitHub

**Secrets (Settings → Secrets and variables → Actions):**

1. **WEBHOOK_SECRET**
   - Valor: El mismo que en el servidor
   - Ejemplo: `mi-secreto-super-seguro-12345`

2. **WEBHOOK_URL**
   - Valor: URL de tu servidor
   - Ejemplo: `https://codekitpro.app`
   - O: `http://192.168.1.100:8604` (si es local)

---

## 🧪 Probar el Webhook

### Opción 1: Desde GitHub Actions

1. Haz push a `main`
2. Ve a **Actions** en GitHub
3. Verifica que el workflow se ejecutó
4. Revisa los logs

### Opción 2: Manualmente con curl

```bash
# Desde tu computadora o servidor
curl -X POST \
  -H "Authorization: Bearer tu-secreto-aqui" \
  -H "Content-Type: application/json" \
  -d '{
    "ref": "refs/heads/main",
    "commit": "abc1234",
    "repository": "usuario/repo",
    "pusher": "usuario"
  }' \
  https://tu-servidor.com/api/webhooks/deploy
```

### Opción 3: Verificar Estado

```bash
# Verificar que el webhook está configurado
curl https://tu-servidor.com/api/webhooks/status

# Debería responder:
# {"configured":true,"message":"Webhook endpoint is configured"}
```

---

## 🔍 Logs y Debugging

### Ver Logs del Servidor

```bash
# Logs de PM2
pm2 logs codekit-pro-8604

# Buscar logs del webhook
pm2 logs codekit-pro-8604 | grep webhook
```

### Ver Logs de GitHub Actions

1. Ve a tu repositorio en GitHub
2. Click en **Actions**
3. Selecciona el workflow ejecutado
4. Revisa cada paso

### Errores Comunes

**Error 401: "Missing or invalid authorization header"**
- ✅ Verifica que GitHub Actions tiene `WEBHOOK_SECRET` configurado
- ✅ Verifica que el header es `Authorization: Bearer SECRET`

**Error 403: "Invalid webhook secret"**
- ✅ Verifica que `WEBHOOK_SECRET` en GitHub coincide con el del servidor
- ✅ Verifica que no hay espacios extra

**Error 503: "Webhook not configured"**
- ✅ Verifica que `WEBHOOK_SECRET` está en el `.env` del servidor
- ✅ Reinicia la aplicación: `pm2 restart codekit-pro-8604`

**Error de conexión**
- ✅ Verifica que `WEBHOOK_URL` es correcta
- ✅ Verifica que el servidor está accesible desde internet
- ✅ Verifica firewall/ports

---

## 💡 Ventajas del Webhook

### ✅ Ventajas

1. **No necesitas acceso SSH directo**
   - GitHub Actions no necesita conectarse por SSH
   - Solo hace una petición HTTP

2. **Más seguro**
   - El servidor controla qué se ejecuta
   - Puedes agregar más validaciones

3. **Más flexible**
   - Puedes agregar más lógica antes del despliegue
   - Puedes notificar a otros servicios

4. **Funciona detrás de firewall**
   - El servidor solo necesita recibir HTTP
   - No necesita permitir conexiones SSH desde GitHub

### ⚠️ Consideraciones

1. **El servidor debe estar accesible**
   - GitHub Actions debe poder hacer POST al servidor
   - Si está detrás de un firewall, configura port forwarding

2. **El secreto debe ser seguro**
   - Usa un secreto largo y aleatorio
   - No lo compartas públicamente

3. **El servidor debe tener Git configurado**
   - El script hace `git pull` si está disponible
   - Si no, solo usa el código actual

---

## 🆚 Comparación: SSH vs Webhook

| Característica | SSH | Webhook |
|---------------|-----|---------|
| Acceso necesario | SSH directo | HTTP endpoint |
| Seguridad | Clave SSH | Token secreto |
| Configuración | Más compleja | Más simple |
| Firewall | Necesita SSH abierto | Solo HTTP |
| Control | GitHub ejecuta comandos | Servidor ejecuta |

---

## 📚 Archivos Relacionados

- **Workflow:** `.github/workflows/webhook-deploy.yml`
- **Endpoint:** `server/routes/webhooks.ts`
- **Script:** `scripts/deploy-auto.sh`
- **Documentación:** `docs/CICD_DEPLOYMENT.md`

---

## ✅ Checklist de Configuración

- [ ] `WEBHOOK_SECRET` configurado en servidor (.env)
- [ ] `WEBHOOK_SECRET` configurado en GitHub Secrets
- [ ] `WEBHOOK_URL` configurado en GitHub Secrets
- [ ] Endpoint `/api/webhooks/deploy` accesible
- [ ] Script `deploy-auto.sh` tiene permisos de ejecución
- [ ] Aplicación reiniciada después de agregar `WEBHOOK_SECRET`
- [ ] Probado con un push a `main`

---

**¿Listo para configurar?** Sigue las instrucciones en `docs/CICD_DEPLOYMENT.md`

