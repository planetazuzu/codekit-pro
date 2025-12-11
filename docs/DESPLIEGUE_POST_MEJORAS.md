# Checklist de Despliegue - Post Mejoras Incrementales

## ⚠️ IMPORTANTE: Cambios Requeridos Antes del Despliegue

### 1. Aplicar Índices de Base de Datos

Los nuevos índices deben aplicarse ANTES del despliegue:

```bash
npm run db:push
```

**Índices que se crearán:**
- `prompts_user_id_idx`, `prompts_status_idx`, `prompts_created_at_idx`, `prompts_user_id_status_idx`
- `snippets_user_id_idx`, `snippets_status_idx`, `snippets_created_at_idx`, `snippets_user_id_status_idx`
- `links_user_id_idx`, `links_status_idx`, `links_created_at_idx`, `links_user_id_status_idx`
- `guides_user_id_idx`, `guides_status_idx`, `guides_created_at_idx`, `guides_user_id_status_idx`

### 2. Verificar Variables de Entorno

Asegúrate de que tu `.env` tenga todas las variables necesarias:

```bash
# Database
DATABASE_URL=postgresql://usuario:password@localhost:5432/codekit_pro

# Server
PORT=8604
NODE_ENV=production
JWT_SECRET=tu-secret-key-segura

# CORS
ALLOWED_ORIGINS=https://codekitpro.app,https://www.codekitpro.app
API_URL=https://codekitpro.app

# Stripe (si aplica)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRODUCT_PRICE_ID_PRO=price_...
STRIPE_PRODUCT_PRICE_ID_ENTERPRISE=price_...

# Admin
ADMIN_USERNAME=admin
ADMIN_PASSWORD=941259018a
```

### 3. Build del Proyecto

```bash
npm run build
```

Esto compilará:
- ✅ Frontend React (Vite)
- ✅ Backend TypeScript
- ✅ Verificará tipos TypeScript

### 4. Verificar que el Build Funciona

```bash
# En modo desarrollo para verificar
npm run dev
```

Luego verifica:
- ✅ Frontend carga correctamente
- ✅ API responde en `/api/health`
- ✅ Base de datos conecta correctamente
- ✅ No hay errores en consola

---

## Proceso de Despliegue

### Opción 1: Despliegue Automático (Recomendado)

```bash
npm run deploy
```

O directamente:

```bash
./scripts/deploy.sh
```

### Opción 2: Despliegue Manual

```bash
# 1. Aplicar índices de BD
npm run db:push

# 2. Build
npm run build

# 3. Iniciar con PM2
pm2 start dist/server/index.js --name codekit-pro --update-env

# 4. Verificar logs
pm2 logs codekit-pro
```

---

## Verificación Post-Despliegue

### 1. Health Check

```bash
curl https://codekitpro.app/api/health
```

Debería responder:
```json
{
  "status": "ok",
  "timestamp": "..."
}
```

### 2. Verificar Índices en BD

```sql
-- Conectar a PostgreSQL
psql -U planetazuzu -d codekit_pro

-- Verificar índices creados
SELECT 
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename IN ('prompts', 'snippets', 'links', 'guides')
ORDER BY tablename, indexname;
```

Deberías ver los 12 índices nuevos.

### 3. Verificar Frontend

- ✅ Abre `https://codekitpro.app`
- ✅ Verifica que carga sin errores
- ✅ Prueba crear/editar contenido
- ✅ Verifica que el Service Worker se registra (en DevTools > Application > Service Workers)

### 4. Verificar Performance

```bash
# Verificar queries lentas en PostgreSQL
SELECT 
    query,
    calls,
    total_time,
    mean_time
FROM pg_stat_statements
WHERE query LIKE '%prompts%' OR query LIKE '%snippets%'
ORDER BY mean_time DESC
LIMIT 10;
```

Los índices deberían mejorar significativamente las queries por `userId` y `status`.

---

## Rollback (Si algo sale mal)

Si necesitas hacer rollback:

```bash
# 1. Detener aplicación
pm2 stop codekit-pro

# 2. Volver a commit anterior
git checkout HEAD~1

# 3. Rebuild
npm run build

# 4. Reiniciar
pm2 restart codekit-pro
```

**NOTA**: Los índices de BD NO se eliminarán automáticamente. Si necesitas eliminarlos:

```sql
-- ⚠️ SOLO si es necesario
DROP INDEX IF EXISTS prompts_user_id_idx;
DROP INDEX IF EXISTS prompts_status_idx;
DROP INDEX IF EXISTS prompts_created_at_idx;
DROP INDEX IF EXISTS prompts_user_id_status_idx;
-- ... (repetir para snippets, links, guides)
```

---

## Troubleshooting

### Error: "Index already exists"

Los índices ya existen, puedes continuar. No es un error crítico.

### Error: "Cannot find module '@shared/constants'"

Asegúrate de que el build incluye el directorio `shared/`:

```bash
# Verificar que shared/ está en dist/
ls -la dist/shared/
```

### Error: "Service Worker registration failed"

Esto es normal en desarrollo. Solo funciona en producción (`NODE_ENV=production`).

---

## Notas Finales

✅ **Todas las mejoras son retrocompatibles** - No hay breaking changes
✅ **Los índices mejoran performance** - Pero no son críticos para funcionamiento
✅ **Service Worker es opcional** - La app funciona sin él

**Fecha**: 2024
**Versión**: Post Mejoras Incrementales

