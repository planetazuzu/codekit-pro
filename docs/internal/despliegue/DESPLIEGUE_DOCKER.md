# 🐳 Despliegue con Docker - CodeKit Pro

## 🎯 Ventajas de Docker

- ✅ Entorno consistente y reproducible
- ✅ Sin problemas de dependencias
- ✅ PostgreSQL incluido automáticamente
- ✅ Fácil de actualizar y mantener
- ✅ Aislamiento completo

---

## 📋 Requisitos Previos

- Docker instalado
- Docker Compose instalado

### Instalar Docker en el Servidor

```bash
# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Instalar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verificar instalación
docker --version
docker-compose --version
```

---

## 🚀 Despliegue Paso a Paso

### Paso 1: Conectarse al Servidor

```bash
ssh root@207.180.226.141
```

### Paso 2: Limpiar Instalación Anterior (Opcional)

```bash
# Detener y eliminar contenedores antiguos
docker stop codekit-pro codekit-postgres 2>/dev/null || true
docker rm codekit-pro codekit-postgres 2>/dev/null || true

# Eliminar imágenes antiguas (opcional)
docker rmi codekit-pro 2>/dev/null || true

# Eliminar directorio antiguo si existe
rm -rf /var/www/codekit-pro
```

### Paso 3: Clonar Repositorio

```bash
mkdir -p /var/www
cd /var/www
git clone https://github.com/planetazuzu/codekit-pro.git
cd codekit-pro
```

### Paso 4: Crear Archivo .env

```bash
# Generar JWT_SECRET
JWT_SECRET=$(openssl rand -base64 32)

# Crear .env
cat > .env << EOF
NODE_ENV=production
PORT=8604

# Seguridad
JWT_SECRET=$JWT_SECRET
ADMIN_PASSWORD=941259018a
WEBHOOK_SECRET=Oe6OTVBc4Nh2UZ0XwdIuRlek10vpJdacKtXN8N6GsI8=

# Base de Datos (usará PostgreSQL del docker-compose)
DATABASE_URL=postgresql://codekit_user:codekit_password@postgres:5432/codekit_pro
EOF

# Verificar
cat .env
```

### Paso 5: Construir y Iniciar con Docker Compose

```bash
# Construir imágenes
docker-compose build

# Iniciar servicios
docker-compose up -d

# Ver logs
docker-compose logs -f
```

### Paso 6: Aplicar Migraciones de Base de Datos

```bash
# Ejecutar migraciones dentro del contenedor
docker-compose exec app npm run db:push
```

### Paso 7: Verificar

```bash
# Ver estado de contenedores
docker-compose ps

# Ver logs
docker-compose logs app

# Health check
curl http://localhost:8604/health

# Desde fuera del servidor
curl http://207.180.226.141:8604/health
```

---

## 🔄 Comandos Útiles

### Ver Logs

```bash
# Logs en tiempo real
docker-compose logs -f app

# Últimas 100 líneas
docker-compose logs --tail=100 app
```

### Reiniciar

```bash
# Reiniciar aplicación
docker-compose restart app

# Reconstruir y reiniciar
docker-compose up -d --build app
```

### Detener

```bash
# Detener servicios
docker-compose stop

# Detener y eliminar contenedores
docker-compose down

# Detener y eliminar contenedores + volúmenes (⚠️ elimina datos)
docker-compose down -v
```

### Actualizar Código

```bash
cd /var/www/codekit-pro

# Actualizar código
git pull origin main

# Reconstruir y reiniciar
docker-compose up -d --build

# Aplicar migraciones si hay cambios en BD
docker-compose exec app npm run db:push
```

---

## 🔧 Configuración de Nginx Proxy Manager

Una vez que Docker esté corriendo:

1. Ve a: `http://207.180.226.141:81`
2. Login
3. **Add Proxy Host:**
   - **Domain Names:** `codekitpro.app`
   - **Scheme:** `http`
   - **Forward Hostname/IP:** `localhost` (o `127.0.0.1`)
   - **Forward Port:** `8604`
   - **SSL:** Request new SSL Certificate
   - **Force SSL:** ✅

---

## 📊 Verificar Estado

```bash
# Estado de contenedores
docker-compose ps

# Uso de recursos
docker stats

# Logs de PostgreSQL
docker-compose logs postgres

# Conectarse a PostgreSQL
docker-compose exec postgres psql -U codekit_user -d codekit_pro
```

---

## 🐛 Troubleshooting

### Error: "Cannot connect to database"

```bash
# Verificar que PostgreSQL está corriendo
docker-compose ps postgres

# Ver logs de PostgreSQL
docker-compose logs postgres

# Reiniciar PostgreSQL
docker-compose restart postgres
```

### Error: "Port already in use"

```bash
# Ver qué está usando el puerto
sudo lsof -i :8604

# Detener contenedores antiguos
docker-compose down
```

### Error de Build

```bash
# Ver logs detallados del build
docker-compose build --no-cache

# Limpiar todo y empezar de nuevo
docker-compose down -v
docker system prune -a
docker-compose build
docker-compose up -d
```

### Los Contenedores No Inician

```bash
# Ver logs de todos los servicios
docker-compose logs

# Verificar configuración
docker-compose config
```

---

## 📋 Checklist de Despliegue

- [ ] Docker instalado
- [ ] Docker Compose instalado
- [ ] Repositorio clonado en `/var/www/codekit-pro`
- [ ] Archivo `.env` creado con todas las variables
- [ ] `docker-compose build` ejecutado exitosamente
- [ ] `docker-compose up -d` ejecutado
- [ ] Contenedores corriendo (`docker-compose ps`)
- [ ] Migraciones aplicadas (`docker-compose exec app npm run db:push`)
- [ ] Health check funciona (`curl http://localhost:8604/health`)
- [ ] Nginx Proxy Manager configurado
- [ ] Aplicación accesible en `https://codekitpro.app`

---

## 🎉 Ventajas del Despliegue con Docker

1. **Sin problemas de dependencias** - Todo está aislado
2. **PostgreSQL incluido** - No necesitas instalarlo por separado
3. **Fácil actualización** - Solo `git pull` y `docker-compose up -d --build`
4. **Rollback fácil** - Puedes volver a versiones anteriores fácilmente
5. **Logs centralizados** - `docker-compose logs` para todo

---

## 🚀 Comando Todo-en-Uno

```bash
# En el servidor
cd /var/www && \
rm -rf codekit-pro && \
git clone https://github.com/planetazuzu/codekit-pro.git && \
cd codekit-pro && \
JWT_SECRET=$(openssl rand -base64 32) && \
cat > .env << EOF
NODE_ENV=production
PORT=8604
JWT_SECRET=$JWT_SECRET
ADMIN_PASSWORD=941259018a
WEBHOOK_SECRET=Oe6OTVBc4Nh2UZ0XwdIuRlek10vpJdacKtXN8N6GsI8=
DATABASE_URL=postgresql://codekit_user:codekit_password@postgres:5432/codekit_pro
EOF
docker-compose build && \
docker-compose up -d && \
sleep 10 && \
docker-compose exec app npm run db:push && \
docker-compose ps && \
curl http://localhost:8604/health
```

---

**¿Listo para desplegar con Docker?** Es mucho más fácil y confiable! 🐳

