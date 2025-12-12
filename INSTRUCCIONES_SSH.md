# 🔐 Instrucciones para Conectarse por SSH y Desplegar

## 📋 Paso 1: Conectarse al Servidor

### Opción A: Desde tu Terminal Local

```bash
ssh usuario@207.180.226.141
```

**Reemplaza `usuario` con:**
- `root` (si tienes acceso root)
- `ubuntu` (si es servidor Ubuntu)
- `deploy` (si tienes usuario específico)
- O el usuario que te hayan dado

### Opción B: Si No Sabes el Usuario

Prueba estos comandos uno por uno:

```bash
ssh root@207.180.226.141
# O
ssh ubuntu@207.180.226.141
# O
ssh admin@207.180.226.141
```

### Opción C: Si Pide Contraseña

Te pedirá la contraseña. Escríbela (no se verá mientras escribes) y presiona Enter.

### Opción D: Si Usas Clave SSH

Si tienes una clave SSH configurada:

```bash
ssh -i /ruta/a/tu/clave.pem usuario@207.180.226.141
```

---

## 📥 Paso 2: Una Vez Conectado, Ejecutar el Script

### Opción A: Descargar y Ejecutar el Script

```bash
# Descargar el script
curl -o deploy-server.sh https://raw.githubusercontent.com/planetazuzu/codekit-pro/main/scripts/deploy-server.sh

# Dar permisos
chmod +x deploy-server.sh

# Ejecutar
bash deploy-server.sh
```

### Opción B: Clonar el Repositorio y Ejecutar

```bash
# Clonar repositorio
git clone https://github.com/planetazuzu/codekit-pro.git /tmp/codekit-pro

# Ir al directorio
cd /tmp/codekit-pro

# Ejecutar script
bash scripts/deploy-server.sh
```

### Opción C: Ejecutar Comandos Manualmente

Si prefieres hacerlo paso a paso, sigue `GUIA_DESPLIEGUE_SERVIDOR.md`

---

## 🔧 Paso 3: Configurar Variables de Entorno

El script creará un `.env` básico, pero deberías editarlo:

```bash
cd /var/www/codekit-pro
nano .env
```

**Variables importantes:**
```env
NODE_ENV=production
PORT=8604
JWT_SECRET=tu-secreto-generado
ADMIN_PASSWORD=941259018a
WEBHOOK_SECRET=Oe6OTVBc4Nh2UZ0XwdIuRlek10vpJdacKtXN8N6GsI8=

# Si tienes PostgreSQL:
DATABASE_URL=postgresql://usuario:password@localhost:5432/codekit_pro
```

**Guardar:** `Ctrl+O`, `Enter`, `Ctrl+X`

---

## ✅ Paso 4: Verificar Despliegue

```bash
# Ver estado
pm2 status

# Ver logs
pm2 logs codekit-pro-8604

# Health check
curl http://localhost:8604/health
```

---

## 🐛 Si Hay Problemas de Conexión SSH

### Error: "Permission denied"

**Causas posibles:**
1. Usuario incorrecto
2. Contraseña incorrecta
3. Clave SSH incorrecta
4. Servidor no permite conexiones SSH

**Soluciones:**
- Verifica el usuario con quien te dieron acceso
- Verifica la contraseña
- Si usas clave SSH, verifica la ruta y permisos: `chmod 600 /ruta/a/clave.pem`

### Error: "Connection refused"

**Causas:**
- Puerto SSH (22) bloqueado por firewall
- Servicio SSH no está corriendo

**Soluciones:**
- Verifica con el proveedor del servidor
- Verifica firewall: `sudo ufw status`

### Error: "Host key verification failed"

```bash
# Limpiar clave conocida
ssh-keygen -R 207.180.226.141

# Intentar de nuevo
ssh usuario@207.180.226.141
```

---

## 📝 Comandos Rápidos Una Vez Conectado

```bash
# Ver información del sistema
uname -a
whoami
pwd

# Verificar Node.js
node -v
npm -v

# Verificar Git
git --version

# Ver procesos corriendo
ps aux | grep node

# Ver puertos en uso
netstat -tlnp | grep 8604
```

---

## 🔄 Actualizar Código Después

Una vez desplegado, para actualizar:

```bash
cd /var/www/codekit-pro
git pull origin main
npm ci
npm run build
pm2 restart codekit-pro-8604
```

---

## 📚 Archivos de Referencia

- `GUIA_DESPLIEGUE_SERVIDOR.md` - Guía completa paso a paso
- `COMANDOS_RAPIDOS_SERVIDOR.md` - Comandos de referencia rápida
- `scripts/deploy-server.sh` - Script automatizado completo

---

## 🆘 ¿Necesitas Ayuda?

Si tienes problemas:
1. Verifica que tienes acceso SSH al servidor
2. Verifica que tienes permisos de sudo (si es necesario)
3. Revisa los logs: `pm2 logs codekit-pro-8604`
4. Verifica el estado: `pm2 status`

---

**¿Listo para conectarte?** Ejecuta: `ssh usuario@207.180.226.141`


