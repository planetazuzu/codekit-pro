# ✅ Agregar USE_DOCKER al .env del Servidor

## 📋 Lo que Falta

Tu archivo `.env` actual tiene:
- ✅ `WEBHOOK_SECRET` (ya configurado)
- ✅ Todas las demás variables
- ❌ **Falta**: `USE_DOCKER=true`

## 🚀 Pasos para Agregarlo

### En el Servidor:

```bash
# 1. Conectar al servidor
ssh root@207.180.226.141

# 2. Ir al directorio
cd /var/www/codekit-pro

# 3. Editar .env
nano .env
```

### Agregar esta línea al final:

```bash
USE_DOCKER=true
```

### Tu .env completo debería quedar así:

```bash
NODE_ENV=production
PORT=8604
JWT_SECRET=my4LUllaBJstIet2ElLjGKDloDRvferobLnXmsYV0co=
ADMIN_PASSWORD=941259018a
WEBHOOK_SECRET=Oe6OTVBc4Nh2UZ0XwdIuRlek10vpJdacKtXN8N6GsI8=
DATABASE_URL=postgresql://codekit_user:codekit_password@postgres:5432/codekit_pro
USE_DOCKER=true
```

### Guardar y Reiniciar:

```bash
# Guardar (Ctrl+X, Y, Enter en nano)

# Reiniciar aplicación
docker compose restart app

# Verificar
curl http://localhost:8604/api/webhooks/status
```

## ✅ Verificación

Después de agregar `USE_DOCKER=true` y reiniciar, verifica:

```bash
# Verificar que la variable está cargada
docker compose exec app printenv | grep USE_DOCKER

# Debería mostrar:
USE_DOCKER=true

# Verificar webhook
curl http://localhost:8604/api/webhooks/status
```

## 🎯 Listo

Una vez agregado `USE_DOCKER=true`, el CI/CD automático usará Docker para los despliegues.

