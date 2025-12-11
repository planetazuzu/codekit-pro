# 🧹 Limpiar Todo y Desplegar con Docker

## 🎯 Objetivo

Eliminar toda la instalación anterior y empezar limpio con Docker.

---

## 🧹 Paso 1: Limpiar Todo

Ejecuta esto **en el servidor**:

```bash
# Detener PM2
pm2 stop codekit-pro-8604 2>/dev/null || true
pm2 delete codekit-pro-8604 2>/dev/null || true
pm2 kill 2>/dev/null || true

# Detener contenedores Docker antiguos
docker stop codekit-pro codekit-postgres 2>/dev/null || true
docker rm codekit-pro codekit-postgres 2>/dev/null || true

# Eliminar directorio antiguo
rm -rf /var/www/codekit-pro

# Limpiar imágenes Docker antiguas (opcional)
docker rmi codekit-pro 2>/dev/null || true

# Limpiar volúmenes Docker (opcional, elimina datos de BD)
# docker volume rm codekit-pro_postgres_data 2>/dev/null || true
```

---

## 🐳 Paso 2: Instalar Docker (si no está)

```bash
# Verificar si Docker está instalado
docker --version

# Si no está instalado:
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Instalar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verificar
docker --version
docker-compose --version
```

---

## 📥 Paso 3: Clonar Repositorio

```bash
cd /var/www
git clone https://github.com/planetazuzu/codekit-pro.git
cd codekit-pro
```

---

## ⚙️ Paso 4: Crear .env

```bash
# Generar JWT_SECRET
JWT_SECRET=$(openssl rand -base64 32)

# Crear .env
cat > .env << EOF
NODE_ENV=production
PORT=8604
JWT_SECRET=$JWT_SECRET
ADMIN_PASSWORD=941259018a
WEBHOOK_SECRET=Oe6OTVBc4Nh2UZ0XwdIuRlek10vpJdacKtXN8N6GsI8=
DATABASE_URL=postgresql://codekit_user:codekit_password@postgres:5432/codekit_pro
EOF

# Verificar
cat .env
```

---

## 🚀 Paso 5: Desplegar con Docker

```bash
# Construir imágenes (esto puede tardar varios minutos)
docker-compose build

# Iniciar servicios
docker-compose up -d

# Ver logs mientras inicia
docker-compose logs -f
```

**Presiona `Ctrl+C` para salir de los logs cuando veas que está corriendo.**

---

## 🗄️ Paso 6: Aplicar Migraciones

```bash
# Esperar a que PostgreSQL esté listo (unos 10-15 segundos)
sleep 15

# Aplicar migraciones
docker-compose exec app npm run db:push
```

---

## ✅ Paso 7: Verificar

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

## 🎯 Comando Todo-en-Uno Completo

Copia y pega esto completo en el servidor:

```bash
# Limpiar todo
pm2 stop codekit-pro-8604 2>/dev/null; pm2 delete codekit-pro-8604 2>/dev/null; \
docker stop codekit-pro codekit-postgres 2>/dev/null; docker rm codekit-pro codekit-postgres 2>/dev/null; \
rm -rf /var/www/codekit-pro

# Instalar Docker si no está
command -v docker >/dev/null || (curl -fsSL https://get.docker.com -o get-docker.sh && sh get-docker.sh && rm get-docker.sh)
command -v docker-compose >/dev/null || (sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose && sudo chmod +x /usr/local/bin/docker-compose)

# Clonar repositorio
cd /var/www && git clone https://github.com/planetazuzu/codekit-pro.git && cd codekit-pro

# Crear .env
JWT_SECRET=$(openssl rand -base64 32) && cat > .env << EOF
NODE_ENV=production
PORT=8604
JWT_SECRET=$JWT_SECRET
ADMIN_PASSWORD=941259018a
WEBHOOK_SECRET=Oe6OTVBc4Nh2UZ0XwdIuRlek10vpJdacKtXN8N6GsI8=
DATABASE_URL=postgresql://codekit_user:codekit_password@postgres:5432/codekit_pro
EOF

# Desplegar con Docker
echo "🔨 Construyendo imágenes Docker (esto puede tardar 5-10 minutos)..."
docker-compose build

echo "🚀 Iniciando servicios..."
docker-compose up -d

echo "⏳ Esperando a que los servicios estén listos..."
sleep 15

echo "🗄️ Aplicando migraciones de base de datos..."
docker-compose exec app npm run db:push

echo "✅ Verificando estado..."
docker-compose ps
curl http://localhost:8604/health
```

---

## 🔍 Comandos Útiles Después

```bash
# Ver logs en tiempo real
docker-compose logs -f app

# Reiniciar aplicación
docker-compose restart app

# Actualizar código
cd /var/www/codekit-pro
git pull origin main
docker-compose up -d --build

# Ver estado
docker-compose ps

# Detener todo
docker-compose stop

# Eliminar todo (incluye datos)
docker-compose down -v
```

---

## 🎉 Ventajas de Docker

- ✅ Sin problemas de dependencias
- ✅ PostgreSQL incluido automáticamente
- ✅ Entorno consistente
- ✅ Fácil de actualizar
- ✅ Fácil de hacer rollback

---

**Ejecuta el comando todo-en-uno y debería funcionar perfectamente! 🐳**

