# 🐘 Instalar y Configurar PostgreSQL Local

Esta guía te ayudará a instalar PostgreSQL en tu sistema Linux y configurarlo para CodeKit Pro.

---

## 📋 Paso 1: Instalar PostgreSQL

### Ubuntu/Debian

```bash
# Actualizar paquetes
sudo apt update

# Instalar PostgreSQL
sudo apt install postgresql postgresql-contrib

# Verificar instalación
psql --version
```

### Fedora/RHEL/CentOS

```bash
# Instalar PostgreSQL
sudo dnf install postgresql postgresql-server

# Inicializar base de datos
sudo postgresql-setup --initdb

# Habilitar y iniciar servicio
sudo systemctl enable postgresql
sudo systemctl start postgresql
```

### Arch Linux

```bash
# Instalar PostgreSQL
sudo pacman -S postgresql

# Inicializar base de datos
sudo -u postgres initdb -D /var/lib/postgres/data

# Habilitar y iniciar servicio
sudo systemctl enable postgresql
sudo systemctl start postgresql
```

---

## 📋 Paso 2: Iniciar el Servicio PostgreSQL

```bash
# Iniciar servicio
sudo systemctl start postgresql

# Habilitar inicio automático
sudo systemctl enable postgresql

# Verificar estado
sudo systemctl status postgresql
```

---

## 📋 Paso 3: Crear Usuario y Base de Datos

### Opción A: Usar el usuario postgres (más simple)

```bash
# Cambiar al usuario postgres
sudo -u postgres psql

# Dentro de psql, ejecutar:
CREATE DATABASE codekit_pro;
CREATE USER codekit_user WITH PASSWORD 'tu_password_seguro_aqui';
GRANT ALL PRIVILEGES ON DATABASE codekit_pro TO codekit_user;
\q
```

### Opción B: Crear tu propio usuario (recomendado)

```bash
# Cambiar al usuario postgres
sudo -u postgres psql

# Dentro de psql, ejecutar:
CREATE USER tu_usuario WITH PASSWORD 'tu_password_seguro_aqui';
CREATE DATABASE codekit_pro OWNER tu_usuario;
GRANT ALL PRIVILEGES ON DATABASE codekit_pro TO tu_usuario;
\q
```

**Nota:** Reemplaza `tu_usuario` y `tu_password_seguro_aqui` con tus propios valores.

---

## 📋 Paso 4: Configurar PostgreSQL para Conexiones Locales

Edita el archivo de configuración de PostgreSQL:

```bash
# Encontrar la ubicación del archivo pg_hba.conf
sudo find /etc -name pg_hba.conf 2>/dev/null
# O en algunas distribuciones:
sudo find /var/lib/postgresql -name pg_hba.conf 2>/dev/null
```

Edita el archivo (usando `sudo nano` o `sudo vi`):

```bash
sudo nano /etc/postgresql/*/main/pg_hba.conf
# O
sudo nano /var/lib/postgresql/data/pg_hba.conf
```

Busca la línea que dice:
```
local   all             all                                     peer
```

Y cámbiala a:
```
local   all             all                                     md5
```

También busca:
```
host    all             all             127.0.0.1/32            ident
```

Y cámbiala a:
```
host    all             all             127.0.0.1/32            md5
```

Guarda el archivo y reinicia PostgreSQL:

```bash
sudo systemctl restart postgresql
```

---

## 📋 Paso 5: Probar la Conexión

```bash
# Probar conexión con el usuario creado
psql -U tu_usuario -d codekit_pro -h localhost

# Si funciona, deberías ver:
# codekit_pro=>
# Escribe \q para salir
```

Si tienes problemas de conexión, prueba:

```bash
# Con el usuario postgres
sudo -u postgres psql -d codekit_pro
```

---

## 📋 Paso 6: Configurar CodeKit Pro

### 6.1 Crear archivo .env

En la raíz del proyecto, crea un archivo `.env`:

```bash
cd "/home/planetazuzu/CodeKit Pro"
nano .env
```

### 6.2 Agregar configuración

Agrega estas líneas (ajusta según tu configuración):

```env
# Base de datos PostgreSQL local
DATABASE_URL=postgresql://tu_usuario:tu_password@localhost:5432/codekit_pro

# Secretos (requeridos)
JWT_SECRET=tu-secreto-super-seguro-de-al-menos-32-caracteres-aqui
ADMIN_PASSWORD=941259018a

# Servidor
PORT=5000
NODE_ENV=development
```

**Generar JWT_SECRET seguro:**
```bash
openssl rand -base64 32
```

### 6.3 Verificar configuración

```bash
npm run db:setup
```

Deberías ver:
```
✅ PostgreSQL connection successful!
```

### 6.4 Crear tablas

```bash
npm run db:push
```

Esto creará todas las tablas necesarias.

---

## ✅ Verificar que Todo Funciona

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

---

## 🚨 Solución de Problemas

### Error: "psql: error: FATAL: password authentication failed"

**Solución:**
1. Verifica que el usuario y contraseña en `.env` son correctos
2. Verifica que `pg_hba.conf` está configurado con `md5`
3. Reinicia PostgreSQL: `sudo systemctl restart postgresql`

### Error: "psql: error: FATAL: database does not exist"

**Solución:**
```bash
sudo -u postgres psql
CREATE DATABASE codekit_pro;
\q
```

### Error: "psql: error: FATAL: role does not exist"

**Solución:**
```bash
sudo -u postgres psql
CREATE USER tu_usuario WITH PASSWORD 'tu_password';
\q
```

### Error: "Connection refused"

**Solución:**
1. Verifica que PostgreSQL está ejecutándose:
   ```bash
   sudo systemctl status postgresql
   ```
2. Si no está ejecutándose:
   ```bash
   sudo systemctl start postgresql
   ```

### Error: "permission denied"

**Solución:**
- Asegúrate de que el usuario tiene permisos en la base de datos:
  ```bash
  sudo -u postgres psql
  GRANT ALL PRIVILEGES ON DATABASE codekit_pro TO tu_usuario;
  \q
  ```

---

## 📝 Comandos Útiles

```bash
# Ver estado de PostgreSQL
sudo systemctl status postgresql

# Iniciar PostgreSQL
sudo systemctl start postgresql

# Detener PostgreSQL
sudo systemctl stop postgresql

# Reiniciar PostgreSQL
sudo systemctl restart postgresql

# Conectarse a PostgreSQL
psql -U tu_usuario -d codekit_pro -h localhost

# Listar bases de datos
psql -U tu_usuario -h localhost -c "\l"

# Listar tablas
psql -U tu_usuario -d codekit_pro -h localhost -c "\dt"
```

---

## 🎯 Checklist de Instalación

- [ ] PostgreSQL instalado
- [ ] Servicio PostgreSQL iniciado y habilitado
- [ ] Usuario creado en PostgreSQL
- [ ] Base de datos `codekit_pro` creada
- [ ] Permisos configurados
- [ ] `pg_hba.conf` configurado con `md5`
- [ ] Archivo `.env` creado con `DATABASE_URL`
- [ ] `JWT_SECRET` generado y configurado
- [ ] `npm run db:setup` ejecutado exitosamente
- [ ] `npm run db:push` ejecutado para crear tablas
- [ ] Servidor inicia sin errores
- [ ] Logs muestran "PostgreSQL storage initialized"

---

**¿Necesitas ayuda?** Consulta los logs del servidor o ejecuta `npm run db:setup` para diagnosticar problemas.

