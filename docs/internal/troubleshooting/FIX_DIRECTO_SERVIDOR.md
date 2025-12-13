# 🔧 Fix Directo en el Servidor

## 🚨 Problema

El servidor tiene código antiguo con `exclude` en `script/build.ts` línea 49.

---

## ✅ Solución Directa: Editar el Archivo en el Servidor

Ejecuta esto **en el servidor**:

```bash
cd /var/www/codekit-pro

# Ver qué tiene actualmente
cat script/build.ts | grep -A 15 "await esbuild"

# Si muestra "exclude", edítalo directamente:
nano script/build.ts
```

**Busca la línea que dice `exclude:` y elimínala.** Debería verse así (sin `exclude`):

```typescript
  await esbuild({
    entryPoints: ["server/index.ts"],
    platform: "node",
    bundle: true,
    format: "cjs",
    outfile: "dist/index.cjs",
    define: {
      "process.env.NODE_ENV": '"production"',
    },
    minify: true,
    external: externals,
    logLevel: "info",
  });
```

**Guardar:** `Ctrl+O`, `Enter`, `Ctrl+X`

---

## 🚀 Alternativa: Reemplazar el Archivo Completo

Si prefieres reemplazar todo el archivo:

```bash
cd /var/www/codekit-pro

# Descargar la versión correcta desde GitHub
curl -o script/build.ts https://raw.githubusercontent.com/planetazuzu/codekit-pro/main/script/build.ts

# Verificar que está correcto
cat script/build.ts | grep -A 15 "await esbuild"

# No debe mostrar "exclude"
```

---

## 🔄 Después de Corregir

```bash
# Rebuild
npm run build

# Si funciona, crear ecosystem.config.cjs
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

mkdir -p logs
pm2 start ecosystem.config.cjs
pm2 save
pm2 status
```

---

## 🎯 Comando Todo-en-Uno

```bash
cd /var/www/codekit-pro && \
curl -o script/build.ts https://raw.githubusercontent.com/planetazuzu/codekit-pro/main/script/build.ts && \
npm run build && \
cat > ecosystem.config.cjs << 'EOF'
module.exports = {
  apps: [{
    name: 'codekit-pro-8604',
    script: './dist/index.cjs',
    instances: 1,
    exec_mode: 'fork',
    env: { NODE_ENV: 'production', PORT: 8604 },
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
mkdir -p logs && pm2 start ecosystem.config.cjs && pm2 save && pm2 status
```

---

**Esta solución descarga directamente el archivo correcto desde GitHub.**

