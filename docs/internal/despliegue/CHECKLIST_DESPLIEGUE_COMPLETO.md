# 📋 CHECKLIST COMPLETO DE DESPLIEGUE - CodeKit Pro

**Fecha de creación:** 2025-01-XX  
**Última actualización:** 2025-01-XX  
**Estado:** En revisión

---

## 🎯 OBJETIVO

Este documento lista **TODOS** los requisitos y pasos necesarios para desplegar CodeKit Pro en producción de forma segura y funcional.

---

## ✅ PRE-REQUISITOS

### 1. Variables de Entorno Requeridas

#### 🔴 CRÍTICAS (Sin estas, la app NO funcionará)

```bash
# Entorno
NODE_ENV=production
PORT=5000

# Base de Datos (OBLIGATORIO en producción)
DATABASE_URL=postgresql://usuario:password@host:5432/database

# Seguridad (OBLIGATORIO en producción)
JWT_SECRET=tu-secret-key-super-segura-minimo-32-caracteres
ADMIN_PASSWORD=tu-password-admin-seguro-minimo-8-caracteres
```

#### 🟡 RECOMENDADAS (Funcionalidad limitada sin estas)

```bash
# Stripe (Para suscripciones)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRODUCT_PRICE_ID_PRO=price_...
STRIPE_PRODUCT_PRICE_ID_ENTERPRISE=price_...

# CORS (Para acceso desde frontend)
ALLOWED_ORIGINS=https://codekitpro.app,https://www.codekitpro.app

# API URL (Para webhooks y callbacks)
API_URL=https://codekitpro.app
```

#### 📝 Template `.env` para Producción

```bash
# ============================================
# CODEKIT PRO - PRODUCCIÓN
# ============================================

# Entorno
NODE_ENV=production
PORT=5000

# Base de Datos PostgreSQL
DATABASE_URL=postgresql://usuario:password@host:5432/codekit_pro

# Seguridad
JWT_SECRET=genera-un-secret-aleatorio-de-al-menos-32-caracteres-aqui
ADMIN_PASSWORD=tu-password-admin-seguro-aqui

# Stripe (Configurar después de crear productos en Stripe Dashboard)
STRIPE_SECRET_KEY=sk_live_tu_clave_secreta
STRIPE_WEBHOOK_SECRET=whsec_tu_webhook_secret
STRIPE_PRODUCT_PRICE_ID_PRO=price_tu_price_id_pro
STRIPE_PRODUCT_PRICE_ID_ENTERPRISE=price_tu_price_id_enterprise

# CORS - Orígenes permitidos (separados por comas)
ALLOWED_ORIGINS=https://codekitpro.app,https://www.codekitpro.app

# API URL - URL pública de tu API
API_URL=https://codekitpro.app
```

---

## 🗄️ CONFIGURACIÓN DE BASE DE DATOS

### ✅ Checklist Base de Datos

- [ ] **PostgreSQL instalado y corriendo**
  - Versión mínima: PostgreSQL 12+
  - Verificar: `psql --version`

- [ ] **Base de datos creada**
  ```bash
  createdb codekit_pro
  # O usando psql:
  psql -U postgres -c "CREATE DATABASE codekit_pro;"
  ```

- [ ] **Usuario de base de datos creado** (recomendado)
  ```bash
  psql -U postgres -c "CREATE USER codekit_user WITH PASSWORD 'password_seguro';"
  psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE codekit_pro TO codekit_user;"
  ```

- [ ] **DATABASE_URL configurada correctamente**
  - Formato: `postgresql://usuario:password@host:puerto/database`
  - Ejemplo: `postgresql://codekit_user:password@localhost:5432/codekit_pro`

- [ ] **Conexión verificada**
  ```bash
  npm run db:check
  ```

- [ ] **Esquema de base de datos creado**
  ```bash
  npm run db:push
  ```
  Esto creará todas las tablas necesarias usando Drizzle ORM.

- [ ] **Datos iniciales migrados** (si aplica)
  ```bash
  npm run db:migrate
  ```

---

## 🔐 CONFIGURACIÓN DE SEGURIDAD

### ✅ Checklist Seguridad

- [ ] **JWT_SECRET configurado**
  - Mínimo 32 caracteres
  - Generar con: `openssl rand -base64 32`
  - **NUNCA** usar el mismo secret en desarrollo y producción

- [ ] **ADMIN_PASSWORD configurado**
  - Mínimo 8 caracteres
  - Usar contraseña fuerte
  - **NUNCA** usar contraseña por defecto en producción

- [ ] **CORS configurado correctamente**
  - `ALLOWED_ORIGINS` debe incluir solo tus dominios de producción
  - No usar `*` en producción
  - Incluir variantes con/sin `www` si aplica

- [ ] **Helmet configurado** (ya implementado en `security.middleware.ts`)
  - ✅ Headers de seguridad
  - ✅ Trust proxy configurado

- [ ] **Rate Limiting activo** (ya implementado)
  - ✅ Rate limits en endpoints públicos
  - ✅ Rate limits más estrictos en admin

- [ ] **Input Sanitization activo** (ya implementado con DOMPurify)
  - ✅ Sanitización de inputs en todos los endpoints

---

## 💳 CONFIGURACIÓN DE STRIPE

### ✅ Checklist Stripe

- [ ] **Cuenta de Stripe creada**
  - [ ] Modo Live activado
  - [ ] Información de negocio completada

- [ ] **Productos creados en Stripe Dashboard**
  - [ ] Producto "Pro" creado
  - [ ] Producto "Enterprise" creado
  - [ ] Precios configurados (mensual/anual según necesites)

- [ ] **API Keys obtenidas**
  - [ ] Secret Key (Live): `sk_live_...`
  - [ ] Webhook Secret: `whsec_...`

- [ ] **Webhook configurado en Stripe Dashboard**
  - [ ] URL: `https://api.tudominio.com/api/stripe/webhook`
  - [ ] Eventos seleccionados:
    - `customer.subscription.created`
    - `customer.subscription.updated`
    - `customer.subscription.deleted`
    - `checkout.session.completed`
    - `invoice.payment_succeeded`
    - `invoice.payment_failed`

- [ ] **Price IDs copiados a variables de entorno**
  - [ ] `STRIPE_PRODUCT_PRICE_ID_PRO`
  - [ ] `STRIPE_PRODUCT_PRICE_ID_ENTERPRISE`

- [ ] **Webhook probado** (usar Stripe CLI para testing local)
  ```bash
  stripe listen --forward-to localhost:5000/api/stripe/webhook
  ```

---

## 🏗️ BUILD Y COMPILACIÓN

### ✅ Checklist Build

- [ ] **Dependencias instaladas**
  ```bash
  npm install
  ```

- [ ] **TypeScript compila sin errores**
  ```bash
  npm run check
  ```

- [ ] **Tests pasan** (recomendado antes de desplegar)
  ```bash
  npm test
  ```

- [ ] **Build de producción ejecutado**
  ```bash
  npm run build
  ```
  
  Esto genera:
  - `dist/index.cjs` - Servidor compilado
  - `dist/public/` - Frontend compilado

- [ ] **Verificar que `dist/` existe y tiene contenido**
  ```bash
  ls -la dist/
  ls -la dist/public/
  ```

---

## 🚀 DESPLIEGUE

### ✅ Checklist Despliegue

#### Opción 1: Servidor VPS/Dedicado

- [ ] **Servidor configurado**
  - [ ] Node.js instalado (versión 18+)
  - [ ] PostgreSQL instalado y corriendo
  - [ ] Firewall configurado (puerto 5000 abierto)
  - [ ] Dominio apuntando al servidor

- [ ] **Código desplegado**
  ```bash
  git clone <repo>
  cd CodeKit\ Pro
  npm install --production
  ```

- [ ] **Variables de entorno configuradas**
  - [ ] Archivo `.env` creado en raíz del proyecto
  - [ ] Todas las variables críticas configuradas
  - [ ] Permisos del archivo `.env` restringidos: `chmod 600 .env`

- [ ] **Base de datos configurada**
  ```bash
  npm run db:push
  ```

- [ ] **Aplicación iniciada**
  ```bash
  npm start
  ```

- [ ] **Proceso Manager configurado** (recomendado)
  - [ ] PM2 instalado: `npm install -g pm2`
  - [ ] Aplicación iniciada con PM2:
    ```bash
    pm2 start dist/index.cjs --name codekit-pro
    pm2 save
    pm2 startup
    ```

- [ ] **Nginx configurado** (recomendado como reverse proxy)
  ```nginx
  server {
      listen 80;
      server_name api.tudominio.com;
      
      location / {
          proxy_pass http://localhost:5000;
          proxy_http_version 1.1;
          proxy_set_header Upgrade $http_upgrade;
          proxy_set_header Connection 'upgrade';
          proxy_set_header Host $host;
          proxy_cache_bypass $http_upgrade;
      }
  }
  ```

- [ ] **SSL/HTTPS configurado** (OBLIGATORIO en producción)
  - [ ] Certbot instalado
  - [ ] Certificado SSL obtenido
  - [ ] Nginx configurado para HTTPS

#### Opción 2: Plataformas Cloud (Railway, Render, Fly.io, etc.)

- [ ] **Proyecto creado en la plataforma**
- [ ] **Repositorio conectado**
- [ ] **Variables de entorno configuradas en el dashboard**
- [ ] **Base de datos PostgreSQL provisionada**
- [ ] **Build command configurado**: `npm run build`
- [ ] **Start command configurado**: `npm start`
- [ ] **Health check configurado**: `/health`
- [ ] **Despliegue ejecutado y verificado**

---

## ✅ VERIFICACIÓN POST-DESPLIEGUE

### ✅ Checklist Verificación

- [ ] **Health check responde**
  ```bash
  curl https://api.tudominio.com/health
  # Debe devolver: {"status":"ok","timestamp":"..."}
  ```

- [ ] **Frontend carga correctamente**
  - [ ] Abrir `https://tudominio.com` en navegador
  - [ ] Verificar que no hay errores en consola
  - [ ] Verificar que las rutas funcionan

- [ ] **API responde correctamente**
  ```bash
  curl https://api.tudominio.com/api/plans
  # Debe devolver lista de planes
  ```

- [ ] **Base de datos conectada**
  - [ ] Verificar logs del servidor
  - [ ] No debe haber errores de conexión

- [ ] **Autenticación funciona**
  - [ ] Registro de usuario funciona
  - [ ] Login funciona
  - [ ] JWT se genera correctamente

- [ ] **Stripe funciona** (si configurado)
  - [ ] Checkout session se crea
  - [ ] Webhook recibe eventos
  - [ ] Suscripciones se actualizan correctamente

- [ ] **Rate limiting funciona**
  - [ ] Hacer muchas requests rápidas
  - [ ] Debe devolver 429 después del límite

- [ ] **CORS funciona**
  - [ ] Requests desde frontend funcionan
  - [ ] Requests desde otros dominios son bloqueados

---

## 📊 MONITOREO Y LOGS

### ✅ Checklist Monitoreo

- [ ] **Logs configurados**
  - [ ] Logs de aplicación accesibles
  - [ ] Logs de errores monitoreados

- [ ] **Alertas configuradas** (recomendado)
  - [ ] Alertas de errores críticos
  - [ ] Alertas de downtime
  - [ ] Alertas de uso de recursos

- [ ] **Métricas configuradas** (recomendado)
  - [ ] Uptime monitoring
  - [ ] Response time monitoring
  - [ ] Error rate monitoring

---

## 🔄 MANTENIMIENTO

### ✅ Checklist Mantenimiento

- [ ] **Backups de base de datos configurados**
  - [ ] Backups automáticos diarios
  - [ ] Backups almacenados en ubicación segura
  - [ ] Proceso de restauración probado

- [ ] **Actualizaciones planificadas**
  - [ ] Proceso para actualizar código
  - [ ] Proceso para actualizar dependencias
  - [ ] Ventana de mantenimiento definida

- [ ] **Documentación actualizada**
  - [ ] README actualizado con instrucciones de despliegue
  - [ ] Variables de entorno documentadas
  - [ ] Procesos de troubleshooting documentados

---

## 🚨 PROBLEMAS COMUNES Y SOLUCIONES

### Error: "DATABASE_URL not set"
**Solución:** Verificar que el archivo `.env` existe y contiene `DATABASE_URL`

### Error: "JWT_SECRET not set in production"
**Solución:** Agregar `JWT_SECRET` al archivo `.env` con al menos 32 caracteres

### Error: "Could not find the build directory"
**Solución:** Ejecutar `npm run build` antes de `npm start`

### Error: "Port 5000 already in use"
**Solución:** Cambiar `PORT` en `.env` o detener el proceso que usa el puerto

### Error: CORS bloqueando requests
**Solución:** Verificar que `ALLOWED_ORIGINS` incluye el dominio del frontend

### Error: Stripe webhook no funciona
**Solución:** 
- Verificar que `STRIPE_WEBHOOK_SECRET` está configurado
- Verificar que la URL del webhook en Stripe Dashboard es correcta
- Verificar que el endpoint `/api/stripe/webhook` está accesible públicamente

---

## 📝 NOTAS IMPORTANTES

1. **NUNCA** commits archivos `.env` al repositorio
2. **SIEMPRE** usa HTTPS en producción
3. **SIEMPRE** usa contraseñas fuertes para producción
4. **SIEMPRE** haz backups antes de cambios importantes
5. **SIEMPRE** prueba en staging antes de producción

---

## ✅ RESUMEN FINAL

Antes de considerar el despliegue completo, verifica:

- [ ] Todas las variables de entorno críticas configuradas
- [ ] Base de datos PostgreSQL configurada y conectada
- [ ] Build ejecutado sin errores
- [ ] Health check responde correctamente
- [ ] Frontend carga sin errores
- [ ] Autenticación funciona
- [ ] Stripe configurado (si aplica)
- [ ] SSL/HTTPS configurado
- [ ] Monitoreo básico configurado
- [ ] Backups configurados

---

**¿Listo para desplegar?** Si todos los items están marcados, ¡adelante! 🚀

**¿Necesitas ayuda?** Revisa la sección de problemas comunes o consulta la documentación adicional en `/docs`.

