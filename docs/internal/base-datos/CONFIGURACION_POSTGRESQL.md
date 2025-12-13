# 🗄️ Configuración de PostgreSQL y Sesiones Persistentes

Este documento explica cómo configurar PostgreSQL y sesiones persistentes para CodeKit Pro.

---

## 📋 Requisitos Previos

- PostgreSQL 12+ instalado y ejecutándose (local o remoto)
- O una base de datos PostgreSQL en la nube (Neon, Supabase, Render, etc.)
- `DATABASE_URL` configurada en las variables de entorno

---

## 🔧 Configuración

### 1. Obtener DATABASE_URL

#### Opción A: Base de datos local
```bash
DATABASE_URL=postgresql://usuario:password@localhost:5432/codekit_pro
```

#### Opción B: Neon (recomendado para desarrollo)
1. Crear cuenta en [Neon](https://neon.tech)
2. Crear un nuevo proyecto
3. Copiar la connection string:
```bash
DATABASE_URL=postgresql://usuario:password@ep-xxx.us-east-2.aws.neon.tech/codekit_pro?sslmode=require
```

#### Opción C: Supabase
1. Crear proyecto en [Supabase](https://supabase.com)
2. Ir a Settings > Database
3. Copiar la connection string:
```bash
DATABASE_URL=postgresql://postgres:password@db.xxx.supabase.co:5432/postgres
```

### 2. Configurar Variables de Entorno

Crear o editar `.env` en la raíz del proyecto:

```env
# Base de datos PostgreSQL
DATABASE_URL=postgresql://usuario:password@host:5432/database

# Secretos (requeridos)
JWT_SECRET=tu-secreto-super-seguro-aqui
ADMIN_PASSWORD=941259018a

# Entorno
NODE_ENV=production
```

### 3. Ejecutar Migraciones de Base de Datos

El proyecto usa Drizzle ORM. Para crear las tablas:

```bash
npm run db:push
```

Esto creará automáticamente todas las tablas necesarias:
- `users`
- `prompts`
- `snippets`
- `links`
- `guides`
- `views`
- `affiliates`
- `affiliate_clicks`
- `affiliate_programs`
- `user_sessions` (para sesiones persistentes)

---

## ✅ Verificación

### Verificar que PostgreSQL está activo

1. **Iniciar el servidor:**
```bash
npm run dev
```

2. **Buscar en los logs:**
```
✅ Database connection initialized successfully
✅ PostgreSQL storage initialized successfully
✅ Configuring PostgreSQL session store
```

Si ves estos mensajes, PostgreSQL está funcionando correctamente.

### Verificar Sesiones Persistentes

1. **Iniciar sesión como admin:**
```bash
curl -X POST http://localhost:5000/api/auth/admin/login \
  -H "Content-Type: application/json" \
  -d '{"password":"941259018a"}' \
  -c cookies.txt
```

2. **Verificar que la sesión persiste:**
```bash
# Reiniciar el servidor
# Luego verificar que la sesión sigue activa
curl http://localhost:5000/api/auth/admin/check \
  -b cookies.txt
```

Si la sesión persiste después de reiniciar, las sesiones persistentes están funcionando.

---

## 🔄 Migración de Datos desde MemStorage

Si tienes datos en MemStorage y quieres migrarlos a PostgreSQL:

```bash
npm run db:migrate
```

Este script:
1. Lee todos los datos de MemStorage
2. Los inserta en PostgreSQL
3. Verifica la integridad de los datos

**⚠️ Advertencia:** Este script solo funciona si MemStorage todavía tiene datos. Una vez que reinicies el servidor con PostgreSQL activo, los datos de MemStorage se perderán.

---

## 🚨 Solución de Problemas

### Error: "DATABASE_URL not set, using MemStorage"

**Causa:** La variable de entorno `DATABASE_URL` no está configurada.

**Solución:**
1. Verificar que `.env` existe y contiene `DATABASE_URL`
2. Verificar que el servidor está leyendo `.env` (usar `dotenv` o similar)
3. Reiniciar el servidor

### Error: "Database connection failed"

**Causa:** PostgreSQL no está accesible o las credenciales son incorrectas.

**Solución:**
1. Verificar que PostgreSQL está ejecutándose:
```bash
# Local
pg_isready

# Remoto
psql $DATABASE_URL -c "SELECT 1;"
```

2. Verificar que `DATABASE_URL` es correcta
3. Verificar firewall/red si es remoto

### Error: "Table does not exist"

**Causa:** Las migraciones no se han ejecutado.

**Solución:**
```bash
npm run db:push
```

### Sesiones no persisten después de reiniciar

**Causa:** `DATABASE_URL` no está configurada, usando memoria.

**Solución:**
1. Configurar `DATABASE_URL`
2. Reiniciar el servidor
3. Verificar logs: debe decir "Configuring PostgreSQL session store"

---

## 📊 Estructura de Tablas

### Tabla de Sesiones (`user_sessions`)

Creada automáticamente por `connect-pg-simple`:

```sql
CREATE TABLE "user_sessions" (
  "sid" varchar NOT NULL COLLATE "default",
  "sess" json NOT NULL,
  "expire" timestamp(6) NOT NULL,
  CONSTRAINT "user_sessions_pkey" PRIMARY KEY ("sid")
);
```

### Otras Tablas

Ver `shared/schema.ts` para la estructura completa de todas las tablas.

---

## 🔐 Seguridad

### Recomendaciones

1. **Nunca commits `DATABASE_URL`** con credenciales reales
2. **Usa SSL** en producción (`?sslmode=require`)
3. **Rota `JWT_SECRET`** regularmente
4. **Usa contraseñas fuertes** para `ADMIN_PASSWORD`
5. **Limita acceso** a la base de datos por IP si es posible

### Variables de Entorno en Producción

Usa un servicio de gestión de secretos:
- **Render.com:** Variables de entorno en el dashboard
- **Vercel:** Variables de entorno en el proyecto
- **Railway:** Variables de entorno en el servicio
- **Heroku:** Config vars

---

## 📚 Referencias

- [Drizzle ORM Docs](https://orm.drizzle.team/)
- [Neon PostgreSQL](https://neon.tech)
- [connect-pg-simple](https://github.com/voxpelli/node-connect-pg-simple)
- [Express Sessions](https://github.com/expressjs/session)

---

## ✅ Checklist de Configuración

- [ ] PostgreSQL instalado/configurado
- [ ] `DATABASE_URL` configurada en `.env`
- [ ] `JWT_SECRET` configurado (mínimo 32 caracteres)
- [ ] `ADMIN_PASSWORD` configurado
- [ ] Migraciones ejecutadas (`npm run db:push`)
- [ ] Servidor inicia sin errores
- [ ] Logs muestran "PostgreSQL storage initialized"
- [ ] Logs muestran "Configuring PostgreSQL session store"
- [ ] Sesiones persisten después de reiniciar
- [ ] Datos se guardan correctamente

---

**Última actualización:** 2025-01-XX  
**Fase:** 1 - Correcciones Críticas

