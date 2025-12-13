# 🔧 Solucionar Error "Connection reset by peer"

## 🐛 Problema

```
curl: (56) Recv failure: Connection reset by peer
```

Este error indica que la aplicación no está respondiendo correctamente.

---

## 🔍 Diagnóstico Paso a Paso

### 1. Verificar que los Contenedores Están Corriendo

```bash
# En el servidor
cd /var/www/codekit-pro
docker compose ps
```

**Deberías ver:**
```
NAME               STATUS
codekit-pro        Up X seconds/minutes
codekit-postgres   Up X seconds/minutes (healthy)
```

**Si no están corriendo:**
```bash
# Iniciar contenedores
docker compose up -d

# Ver logs
docker compose logs app
```

### 2. Verificar Logs de la Aplicación

```bash
# Ver los últimos logs
docker compose logs --tail=50 app

# Ver logs en tiempo real
docker compose logs -f app
```

**Busca errores como:**
- `Error: Cannot find module`
- `Error: Database connection failed`
- `Error: Environment variable validation failed`
- `Error: Port already in use`

### 3. Verificar que el Puerto Está Abierto

```bash
# Verificar que el puerto 8604 está escuchando
netstat -tlnp | grep 8604
# O
ss -tlnp | grep 8604
```

**Deberías ver:**
```
tcp  0  0 0.0.0.0:8604  LISTEN  ...
```

### 4. Verificar Variables de Entorno

```bash
# Verificar que las variables están cargadas
docker compose exec app printenv | grep -E "PORT|NODE_ENV|DATABASE_URL"
```

**Deberías ver:**
```
NODE_ENV=production
PORT=8604
DATABASE_URL=postgresql://...
```

### 5. Verificar Health Check

```bash
# Intentar health check desde dentro del contenedor
docker compose exec app curl -f http://localhost:8604/health

# O desde el host
curl -v http://localhost:8604/health
```

---

## 🔧 Soluciones Comunes

### Solución 1: La Aplicación Está Reiniciando

Si la aplicación está en bucle de reinicios:

```bash
# Ver logs para identificar el error
docker compose logs app | tail -100

# Detener todo
docker compose down

# Reiniciar limpiamente
docker compose up -d

# Monitorear logs
docker compose logs -f app
```

### Solución 2: Error en Variables de Entorno

```bash
# Verificar que .env está correcto
cat .env

# Verificar que no hay errores de sintaxis
grep -v "^#" .env | grep -v "^$" | grep "="

# Verificar que USE_DOCKER está
grep USE_DOCKER .env
```

### Solución 3: Error de Base de Datos

```bash
# Verificar que PostgreSQL está corriendo
docker compose ps postgres

# Verificar conexión a la base de datos
docker compose exec postgres psql -U codekit_user -d codekit_pro -c "SELECT 1;"

# Si falla, verificar DATABASE_URL en .env
grep DATABASE_URL .env
```

### Solución 4: Puerto en Uso

```bash
# Verificar qué está usando el puerto 8604
lsof -i :8604
# O
netstat -tlnp | grep 8604

# Si hay otro proceso, detenerlo o cambiar el puerto
```

### Solución 5: Rebuild Completo

Si nada funciona, hacer un rebuild completo:

```bash
# Detener todo
docker compose down

# Rebuild sin cache
docker compose build --no-cache app

# Iniciar
docker compose up -d

# Ver logs
docker compose logs -f app
```

---

## 🚀 Comandos de Diagnóstico Completo

```bash
cd /var/www/codekit-pro && \
echo "=== Estado de Contenedores ===" && \
docker compose ps && \
echo "" && \
echo "=== Últimos Logs (50 líneas) ===" && \
docker compose logs --tail=50 app && \
echo "" && \
echo "=== Variables de Entorno ===" && \
docker compose exec app printenv | grep -E "PORT|NODE_ENV|DATABASE_URL|WEBHOOK" && \
echo "" && \
echo "=== Puerto 8604 ===" && \
netstat -tlnp | grep 8604 || echo "Puerto no está escuchando" && \
echo "" && \
echo "=== Health Check desde contenedor ===" && \
docker compose exec app curl -f http://localhost:8604/health 2>&1 || echo "Health check falló"
```

---

## ✅ Verificación Paso a Paso

### Paso 1: Contenedores Corriendo
```bash
docker compose ps
```
✅ Debe mostrar ambos contenedores "Up"

### Paso 2: Sin Errores en Logs
```bash
docker compose logs app | tail -20
```
✅ No debe haber errores críticos

### Paso 3: Puerto Escuchando
```bash
netstat -tlnp | grep 8604
```
✅ Debe mostrar el puerto en LISTEN

### Paso 4: Health Check Funciona
```bash
docker compose exec app curl http://localhost:8604/health
```
✅ Debe responder con status 200

### Paso 5: Webhook Funciona
```bash
curl http://localhost:8604/api/webhooks/status
```
✅ Debe responder con JSON

---

## 🐛 Errores Comunes y Soluciones

### Error: "Cannot find module"
**Solución:**
```bash
docker compose build --no-cache app
docker compose up -d app
```

### Error: "Database connection failed"
**Solución:**
```bash
# Verificar que postgres está corriendo
docker compose ps postgres

# Verificar DATABASE_URL
grep DATABASE_URL .env

# Reiniciar postgres
docker compose restart postgres
```

### Error: "Port 8604 already in use"
**Solución:**
```bash
# Encontrar proceso
lsof -i :8604

# Detener proceso o cambiar puerto en .env
```

### Error: "Environment variable validation failed"
**Solución:**
```bash
# Verificar .env
cat .env

# Verificar que todas las variables requeridas están
grep -E "NODE_ENV|PORT|JWT_SECRET|ADMIN_PASSWORD|DATABASE_URL" .env
```

---

## 📝 Checklist de Verificación

- [ ] Contenedores corriendo: `docker compose ps`
- [ ] Sin errores en logs: `docker compose logs app`
- [ ] Puerto escuchando: `netstat -tlnp | grep 8604`
- [ ] Variables cargadas: `docker compose exec app printenv`
- [ ] Health check funciona: `docker compose exec app curl http://localhost:8604/health`
- [ ] Base de datos conectada: `docker compose exec postgres psql -U codekit_user -d codekit_pro -c "SELECT 1;"`

---

## 🎯 Próximos Pasos

Una vez que la aplicación esté corriendo correctamente:

1. Verificar webhook: `curl http://localhost:8604/api/webhooks/status`
2. Probar despliegue automático
3. Monitorear logs durante el despliegue

---

**Comparte los resultados de los comandos de diagnóstico para ayudarte mejor.** 🔍

