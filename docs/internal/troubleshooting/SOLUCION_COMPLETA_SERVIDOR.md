# 🔧 Solución Completa para el Servidor

## 🚨 Problemas Encontrados

1. ✅ `ecosystem.config.js` debe ser `.cjs` (proyecto usa ES modules)
2. ✅ Faltan dependencias (`tsx` no encontrado)
3. ✅ `package-lock.json` fue eliminado

---

## ✅ Solución Paso a Paso

Ejecuta estos comandos **en el servidor** en orden:

### Paso 1: Actualizar Código

```bash
cd /var/www/codekit-pro
git pull origin main
```

### Paso 2: Reinstalar Dependencias

```bash
# Instalar todas las dependencias (incluye devDependencies para tsx)
npm install --legacy-peer-deps
```

### Paso 3: Crear ecosystem.config.cjs

```bash
cat > ecosystem.config.cjs << 'EOF'
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
```

### Paso 4: Crear Directorio de Logs

```bash
mkdir -p logs
```

### Paso 5: Build

```bash
npm run build
```

### Paso 6: Iniciar con PM2

```bash
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup  # Para iniciar al arrancar el servidor
```

### Paso 7: Verificar

```bash
pm2 status
pm2 logs codekit-pro-8604
curl http://localhost:8604/health
```

---

## 🚀 Comando Todo-en-Uno

Copia y pega esto completo:

```bash
cd /var/www/codekit-pro && \
git pull origin main && \
npm install --legacy-peer-deps && \
cat > ecosystem.config.cjs << 'EOF'
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
mkdir -p logs && \
npm run build && \
pm2 start ecosystem.config.cjs && \
pm2 save && \
echo "✅ Despliegue completado" && \
pm2 status
```

---

## 🔍 Si Algo Falla

### Error: "tsx: not found"

```bash
npm install --legacy-peer-deps
```

### Error: "ecosystem.config.js malformated"

Asegúrate de que el archivo se llama `ecosystem.config.cjs` (con `.cjs`)

### Error de Build

```bash
# Ver logs detallados
npm run build 2>&1 | tee build.log

# Si falla, ver el log
cat build.log
```

### PM2 No Inicia

```bash
# Verificar que el archivo existe
ls -la ecosystem.config.cjs

# Verificar contenido
cat ecosystem.config.cjs

# Intentar iniciar manualmente
pm2 start ./dist/index.cjs --name codekit-pro-8604 --env production
```

---

## ✅ Verificación Final

```bash
# Estado de PM2
pm2 status

# Logs
pm2 logs codekit-pro-8604 --lines 50

# Health check
curl http://localhost:8604/health

# Verificar puerto
netstat -tlnp | grep 8604
```

---

**Los scripts ya están actualizados en GitHub para usar `.cjs`. Solo necesitas hacer `git pull` y seguir los pasos.**

