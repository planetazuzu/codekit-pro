# 🔍 Diagnóstico de Errores 500 en la API

## Errores Reportados

Los siguientes endpoints están devolviendo errores 500:
- `/api/snippets`
- `/api/prompts`
- `/api/links`
- `/api/guides`
- `/api/analytics/view`

## Pasos para Diagnosticar

### 1. Ver logs del contenedor Docker

```bash
cd /var/www/codekit-pro

# Ver logs en tiempo real
docker compose logs -f app

# Ver últimas 100 líneas
docker compose logs --tail=100 app

# Ver solo errores
docker compose logs app 2>&1 | grep -i error
```

### 2. Verificar conexión a la base de datos

```bash
# Verificar que PostgreSQL esté corriendo
docker compose ps postgres

# Ver logs de PostgreSQL
docker compose logs --tail=50 postgres

# Probar conexión desde el contenedor de la app
docker compose exec app node -e "
const { getDatabase } = require('./dist/config/database');
(async () => {
  try {
    const db = getDatabase();
    const result = await db.execute('SELECT 1 as test');
    console.log('✅ Conexión exitosa:', result);
  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
  }
})();
"
```

### 3. Verificar variables de entorno

```bash
# Ver variables de entorno del contenedor
docker compose exec app env | grep -E "DATABASE_URL|NODE_ENV|PORT"

# Verificar que DATABASE_URL esté correcta
docker compose exec app printenv DATABASE_URL
```

### 4. Verificar que las tablas existan

```bash
# Conectarse a PostgreSQL
docker compose exec postgres psql -U codekit_user -d codekit_pro

# Dentro de psql, ejecutar:
\dt
# Deberías ver tablas como: prompts, snippets, links, guides, users, etc.

# Si no existen, salir y ejecutar:
exit

# Ejecutar migraciones
docker compose exec app npm run db:push
```

### 5. Probar endpoints manualmente

```bash
# Desde el servidor
curl -v http://localhost:8604/api/prompts
curl -v http://localhost:8604/api/snippets
curl -v http://localhost:8604/api/links
curl -v http://localhost:8604/api/guides

# Ver respuesta completa con errores
curl -v http://localhost:8604/api/prompts 2>&1 | head -30
```

## Posibles Causas

### 1. Base de datos no inicializada
**Solución:**
```bash
cd /var/www/codekit-pro
docker compose exec app npm run db:push
```

### 2. DATABASE_URL incorrecta
**Solución:**
Verificar que en `.env` esté:
```
DATABASE_URL=postgresql://codekit_user:codekit_password@postgres:5432/codekit_pro
```

### 3. Tablas no creadas
**Solución:**
```bash
docker compose exec app npm run db:push
```

### 4. Error en el código del servidor
**Solución:**
Revisar logs para ver el stack trace completo del error.

## Comandos de Verificación Rápida

```bash
cd /var/www/codekit-pro && \
echo "=== ESTADO DE CONTENEDORES ===" && \
docker compose ps && \
echo "" && \
echo "=== LOGS DE ERRORES (últimas 50 líneas) ===" && \
docker compose logs --tail=50 app 2>&1 | grep -i -E "error|fail|500" && \
echo "" && \
echo "=== VERIFICAR DATABASE_URL ===" && \
docker compose exec app printenv DATABASE_URL && \
echo "" && \
echo "=== PROBAR ENDPOINT ===" && \
curl -s http://localhost:8604/api/prompts | head -20
```

## Si el problema persiste

1. **Reiniciar contenedores:**
```bash
docker compose restart
```

2. **Reconstruir desde cero:**
```bash
docker compose down
docker compose build --no-cache
docker compose up -d
docker compose exec app npm run db:push
```

3. **Verificar logs completos:**
```bash
docker compose logs app > app_logs.txt
docker compose logs postgres > postgres_logs.txt
```

