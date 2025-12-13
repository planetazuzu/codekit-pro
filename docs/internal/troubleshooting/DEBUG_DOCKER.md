# 🐛 Debug: Contenedor Reiniciándose

## 🚨 Problema

El contenedor `codekit-pro` está en estado "Restarting (1)", lo que significa que la aplicación está fallando al iniciar.

---

## 🔍 Paso 1: Ver Logs del Contenedor

```bash
cd /var/www/codekit-pro

# Ver logs completos
docker-compose logs app

# Ver últimas 100 líneas
docker-compose logs --tail=100 app

# Ver logs en tiempo real
docker-compose logs -f app
```

**Esto te mostrará el error exacto que está causando el reinicio.**

---

## 🔧 Problemas Comunes y Soluciones

### Error: "DATABASE_URL not set"

**Solución:**
```bash
# Verificar que .env existe y tiene DATABASE_URL
cat .env | grep DATABASE_URL

# Si no está, agregarlo
echo "DATABASE_URL=postgresql://codekit_user:codekit_password@postgres:5432/codekit_pro" >> .env

# Reiniciar
docker-compose restart app
```

### Error: "JWT_SECRET not set"

**Solución:**
```bash
# Verificar .env
cat .env

# Si falta JWT_SECRET, generarlo y agregarlo
JWT_SECRET=$(openssl rand -base64 32)
echo "JWT_SECRET=$JWT_SECRET" >> .env

# Reiniciar
docker-compose restart app
```

### Error: "Cannot connect to database"

**Solución:**
```bash
# Verificar que PostgreSQL está corriendo
docker-compose ps postgres

# Ver logs de PostgreSQL
docker-compose logs postgres

# Esperar más tiempo antes de iniciar la app
docker-compose restart app
```

### Error: "dist/index.cjs not found"

**Solución:**
```bash
# El build falló. Reconstruir
docker-compose build --no-cache app
docker-compose up -d app
```

---

## 🔍 Ver Logs Detallados

```bash
# Ver todos los logs
docker-compose logs

# Ver solo errores
docker-compose logs app 2>&1 | grep -i error

# Ver desde el inicio
docker-compose logs --since=10m app
```

---

## 🛠️ Entrar al Contenedor para Debug

```bash
# Entrar al contenedor (si está corriendo)
docker-compose exec app sh

# O si está reiniciándose, usar docker directamente
docker exec -it codekit-pro sh

# Dentro del contenedor:
cd /app
ls -la dist/
cat dist/index.cjs | head -20
env | grep -E "DATABASE_URL|JWT_SECRET|PORT"
```

---

## 🔄 Reiniciar Todo desde Cero

Si nada funciona:

```bash
cd /var/www/codekit-pro

# Detener todo
docker-compose down

# Verificar .env está correcto
cat .env

# Reconstruir sin cache
docker-compose build --no-cache

# Iniciar
docker-compose up -d

# Ver logs inmediatamente
docker-compose logs -f app
```

---

## 📋 Checklist de Debugging

- [ ] Ver logs: `docker-compose logs app`
- [ ] Verificar .env existe y tiene todas las variables
- [ ] Verificar que PostgreSQL está corriendo: `docker-compose ps postgres`
- [ ] Verificar que el build se completó: `docker-compose exec app ls -la dist/`
- [ ] Verificar variables de entorno: `docker-compose exec app env | grep -E "DATABASE|JWT|PORT"`

---

**Primero ejecuta `docker-compose logs app` para ver el error exacto.**

