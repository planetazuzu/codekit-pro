# 🔄 Actualizar Código en Docker

## 🚨 Problema

Docker está usando código antiguo de GitHub que tiene `exclude` en `script/build.ts`.

---

## ✅ Solución: Actualizar Código en el Contenedor

El código correcto ya está en GitHub. Solo necesitas actualizar:

### Opción 1: Reconstruir desde GitHub (Recomendado)

```bash
cd /var/www/codekit-pro

# Actualizar código desde GitHub
git pull origin main

# Reconstruir imagen Docker
docker-compose build --no-cache

# Reiniciar
docker-compose up -d
```

### Opción 2: Editar Directamente en el Contenedor (Temporal)

```bash
# Entrar al contenedor
docker-compose exec app sh

# Editar el archivo
cd /app
nano script/build.ts

# Buscar y eliminar estas líneas:
#     // Exclude vite.config.ts from server build
#     exclude: ["vite.config.ts", "**/vite.config.ts"],

# Guardar y salir
# Luego ejecutar build manualmente
npm run build
exit

# Reiniciar contenedor
docker-compose restart app
```

---

## 🚀 Comando Rápido

```bash
cd /var/www/codekit-pro && \
git pull origin main && \
docker-compose build --no-cache && \
docker-compose up -d && \
sleep 10 && \
docker-compose exec app npm run db:push
```

---

**El código correcto ya está en GitHub. Solo necesitas hacer `git pull` y reconstruir Docker.**

