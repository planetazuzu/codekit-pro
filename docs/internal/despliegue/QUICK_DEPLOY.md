# 🚀 Despliegue Rápido - CodeKit Pro

## Método Más Rápido: Railway

### 1. Preparar el código
```bash
# Asegúrate de que todo está commiteado
git add .
git commit -m "Ready for deployment"
git push
```

### 2. Desplegar en Railway

1. Ve a [railway.app](https://railway.app) y crea cuenta
2. Click en "New Project" → "Deploy from GitHub repo"
3. Selecciona tu repositorio
4. Railway detectará automáticamente:
   - Build: `npm run build`
   - Start: `npm start`
5. Añade variables de entorno:
   - `PORT=5000`
   - `NODE_ENV=production`
6. ¡Listo! Railway desplegará automáticamente

### 3. Obtener tu URL
- Railway te dará una URL como: `https://tu-app.railway.app`
- Puedes configurar un dominio personalizado después

---

## Método Alternativo: Render

### Pasos:

1. Ve a [render.com](https://render.com)
2. Conecta tu GitHub
3. Click "New +" → "Web Service"
4. Selecciona tu repo
5. Configura:
   - **Name**: codekit-pro
   - **Environment**: Node
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
6. Añade variables:
   - `PORT=5000`
   - `NODE_ENV=production`
7. Click "Create Web Service"

---

## Verificar Despliegue

Una vez desplegado, verifica:

✅ La página principal carga
✅ Las rutas funcionan (`/prompts`, `/snippets`, `/tools`)
✅ Puedes crear/editar/eliminar contenido
✅ Las herramientas funcionan

---

## ⚠️ Nota Importante

**Antes de desplegar**, ejecuta localmente:

```bash
npm install
npm run build
npm start
```

Si funciona localmente, funcionará en producción.

---

## 📝 Variables de Entorno

### Variables Mínimas Requeridas:

```bash
PORT=8604                    # Puerto donde correrá la aplicación
NODE_ENV=production          # Entorno de producción
DATABASE_URL=postgresql://usuario:password@host:5432/codekit_pro  # PostgreSQL (OBLIGATORIO)
JWT_SECRET=tu-secret-key-super-segura-minimo-32-caracteres  # Para autenticación
```

### Variables Opcionales (pero recomendadas):

```bash
ADMIN_PASSWORD=941259018a # Password para acceso admin
STRIPE_SECRET_KEY=sk_live_...           # Para suscripciones Stripe
STRIPE_WEBHOOK_SECRET=whsec_...          # Webhook secret de Stripe
ALLOWED_ORIGINS=https://codekitpro.app,https://www.codekitpro.app  # CORS origins permitidos
API_URL=https://codekitpro.app           # URL pública de la API
```

**Nota**: La aplicación ahora usa **PostgreSQL** como almacenamiento persistente. Los datos se guardan permanentemente en la base de datos.

---

## 🆘 Problemas Comunes

**Build falla**: 
- Verifica que `npm install` se ejecutó
- Revisa los logs en la plataforma

**App no carga**:
- Verifica que el PORT está configurado
- Revisa los logs del servidor

**Rutas no funcionan**:
- Asegúrate de que el build se completó correctamente
- Verifica que `dist/public` existe después del build

---

**¿Listo para desplegar?** Elige Railway o Render y sigue los pasos arriba. 🎉

