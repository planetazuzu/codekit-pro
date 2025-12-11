# 🎯 Comando Exacto para el Servidor

## ⚠️ El Servidor Tiene Código Antiguo

El error `Invalid option in build() call: "exclude"` significa que el servidor tiene código antiguo.

---

## ✅ Solución: Actualizar Código

Ejecuta **exactamente esto** en el servidor:

```bash
cd /var/www/codekit-pro
git pull origin main
npm run build
```

Si después de `git pull` todavía aparece el error, verifica:

```bash
# Ver el contenido del archivo build.ts
cat script/build.ts | grep -A 15 "await esbuild"

# Debería mostrar (sin "exclude"):
#   await esbuild({
#     entryPoints: ["server/index.ts"],
#     platform: "node",
#     bundle: true,
#     format: "cjs",
#     outfile: "dist/index.cjs",
#     define: {
#       "process.env.NODE_ENV": '"production"',
#     },
#     minify: true,
#     external: externals,
#     logLevel: "info",
#   });
```

Si todavía tiene `exclude`, fuerza la actualización:

```bash
git fetch origin
git reset --hard origin/main
npm run build
```

---

## 🚀 Después del Build Exitoso

```bash
# Crear ecosystem.config.cjs si no existe
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

# Crear logs
mkdir -p logs

# Iniciar
pm2 start ecosystem.config.cjs
pm2 save

# Verificar
pm2 status
curl http://localhost:8604/health
```

---

## 🔍 Verificar que el Código Está Actualizado

```bash
# Verificar que NO tiene "exclude"
grep -n "exclude" script/build.ts

# Si no muestra nada, está bien
# Si muestra algo, el código está desactualizado
```

---

**El código correcto ya está en GitHub. Solo necesitas hacer `git pull origin main` en el servidor.**

