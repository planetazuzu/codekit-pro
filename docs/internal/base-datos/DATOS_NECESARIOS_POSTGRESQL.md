# 📋 Datos Necesarios para Configurar PostgreSQL

Esta guía lista exactamente qué información necesitas para configurar PostgreSQL localmente.

---

## 🎯 Datos Requeridos

Para configurar PostgreSQL necesitas estos 5 datos:

### 1️⃣ **USUARIO** (username)
- **Qué es:** Nombre del usuario que accederá a la base de datos
- **Ejemplo:** `codekit_user`, `tu_usuario`, `postgres`
- **Cómo obtenerlo:**
  ```bash
  sudo -u postgres psql -c "\du"
  ```
- **Si no existe:** Necesitas crearlo (ver abajo)

### 2️⃣ **CONTRASEÑA** (password)
- **Qué es:** Contraseña segura para el usuario
- **Ejemplo:** `MiPasswordSeguro123!`
- **Requisitos:** Mínimo 8 caracteres, recomendado usar mayúsculas, minúsculas, números y símbolos
- **Cómo crearla:** Tú la defines al crear el usuario

### 3️⃣ **NOMBRE DE BASE DE DATOS** (database name)
- **Qué es:** Nombre de la base de datos para CodeKit Pro
- **Ejemplo:** `codekit_pro`
- **Cómo obtenerlo:**
  ```bash
  sudo -u postgres psql -c "\l"
  ```
- **Si no existe:** Necesitas crearla (ver abajo)

### 4️⃣ **PUERTO** (port)
- **Qué es:** Puerto donde escucha PostgreSQL
- **Valor por defecto:** `5432`
- **Cómo verificar:**
  ```bash
  sudo netstat -tlnp | grep postgres
  # O
  sudo ss -tlnp | grep postgres
  ```

### 5️⃣ **HOST** (hostname)
- **Qué es:** Dirección del servidor PostgreSQL
- **Para local:** `localhost` o `127.0.0.1`
- **Valor por defecto:** `localhost`

---

## 📝 Formato de DATABASE_URL

Una vez que tengas todos los datos, el formato es:

```
postgresql://USUARIO:CONTRASEÑA@HOST:PUERTO/NOMBRE_BASE_DATOS
```

### Ejemplo Completo:

```
postgresql://codekit_user:MiPassword123@localhost:5432/codekit_pro
```

---

## 🔍 Verificar Qué Tienes

Ejecuta este comando para ver qué datos ya tienes disponibles:

```bash
npm run db:check
```

Este script te mostrará:
- ✅ Si PostgreSQL está instalado
- ✅ Si PostgreSQL está ejecutándose
- 📁 Bases de datos existentes
- 👤 Usuarios existentes
- 📋 Qué datos necesitas

---

## 🛠️ Crear Usuario y Base de Datos (Si No Existen)

### Opción 1: Usar el usuario `postgres` (más simple)

```bash
# Cambiar al usuario postgres
sudo -u postgres psql

# Dentro de psql:
CREATE DATABASE codekit_pro;
ALTER USER postgres WITH PASSWORD 'tu_password_seguro';
\q
```

**DATABASE_URL resultante:**
```
postgresql://postgres:tu_password_seguro@localhost:5432/codekit_pro
```

### Opción 2: Crear usuario específico (recomendado)

```bash
# Cambiar al usuario postgres
sudo -u postgres psql

# Dentro de psql:
CREATE USER codekit_user WITH PASSWORD 'tu_password_seguro';
CREATE DATABASE codekit_pro OWNER codekit_user;
GRANT ALL PRIVILEGES ON DATABASE codekit_pro TO codekit_user;
\q
```

**DATABASE_URL resultante:**
```
postgresql://codekit_user:tu_password_seguro@localhost:5432/codekit_pro
```

---

## 📋 Checklist de Datos

Antes de crear el archivo `.env`, asegúrate de tener:

- [ ] **Usuario:** `_________________`
- [ ] **Contraseña:** `_________________`
- [ ] **Base de datos:** `codekit_pro` (o el nombre que prefieras)
- [ ] **Puerto:** `5432` (o el que uses)
- [ ] **Host:** `localhost` (para local)

---

## 🎯 Ejemplo Completo

Supongamos que decides usar estos valores:

- **Usuario:** `codekit_user`
- **Contraseña:** `MiPasswordSeguro123!`
- **Base de datos:** `codekit_pro`
- **Puerto:** `5432`
- **Host:** `localhost`

### 1. Crear usuario y base de datos:

```bash
sudo -u postgres psql
```

```sql
CREATE USER codekit_user WITH PASSWORD 'MiPasswordSeguro123!';
CREATE DATABASE codekit_pro OWNER codekit_user;
GRANT ALL PRIVILEGES ON DATABASE codekit_pro TO codekit_user;
\q
```

### 2. Crear archivo `.env`:

```bash
cd "/home/planetazuzu/CodeKit Pro"
nano .env
```

Contenido del `.env`:

```env
DATABASE_URL=postgresql://codekit_user:MiPasswordSeguro123!@localhost:5432/codekit_pro
JWT_SECRET=tu-secreto-generado-con-openssl-rand-base64-32
ADMIN_PASSWORD=941259018a
PORT=5000
NODE_ENV=development
```

### 3. Generar JWT_SECRET:

```bash
openssl rand -base64 32
```

Copia el resultado y pégalo en `.env` como valor de `JWT_SECRET`.

### 4. Verificar:

```bash
npm run db:setup
```

### 5. Crear tablas:

```bash
npm run db:push
```

---

## 🚨 Solución de Problemas

### No sé qué usuario usar

**Solución:** Usa `postgres` por defecto o crea uno nuevo:
```bash
sudo -u postgres psql -c "\du"  # Lista usuarios
```

### No sé qué base de datos usar

**Solución:** Crea una nueva llamada `codekit_pro`:
```bash
sudo -u postgres psql -c "CREATE DATABASE codekit_pro;"
```

### No sé el puerto

**Solución:** Usa `5432` (puerto por defecto de PostgreSQL)

### No sé el host

**Solución:** Para local usa `localhost`

---

## 💡 Consejos

1. **Para desarrollo local:** Puedes usar el usuario `postgres` con una contraseña simple
2. **Para producción:** Crea un usuario específico con contraseña fuerte
3. **Guarda tus credenciales:** En un gestor de contraseñas seguro
4. **No compartas `.env`:** Este archivo contiene información sensible

---

## 📚 Comandos Útiles

```bash
# Verificar requisitos
npm run db:check

# Verificar conexión
npm run db:setup

# Crear tablas
npm run db:push

# Listar bases de datos
sudo -u postgres psql -c "\l"

# Listar usuarios
sudo -u postgres psql -c "\du"

# Conectarse a la base de datos
psql -U tu_usuario -d codekit_pro -h localhost
```

---

**¿Listo para configurar?** Ejecuta `npm run db:check` para ver qué tienes y qué necesitas crear.

