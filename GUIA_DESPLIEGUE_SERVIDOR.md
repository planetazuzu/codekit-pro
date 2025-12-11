# 🚀 Guía Completa: Desplegar CodeKit Pro en el Servidor

## 📋 Información del Servidor

**IP del Servidor:** `207.180.226.141`  
**Dominio:** `codekitpro.app`  
**Puerto:** `8604`

---

## 🔧 Paso 1: Conectarse al Servidor

### Opción A: SSH Directo

```bash
ssh usuario@207.180.226.141
```

**Nota:** Reemplaza `usuario` con tu usuario SSH (puede ser `root`, `ubuntu`, `deploy`, etc.)

### Opción B: Si no sabes el usuario

```bash
# Prueba con estos usuarios comunes:
ssh root@207.180.226.141
ssh ubuntu@207.180.226.141
ssh deploy@207.180.226.141
```

---

## 📦 Paso 2: Preparar el Servidor

### 2.1 Instalar Node.js (si no está instalado)

```bash
# Verificar si Node.js está instalado
node -v

# Si no está instalado, instalar Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verificar instalación
node -v
npm -v
```

### 2.2 Instalar PM2 (recomendado)

```bash
sudo npm install -g pm2
pm2 -v
```

### 2.3 Instalar Git (si no está instalado)

```bash
sudo apt-get update
sudo apt-get install -y git
git --version
```

### 2.4 Crear Directorio del Proyecto

```bash
# Crear directorio (ajusta la ruta según prefieras)
sudo mkdir -p /var/www/codekit-pro
sudo chown $USER:$USER /var/www/codekit-pro
cd /var/www/codekit-pro
```

---

## 📥 Paso 3: Clonar el Repositorio

```bash
# Clonar el repositorio desde GitHub
git clone https://github.com/planetazuzu/codekit-pro.git .

# O si ya existe el directorio:
cd /var/www/codekit-pro
git pull origin main
```

---

## ⚙️ Paso 4: Configurar Variables de Entorno

### 4.1 Crear archivo .env

```bash
cd /var/www/codekit-pro
nano .env
```

### 4.2 Agregar Variables Mínimas Necesarias

```env
# Aplicación
NODE_ENV=production
PORT=8604

# Base de Datos (si tienes PostgreSQL)
DATABASE_URL=postgresql://usuario:password@localhost:5432/codekit_pro

# Seguridad
JWT_SECRET=tu-secreto-minimo-32-caracteres-aqui
ADMIN_PASSWORD=941259018a

# Webhook (para CI/CD)
WEBHOOK_SECRET=Oe6OTVBc4Nh2UZ0XwdIuRlek10vpJdacKtXN8N6GsI8=
```

**Para generar JWT_SECRET:**
```bash
openssl rand -base64 32
```

**Guardar:** `Ctrl+O`, `Enter`, `Ctrl+X` (en nano)

---

## 🗄️ Paso 5: Configurar Base de Datos (Opcional pero Recomendado)

### 5.1 Si NO tienes PostgreSQL configurado:

La aplicación funcionará con MemStorage (datos en memoria, se pierden al reiniciar).

### 5.2 Si SÍ tienes PostgreSQL:

```bash
# Verificar conexión
npm run db:check

# Crear tablas
npm run db:push

# Si tienes datos previos, migrarlos
npm run db:migrate
```

---

## 📦 Paso 6: Instalar Dependencias

```bash
cd /var/www/codekit-pro
npm ci
```

Esto instalará todas las dependencias necesarias.

---

## 🏗️ Paso 7: Build de la Aplicación

```bash
npm run build
```

Esto creará:
- `dist/index.cjs` (servidor)
- `dist/public/` (frontend)

---

## 🚀 Paso 8: Iniciar la Aplicación

### Opción A: Con PM2 (Recomendado)

```bash
# Crear archivo de configuración PM2
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'codekit-pro-8604',
    script: './dist/index.cjs',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 8604
    },
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    max_memory_restart: '1G',
    watch: false
  }]
};
EOF

# Crear directorio de logs
mkdir -p logs

# Iniciar con PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup  # Para iniciar automáticamente al reiniciar el servidor
```

### Opción B: Usar Script de Despliegue

```bash
# Dar permisos de ejecución
chmod +x scripts/deploy.sh

# Ejecutar despliegue
npm run deploy
```

---

## ✅ Paso 9: Verificar que Funciona

### 9.1 Verificar que la Aplicación Está Corriendo

```bash
# Ver estado de PM2
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

### 9.2 Verificar desde el Navegador

Abre en tu navegador:
- `http://207.180.226.141:8604` (si el puerto está abierto)
- O `https://codekitpro.app` (si Nginx Proxy Manager está configurado)

---

## 🔧 Paso 10: Configurar Nginx Proxy Manager

### 10.1 Acceder al Panel

1. Ve a: `http://207.180.226.141:81`
2. Login con tus credenciales

### 10.2 Crear Proxy Host

1. Click en **Proxy Hosts** → **Add Proxy Host**
2. **Details:**
   - **Domain Names:** `codekitpro.app`
   - **Scheme:** `http`
   - **Forward Hostname/IP:** `localhost` o `127.0.0.1`
   - **Forward Port:** `8604`
   - **Cache Assets:** ✅ (opcional)
   - **Block Common Exploits:** ✅
   - **Websockets Support:** ✅ (si usas WebSockets)

3. **SSL:**
   - Click en la pestaña **SSL**
   - Selecciona **Request a new SSL Certificate**
   - Marca **Force SSL** y **HTTP/2 Support**
   - Agrega tu email
   - Acepta los términos
   - Click **Save**

### 10.3 Verificar

```bash
curl https://codekitpro.app/health
```

---

## 🔄 Paso 11: Comandos Útiles

### Ver Logs

```bash
pm2 logs codekit-pro-8604
pm2 logs codekit-pro-8604 --lines 100  # Últimas 100 líneas
```

### Reiniciar Aplicación

```bash
pm2 restart codekit-pro-8604
```

### Detener Aplicación

```bash
pm2 stop codekit-pro-8604
```

### Actualizar Código

```bash
cd /var/www/codekit-pro
git pull origin main
npm ci
npm run build
pm2 restart codekit-pro-8604
```

---

## 🐛 Troubleshooting

### Error: "Port 8604 already in use"

```bash
# Ver qué proceso está usando el puerto
sudo lsof -i :8604

# Detener el proceso
pm2 stop codekit-pro-8604
# O
kill -9 PID_DEL_PROCESO
```

### Error: "Cannot find module"

```bash
# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm ci
npm run build
```

### Error: "Database connection failed"

```bash
# Verificar que PostgreSQL está corriendo
sudo systemctl status postgresql

# Verificar DATABASE_URL en .env
cat .env | grep DATABASE_URL

# Probar conexión
npm run db:check
```

### La Aplicación No Responde

```bash
# Ver logs detallados
pm2 logs codekit-pro-8604 --err

# Verificar que está corriendo
pm2 status

# Verificar puerto
netstat -tlnp | grep 8604
```

---

## 📋 Checklist de Despliegue

- [ ] Conectado al servidor por SSH
- [ ] Node.js instalado (v20+)
- [ ] PM2 instalado
- [ ] Git instalado
- [ ] Repositorio clonado en `/var/www/codekit-pro`
- [ ] Archivo `.env` creado con todas las variables
- [ ] Dependencias instaladas (`npm ci`)
- [ ] Build completado (`npm run build`)
- [ ] Aplicación iniciada con PM2
- [ ] Health check funciona (`curl http://localhost:8604/health`)
- [ ] Nginx Proxy Manager configurado
- [ ] SSL/HTTPS funcionando
- [ ] Aplicación accesible en `https://codekitpro.app`

---

## 🎉 ¡Listo!

Una vez completado el checklist, tu aplicación debería estar:
- ✅ Corriendo en el servidor
- ✅ Accesible en `https://codekitpro.app`
- ✅ Con SSL/HTTPS configurado
- ✅ Lista para recibir despliegues automáticos

---

## 🔄 Próximo Paso: Configurar Webhook

Una vez que la aplicación esté desplegada, sigue las instrucciones en:
- `RESUMEN_CONFIGURACION.md` - Para configurar el webhook de CI/CD

---

**¿Necesitas ayuda?** Revisa los logs con `pm2 logs codekit-pro-8604` para ver errores específicos.

