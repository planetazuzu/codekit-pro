# 🔧 Comandos para Corregir el Build en el Servidor

## 🚨 Problema Actual

El servidor tiene código antiguo con la opción `exclude` que no es válida en esbuild.

---

## ✅ Solución: Actualizar Código y Rebuild

Ejecuta estos comandos **en el servidor**:

```bash
cd /var/www/codekit-pro

# 1. Actualizar código desde GitHub
git pull origin main

# 2. Verificar que script/build.ts está correcto
cat script/build.ts | grep -A 10 "await esbuild"

# 3. Rebuild
npm run build

# 4. Crear ecosystem.config.js si no existe
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

# 5. Crear directorio de logs
mkdir -p logs

# 6. Iniciar con PM2
pm2 start ecosystem.config.js
pm2 save

# 7. Verificar
pm2 status
pm2 logs codekit-pro-8604
curl http://localhost:8604/health
```

---

## 🔄 Si el Build Sigue Fallando

Si después de `git pull` todavía hay problemas:

```bash
# Limpiar todo y empezar de nuevo
cd /var/www/codekit-pro
rm -rf node_modules dist package-lock.json
npm ci --legacy-peer-deps
npm run build
pm2 restart codekit-pro-8604
```

---

## ✅ Verificación Final

```bash
# Ver estado
pm2 status

# Ver logs
pm2 logs codekit-pro-8604 --lines 50

# Health check
curl http://localhost:8604/health

# Verificar que el puerto está escuchando
netstat -tlnp | grep 8604
```

---

**El código correcto ya está en GitHub. Solo necesitas hacer `git pull` en el servidor.**

