# 🌐 Configuración del Dominio - codekitpro.app

## ✅ Configuración Actual

- **Dominio**: `codekitpro.app`
- **Puerto**: `8604`
- **URL Completa**: `https://codekitpro.app` (o `http://codekitpro.app:8604` si no hay proxy)

---

## 🔧 Configuración de Variables de Entorno

Asegúrate de tener estas variables en tu `.env`:

```bash
# Puerto de la aplicación
PORT=8604

# Entorno
NODE_ENV=production

# Base de Datos
DATABASE_URL=postgresql://planetazuzu:941259018a@localhost:5432/codekit_pro

# Seguridad
JWT_SECRET=JWHLdT2/AuV0w10CCweT2ajKvq6ZsPAb/p4AVD1+qtQ=

# CORS - Dominios permitidos
ALLOWED_ORIGINS=https://codekitpro.app,https://www.codekitpro.app

# API URL - URL pública
API_URL=https://codekitpro.app
```

---

## 🌐 Configuración de DNS

### Opción 1: Proxy Reverso con Nginx

Si usas Nginx como proxy reverso, configura así:

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name codekitpro.app www.codekitpro.app;

    # Redirigir HTTP a HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name codekitpro.app www.codekitpro.app;

    # Certificados SSL (Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/codekitpro.app/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/codekitpro.app/privkey.pem;

    # Configuración SSL
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Logs
    access_log /var/log/nginx/codekitpro.app.access.log;
    error_log /var/log/nginx/codekitpro.app.error.log;

    # Proxy a la aplicación en puerto 8604
    location / {
        proxy_pass http://localhost:8604;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # WebSocket support (si es necesario)
    location /ws {
        proxy_pass http://localhost:8604;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

### Opción 2: Cloudflare (Recomendado)

Si usas Cloudflare:

1. **DNS**: Configura un registro A apuntando a la IP de tu servidor
2. **SSL/TLS**: Activa "Full" o "Full (strict)" en Cloudflare
3. **Proxy**: Activa el proxy de Cloudflare (nube naranja)
4. **Page Rules**: Configura reglas si es necesario

### Opción 3: Acceso Directo (Solo desarrollo)

Si quieres acceder directamente sin proxy:

```
http://codekitpro.app:8604
```

**Nota**: Esto requiere que el puerto 8604 esté abierto en el firewall.

---

## 🔒 Configuración SSL/TLS

### Con Let's Encrypt (Certbot)

```bash
# Instalar certbot
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx

# Obtener certificado
sudo certbot --nginx -d codekitpro.app -d www.codekitpro.app

# Renovación automática
sudo certbot renew --dry-run
```

### Con Cloudflare

Si usas Cloudflare, el SSL se maneja automáticamente. Solo asegúrate de:
- Activar SSL/TLS en modo "Full" o "Full (strict)"
- Configurar origen con certificado válido o usar "Flexible"

---

## 🔥 Configuración de Firewall

Asegúrate de que estos puertos estén abiertos:

```bash
# HTTP y HTTPS (si usas Nginx)
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Puerto de la aplicación (solo si accedes directamente)
sudo ufw allow 8604/tcp

# Verificar estado
sudo ufw status
```

---

## ✅ Verificación Post-Configuración

Una vez configurado, verifica:

```bash
# 1. DNS resuelve correctamente
dig codekitpro.app
nslookup codekitpro.app

# 2. Puerto 8604 está escuchando
lsof -i :8604

# 3. Aplicación responde
curl http://localhost:8604/health

# 4. SSL funciona (si configurado)
curl https://codekitpro.app/health

# 5. CORS funciona correctamente
curl -H "Origin: https://codekitpro.app" https://codekitpro.app/api/prompts
```

---

## 📝 Notas Importantes

1. **ALLOWED_ORIGINS**: Debe incluir tanto `codekitpro.app` como `www.codekitpro.app` si ambos están configurados
2. **API_URL**: Usado para webhooks de Stripe y callbacks, debe ser la URL pública completa
3. **Proxy Reverso**: Recomendado usar Nginx o Cloudflare para manejar SSL y routing
4. **Puerto 8604**: La aplicación corre internamente en este puerto, el proxy lo expone en 80/443

---

## 🆘 Solución de Problemas

### DNS no resuelve

```bash
# Verificar configuración DNS
dig codekitpro.app
nslookup codekitpro.app

# Verificar que el registro A apunta a tu IP
host codekitpro.app
```

### SSL no funciona

```bash
# Verificar certificado
sudo certbot certificates

# Renovar certificado
sudo certbot renew

# Verificar configuración Nginx
sudo nginx -t
```

### CORS errors

```bash
# Verificar ALLOWED_ORIGINS en .env
grep ALLOWED_ORIGINS .env

# Reiniciar aplicación después de cambiar .env
pm2 restart codekit-pro-8604
```

---

**Estado**: ✅ Dominio configurado: `codekitpro.app`

