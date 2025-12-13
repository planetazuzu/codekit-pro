# 🚀 Comandos para Actualizar en el Servidor

## 📋 Comandos (Una vez dentro del servidor)

### 1. Ir al directorio del proyecto
```bash
cd /var/www/codekit-pro
```

### 2. Actualizar código desde GitHub
```bash
git pull origin main
```

### 3. Detener contenedores
```bash
docker compose down
```

### 4. Reconstruir imagen (sin cache)
```bash
docker compose build --no-cache app
```

### 5. Iniciar contenedores
```bash
docker compose up -d
```

### 6. Esperar a que inicie (15 segundos)
```bash
sleep 15
```

### 7. Verificar estado
```bash
docker compose ps
```

### 8. Ver logs recientes
```bash
docker compose logs --tail=30 app
```

### 9. Verificar health check
```bash
curl http://localhost:8604/api/health
```

---

## 🔄 Comando Todo-en-Uno (Copia y pega)

```bash
cd /var/www/codekit-pro && \
git pull origin main && \
docker compose down && \
docker compose build --no-cache app && \
docker compose up -d && \
sleep 15 && \
echo "=== Estado de Contenedores ===" && \
docker compose ps && \
echo "" && \
echo "=== Últimos Logs ===" && \
docker compose logs --tail=30 app && \
echo "" && \
echo "=== Health Check ===" && \
curl http://localhost:8604/api/health
```

---

## ⚠️ Si hay problemas

### Ver logs completos:
```bash
docker compose logs --tail=100 app
```

### Reiniciar solo el contenedor de la app:
```bash
docker compose restart app
```

### Verificar que el puerto está escuchando:
```bash
netstat -tlnp | grep 8604 || ss -tlnp | grep 8604
```

### Forzar rebuild completo (si hay problemas):
```bash
docker compose down
docker compose build --no-cache
docker compose up -d
```

---

**Nota:** Después del despliegue, limpia el Service Worker en el navegador (una vez):
- DevTools → Application → Service Workers → Unregister
- Application → Storage → Clear site data
- Hard reload: `Ctrl+Shift+R`

