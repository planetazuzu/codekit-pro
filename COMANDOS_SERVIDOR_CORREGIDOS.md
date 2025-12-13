# 🔧 Comandos Corregidos para el Servidor

## ⚠️ IMPORTANTE: Primero verifica que estás en el directorio correcto

```bash
# Verificar directorio actual
pwd

# Debe mostrar: /var/www/codekit-pro
# Si no, ejecuta:
cd /var/www/codekit-pro
```

## 📋 Comandos Correctos (Paso a Paso)

### 1. Ir al directorio correcto
```bash
cd /var/www/codekit-pro
```

### 2. Verificar que estás en el lugar correcto
```bash
ls -la | grep docker-compose
# Debe mostrar: docker-compose.yml
```

### 3. Actualizar código
```bash
git pull origin main
```

### 4. Detener contenedores
```bash
docker compose down
```

### 5. Reconstruir imagen
```bash
docker compose build --no-cache app
```

### 6. Iniciar contenedores
```bash
docker compose up -d
```

### 7. Esperar
```bash
sleep 15
```

### 8. Verificar estado
```bash
docker compose ps
```

### 9. Ver logs
```bash
docker compose logs --tail=30 app
```

### 10. Health check (CORREGIDO - sin espacios ni caracteres raros)
```bash
curl http://localhost:8604/api/health
```

---

## 🔄 Comando Todo-en-Uno CORREGIDO

```bash
cd /var/www/codekit-pro && git pull origin main && docker compose down && docker compose build --no-cache app && docker compose up -d && sleep 15 && docker compose ps && docker compose logs --tail=30 app && curl http://localhost:8604/api/health
```

---

## 🐛 Si sigues teniendo problemas

### Verificar que docker-compose.yml existe:
```bash
cd /var/www/codekit-pro
ls -la docker-compose.yml
```

### Verificar que git está configurado:
```bash
cd /var/www/codekit-pro
git remote -v
```

### Verificar permisos:
```bash
cd /var/www/codekit-pro
ls -la
```

### Si docker compose no funciona, prueba con docker-compose (con guión):
```bash
docker-compose down
docker-compose build --no-cache app
docker-compose up -d
```

---

## ✅ Verificación Final

Después de ejecutar los comandos, verifica:

1. **Contenedores corriendo:**
   ```bash
   docker compose ps
   ```
   Debe mostrar `codekit-pro` y `codekit-postgres` como `Up`

2. **Health check:**
   ```bash
   curl http://localhost:8604/api/health
   ```
   Debe devolver: `{"success":true,"status":"healthy",...}`

3. **Logs sin errores:**
   ```bash
   docker compose logs --tail=50 app | grep -i error
   ```

