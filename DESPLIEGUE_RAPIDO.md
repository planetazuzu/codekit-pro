# 🚀 Despliegue Rápido - CodeKit Pro

## Pre-requisitos ✅

- ✅ Node.js instalado
- ✅ PostgreSQL configurado y corriendo
- ✅ Variables de entorno en `.env`
- ✅ PM2 instalado (opcional pero recomendado)

## Despliegue en 3 Pasos

### 1️⃣ Aplicar Índices de BD (Nuevo - Requerido)

```bash
npm run db:push
```

Esto aplicará los 12 índices nuevos para optimizar queries.

### 2️⃣ Build del Proyecto

```bash
npm run build
```

### 3️⃣ Desplegar

```bash
npm run deploy
```

O manualmente:

```bash
./scripts/deploy.sh
```

---

## Verificación Post-Despliegue

```bash
# Health check
curl http://localhost:8604/api/health

# Ver logs
pm2 logs codekit-pro-8604

# Ver estado
pm2 status
```

---

## Si algo falla

```bash
# Ver logs detallados
pm2 logs codekit-pro-8604 --lines 100

# Reiniciar
pm2 restart codekit-pro-8604

# Detener
pm2 stop codekit-pro-8604
```

---

## URLs

- **Local**: http://localhost:8604
- **Producción**: https://codekitpro.app
- **Health**: http://localhost:8604/api/health

---

**Nota**: El script de despliegue ahora aplica automáticamente los índices de BD antes del build.

