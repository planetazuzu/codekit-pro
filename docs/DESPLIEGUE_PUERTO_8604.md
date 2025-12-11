# 🚀 Despliegue en Puerto 8604 - CodeKit Pro

## ✅ Checklist Pre-Despliegue

### 1. Variables de Entorno (.env)

Asegúrate de tener estas variables configuradas:

```bash
# Puerto de la aplicación
PORT=8604

# Entorno
NODE_ENV=production

# Base de Datos PostgreSQL (OBLIGATORIO)
DATABASE_URL=postgresql://planetazuzu:941259018a@localhost:5432/codekit_pro

# Seguridad (OBLIGATORIO)
JWT_SECRET=JWHLdT2/AuV0w10CCweT2ajKvq6ZsPAb/p4AVD1+qtQ=

# Admin (opcional pero recomendado)
ADMIN_PASSWORD=tu-password-admin-seguro
```

### 2. Verificaciones Previas

- [ ] PostgreSQL está corriendo: `sudo systemctl status postgresql`
- [ ] Base de datos existe: `psql -U planetazuzu -d codekit_pro -c "SELECT 1;"`
- [ ] Tablas creadas: `npm run db:push` (si es necesario)
- [ ] Datos iniciales cargados: Verificar que hay prompts, snippets, etc.

### 3. Build de la Aplicación

```bash
# Instalar dependencias
npm install

# Verificar tipos TypeScript
npm run check

# Construir aplicación
npm run build

# Verificar que dist/ existe
ls -la dist/
```

### 4. PM2 (Recomendado para producción)

```bash
# Instalar PM2 globalmente
npm install -g pm2

# Verificar instalación
pm2 --version
```

---

## 🚀 Método 1: Despliegue Automático con Script

El proyecto incluye un script de despliegue que automatiza todo:

```bash
# Ejecutar script de despliegue
npm run deploy
```

Este script:
- ✅ Verifica Node.js y npm
- ✅ Verifica variables de entorno
- ✅ Instala dependencias
- ✅ Verifica TypeScript
- ✅ Construye la aplicación
- ✅ Verifica conexión a base de datos
- ✅ Instala/configura PM2
- ✅ Inicia la aplicación en puerto 8604

---

## 🚀 Método 2: Despliegue Manual

### Paso 1: Preparar el entorno

```bash
# Asegúrate de estar en el directorio del proyecto
cd "/home/planetazuzu/CodeKit Pro"

# Verificar que .env tiene PORT=8604
grep PORT .env
```

### Paso 2: Construir la aplicación

```bash
npm install
npm run build
```

### Paso 3: Verificar que el build fue exitoso

```bash
# Debe existir dist/index.cjs
test -f dist/index.cjs && echo "✅ Build exitoso" || echo "❌ Build falló"

# Debe existir dist/public/
test -d dist/public && echo "✅ Frontend build exitoso" || echo "❌ Frontend build falló"
```

### Paso 4: Verificar base de datos

```bash
# Verificar conexión
npm run db:check

# Si es necesario, actualizar esquema
npm run db:push
```

### Paso 5: Iniciar con PM2

```bash
# Crear configuración PM2
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'codekit-pro-8604',
    script: './dist/index.cjs',
    cwd: '/home/planetazuzu/CodeKit Pro',
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
    max_restarts: 10,
    min_uptime: '10s',
    max_memory_restart: '1G'
  }]
};
EOF

# Crear directorio de logs
mkdir -p logs

# Detener aplicación anterior si existe
pm2 stop codekit-pro-8604 || true
pm2 delete codekit-pro-8604 || true

# Iniciar aplicación
pm2 start ecosystem.config.js

# Guardar configuración PM2
pm2 save

# Ver estado
pm2 status
pm2 logs codekit-pro-8604 --lines 50
```

### Paso 6: Verificar que está corriendo

```bash
# Verificar que el puerto está en uso
lsof -i :8604

# Probar endpoint de salud
curl http://localhost:8604/health

# Ver logs en tiempo real
pm2 logs codekit-pro-8604
```

---

## 🔧 Comandos Útiles PM2

```bash
# Ver estado
pm2 status

# Ver logs
pm2 logs codekit-pro-8604

# Reiniciar aplicación
pm2 restart codekit-pro-8604

# Detener aplicación
pm2 stop codekit-pro-8604

# Eliminar aplicación
pm2 delete codekit-pro-8604

# Monitoreo en tiempo real
pm2 monit
```

---

## 🌐 Acceso a la Aplicación

Una vez desplegada, la aplicación estará disponible en:

- **Local**: `http://localhost:8604`
- **Red local**: `http://TU_IP:8604` (reemplaza TU_IP con la IP de tu servidor)

---

## 🔍 Verificación Post-Despliegue

Verifica que todo funciona:

- [ ] ✅ Página principal carga: `http://localhost:8604`
- [ ] ✅ Endpoint de salud: `curl http://localhost:8604/health`
- [ ] ✅ Prompts cargan: `http://localhost:8604/prompts`
- [ ] ✅ Snippets cargan: `http://localhost:8604/snippets`
- [ ] ✅ API funciona: `curl http://localhost:8604/api/prompts`
- [ ] ✅ Base de datos conectada (ver logs de PM2)

---

## 🆘 Solución de Problemas

### Puerto 8604 ya en uso

```bash
# Ver qué proceso usa el puerto
lsof -i :8604

# Detener proceso
kill -9 $(lsof -ti:8604)

# O usar PM2
pm2 stop codekit-pro-8604
```

### Error de conexión a base de datos

```bash
# Verificar que PostgreSQL está corriendo
sudo systemctl status postgresql

# Verificar conexión manualmente
psql -U planetazuzu -d codekit_pro -c "SELECT 1;"

# Verificar DATABASE_URL en .env
grep DATABASE_URL .env
```

### Build falla

```bash
# Limpiar y reconstruir
rm -rf dist node_modules
npm install
npm run build
```

### La aplicación no inicia

```bash
# Ver logs detallados
pm2 logs codekit-pro-8604 --lines 100

# Verificar variables de entorno
pm2 env codekit-pro-8604

# Probar ejecución directa
NODE_ENV=production PORT=8604 node dist/index.cjs
```

---

## 📝 Notas Importantes

1. **Puerto 8604**: Asegúrate de que el firewall permite conexiones en este puerto
2. **Base de datos**: Los datos son persistentes gracias a PostgreSQL
3. **PM2**: Mantiene la aplicación corriendo y la reinicia automáticamente si falla
4. **Logs**: Los logs están en `./logs/pm2-*.log` y también puedes verlos con `pm2 logs`

---

## ✅ Estado Actual

- ✅ PostgreSQL configurado y funcionando
- ✅ Base de datos con datos iniciales (prompts, snippets, links, guides)
- ✅ Script de despliegue disponible (`npm run deploy`)
- ✅ Configuración para puerto 8604 lista

**¡Listo para desplegar!** 🎉
