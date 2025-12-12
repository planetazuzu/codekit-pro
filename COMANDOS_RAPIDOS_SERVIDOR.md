# ⚡ Comandos Rápidos para el Servidor

## 🔗 Conectarse al Servidor

```bash
ssh usuario@207.180.226.141
```

---

## 📦 Instalación Inicial (Solo Primera Vez)

```bash
# 1. Instalar Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 2. Instalar PM2
sudo npm install -g pm2

# 3. Instalar Git
sudo apt-get update
sudo apt-get install -y git

# 4. Crear directorio
sudo mkdir -p /var/www/codekit-pro
sudo chown $USER:$USER /var/www/codekit-pro
cd /var/www/codekit-pro

# 5. Clonar repositorio
git clone https://github.com/planetazuzu/codekit-pro.git .

# 6. Crear .env
nano .env
# (Agregar variables de entorno)

# 7. Instalar dependencias
npm ci

# 8. Build
npm run build

# 9. Iniciar con PM2
pm2 start ecosystem.config.js
pm2 save
```

---

## 🔄 Actualizar Código (Cada Vez que Haces Cambios)

```bash
cd /var/www/codekit-pro
git pull origin main
npm ci
npm run build
pm2 restart codekit-pro-8604
```

---

## 📊 Ver Estado y Logs

```bash
# Estado de PM2
pm2 status

# Logs en tiempo real
pm2 logs codekit-pro-8604

# Últimas 100 líneas
pm2 logs codekit-pro-8604 --lines 100

# Solo errores
pm2 logs codekit-pro-8604 --err
```

---

## 🔧 Reiniciar/Detener

```bash
# Reiniciar
pm2 restart codekit-pro-8604

# Detener
pm2 stop codekit-pro-8604

# Iniciar
pm2 start codekit-pro-8604
```

---

## ✅ Verificar

```bash
# Health check local
curl http://localhost:8604/health

# Health check desde dominio
curl https://codekitpro.app/health

# Verificar puerto
netstat -tlnp | grep 8604
```

---

## 🗄️ Base de Datos

```bash
# Verificar conexión
npm run db:check

# Crear/actualizar tablas
npm run db:push

# Migrar datos
npm run db:migrate
```

---

## 🔐 Variables de Entorno

```bash
# Ver .env
cat .env

# Editar .env
nano .env

# Agregar variable
echo "NUEVA_VAR=valor" >> .env

# Reiniciar después de cambios
pm2 restart codekit-pro-8604
```

---

## 🐛 Troubleshooting Rápido

```bash
# Ver qué está usando el puerto
sudo lsof -i :8604

# Ver procesos de Node
ps aux | grep node

# Limpiar y reinstalar
rm -rf node_modules package-lock.json
npm ci
npm run build
pm2 restart codekit-pro-8604
```

---

**Guía Completa:** Ver `GUIA_DESPLIEGUE_SERVIDOR.md`


