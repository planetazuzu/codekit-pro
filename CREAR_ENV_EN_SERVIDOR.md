# 📝 Crear archivo .env en el Servidor

## 🚨 El Script Está Esperando

Si el script se detuvo esperando que edites el `.env`, aquí está lo que necesitas hacer:

---

## ⚡ Solución Rápida

### Opción 1: Crear .env Básico (Más Rápido)

En el servidor, ejecuta estos comandos:

```bash
cd /var/www/codekit-pro

# Generar JWT_SECRET
JWT_SECRET=$(openssl rand -base64 32)

# Crear .env con valores básicos
cat > .env << EOF
NODE_ENV=production
PORT=8604
JWT_SECRET=$JWT_SECRET
ADMIN_PASSWORD=941259018a
WEBHOOK_SECRET=Oe6OTVBc4Nh2UZ0XwdIuRlek10vpJdacKtXN8N6GsI8=
EOF

# Presionar Enter para continuar el script
# (El script está esperando, solo presiona Enter)
```

### Opción 2: Editar con Nano

```bash
cd /var/www/codekit-pro
nano .env
```

**Copia y pega esto en el archivo:**

```env
NODE_ENV=production
PORT=8604
JWT_SECRET=GENERA_UN_SECRETO_AQUI
ADMIN_PASSWORD=941259018a
WEBHOOK_SECRET=Oe6OTVBc4Nh2UZ0XwdIuRlek10vpJdacKtXN8N6GsI8=
```

**Para generar JWT_SECRET, ejecuta en otra terminal:**
```bash
openssl rand -base64 32
```

**Guardar:** `Ctrl+O`, `Enter`, `Ctrl+X`

**Luego presiona Enter** en la terminal donde está corriendo el script.

---

## 📋 Contenido Completo del .env

Si quieres todas las opciones disponibles:

```env
# ============================================
# CodeKit Pro - Variables de Entorno
# ============================================

# Aplicación
NODE_ENV=production
PORT=8604

# Seguridad
# Generar con: openssl rand -base64 32
JWT_SECRET=GENERA_UN_SECRETO_AQUI_MINIMO_32_CARACTERES
ADMIN_PASSWORD=941259018a

# Webhook para CI/CD
WEBHOOK_SECRET=Oe6OTVBc4Nh2UZ0XwdIuRlek10vpJdacKtXN8N6GsI8=

# Base de Datos PostgreSQL (Opcional)
# Si no se configura, usará MemStorage (datos en memoria)
# DATABASE_URL=postgresql://usuario:password@localhost:5432/codekit_pro

# Stripe (Opcional - para pagos)
# STRIPE_SECRET_KEY=sk_test_...
# STRIPE_WEBHOOK_SECRET=whsec_...

# GitHub Sync (Opcional)
# GITHUB_TOKEN=ghp_...
# GITHUB_REPO_OWNER=tu-usuario
# GITHUB_REPO_NAME=codekit-pro-data
# GITHUB_SYNC_ENABLED=true

# CORS (Opcional)
# ALLOWED_ORIGINS=https://codekitpro.app,https://www.codekitpro.app

# API URL (Opcional)
# API_URL=https://codekitpro.app
```

---

## 🔐 Generar JWT_SECRET

**En el servidor, ejecuta:**

```bash
openssl rand -base64 32
```

Copia el resultado y úsalo como valor de `JWT_SECRET`.

---

## ✅ Después de Crear el .env

1. **Si usaste nano:** Guarda con `Ctrl+O`, `Enter`, `Ctrl+X`
2. **Presiona Enter** en la terminal donde está corriendo el script
3. El script continuará automáticamente

---

## 🚀 Comando Todo-en-Uno

Si quieres hacerlo todo de una vez:

```bash
cd /var/www/codekit-pro
JWT_SECRET=$(openssl rand -base64 32) && cat > .env << EOF
NODE_ENV=production
PORT=8604
JWT_SECRET=$JWT_SECRET
ADMIN_PASSWORD=941259018a
WEBHOOK_SECRET=Oe6OTVBc4Nh2UZ0XwdIuRlek10vpJdacKtXN8N6GsI8=
EOF
echo "✅ Archivo .env creado"
echo "Presiona Enter para continuar..."
```

Luego presiona **Enter** para que el script continúe.

---

## 📝 Variables Mínimas Necesarias

Para que la aplicación funcione, necesitas mínimo:

- ✅ `NODE_ENV=production`
- ✅ `PORT=8604`
- ✅ `JWT_SECRET` (generar con `openssl rand -base64 32`)
- ✅ `ADMIN_PASSWORD=941259018a`
- ✅ `WEBHOOK_SECRET=Oe6OTVBc4Nh2UZ0XwdIuRlek10vpJdacKtXN8N6GsI8=`

El resto son opcionales.

---

**¿Listo?** Crea el `.env` y presiona Enter para continuar el despliegue.

