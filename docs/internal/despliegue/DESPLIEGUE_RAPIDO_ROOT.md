# 🚀 Despliegue Rápido - Usuario Root

## ✅ Tu Configuración

**Usuario SSH:** `root`  
**Servidor:** `207.180.226.141`  
**Dominio:** `codekitpro.app`

---

## 📝 Paso 1: Conectarse al Servidor

Desde tu terminal local, ejecuta:

```bash
ssh root@207.180.226.141
```

Te pedirá la contraseña. Escríbela (no se verá mientras escribes) y presiona Enter.

---

## 🚀 Paso 2: Ejecutar Script de Despliegue

Una vez conectado al servidor, ejecuta este comando:

```bash
curl -o deploy-server.sh https://raw.githubusercontent.com/planetazuzu/codekit-pro/main/scripts/deploy-server.sh && chmod +x deploy-server.sh && bash deploy-server.sh
```

**O si prefieres paso a paso:**

```bash
# Descargar script
curl -o deploy-server.sh https://raw.githubusercontent.com/planetazuzu/codekit-pro/main/scripts/deploy-server.sh

# Dar permisos
chmod +x deploy-server.sh

# Ejecutar
bash deploy-server.sh
```

---

## ⚙️ Paso 3: Configurar Variables de Entorno

Después de que el script termine, edita el archivo `.env`:

```bash
cd /var/www/codekit-pro
nano .env
```

**Agrega/modifica estas variables:**

```env
NODE_ENV=production
PORT=8604

# Generar JWT_SECRET (ejecuta en el servidor):
# openssl rand -base64 32
JWT_SECRET=tu-secreto-generado-aqui

ADMIN_PASSWORD=941259018a
WEBHOOK_SECRET=Oe6OTVBc4Nh2UZ0XwdIuRlek10vpJdacKtXN8N6GsI8=

# Si tienes PostgreSQL:
DATABASE_URL=postgresql://usuario:password@localhost:5432/codekit_pro
```

**Para guardar en nano:** `Ctrl+O`, `Enter`, `Ctrl+X`

---

## 🔄 Paso 4: Reiniciar Aplicación (si editaste .env)

Si editaste el `.env`, reinicia la aplicación:

```bash
pm2 restart codekit-pro-8604
```

---

## ✅ Paso 5: Verificar que Funciona

```bash
# Ver estado
pm2 status

# Ver logs
pm2 logs codekit-pro-8604

# Health check
curl http://localhost:8604/health
```

**Debería responder:**
```json
{
  "status": "ok",
  "timestamp": "2025-01-XX..."
}
```

---

## 🌐 Paso 6: Configurar Nginx Proxy Manager

1. Ve a: `http://207.180.226.141:81`
2. Login con tus credenciales
3. **Add Proxy Host:**
   - **Domain Names:** `codekitpro.app`
   - **Forward Hostname/IP:** `localhost`
   - **Forward Port:** `8604`
   - **SSL:** Request new SSL Certificate
   - **Force SSL:** ✅

---

## 📋 Comandos Útiles

```bash
# Ver logs en tiempo real
pm2 logs codekit-pro-8604

# Reiniciar aplicación
pm2 restart codekit-pro-8604

# Detener aplicación
pm2 stop codekit-pro-8604

# Ver estado
pm2 status

# Actualizar código después
cd /var/www/codekit-pro
git pull origin main
npm ci
npm run build
pm2 restart codekit-pro-8604
```

---

## 🎯 Resumen de Comandos Completos

**Copia y pega esto en tu terminal local:**

```bash
# 1. Conectarse
ssh root@207.180.226.141

# 2. Una vez conectado, ejecutar:
curl -o deploy-server.sh https://raw.githubusercontent.com/planetazuzu/codekit-pro/main/scripts/deploy-server.sh && chmod +x deploy-server.sh && bash deploy-server.sh

# 3. Después del script, editar .env:
cd /var/www/codekit-pro
nano .env
# (Agregar variables necesarias)

# 4. Reiniciar si editaste .env:
pm2 restart codekit-pro-8604

# 5. Verificar:
curl http://localhost:8604/health
```

---

## ✅ Checklist

- [ ] Conectado al servidor como `root`
- [ ] Script de despliegue ejecutado
- [ ] Archivo `.env` configurado
- [ ] Aplicación corriendo (`pm2 status`)
- [ ] Health check funciona (`curl http://localhost:8604/health`)
- [ ] Nginx Proxy Manager configurado
- [ ] Aplicación accesible en `https://codekitpro.app`

---

**¿Listo?** Ejecuta: `ssh root@207.180.226.141`


