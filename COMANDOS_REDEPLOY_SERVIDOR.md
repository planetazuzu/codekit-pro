# 🚀 Comandos para Redeploy en el Servidor

## 📋 Script Completo (Copia y Pega Directamente)

### Opción A: Ejecutar Script Automático

```bash
cd /var/www/codekit-pro && bash <(curl -s https://raw.githubusercontent.com/planetazuzu/codekit-pro/main/scripts/deploy-servidor.sh)
```

O si ya tienes el script en el servidor:

```bash
cd /var/www/codekit-pro && bash scripts/deploy-servidor.sh
```

### Opción B: Comando Manual (Una Línea)

```bash
cd /var/www/codekit-pro && git pull origin main && docker compose down && docker compose build --no-cache app && docker compose up -d && sleep 15 && docker compose ps && curl http://localhost:8604/api/health
```

---

## 🔧 Paso a Paso (Recomendado para Debugging)

```bash
# 1. Conectar al servidor
ssh usuario@tu-servidor

# 2. Ir al directorio del proyecto
cd /var/www/codekit-pro

# 3. Actualizar código desde GitHub
git pull origin main

# 4. Verificar últimos commits
git log --oneline -3

# 5. Detener contenedores
docker compose down

# 6. Reconstruir imagen (sin caché para asegurar cambios)
docker compose build --no-cache app

# 7. Iniciar contenedores
docker compose up -d

# 8. Esperar a que inicie
sleep 15

# 9. Verificar estado
docker compose ps

# 10. Verificar health check
curl http://localhost:8604/api/health

# 11. Ver logs
docker compose logs --tail=50 app
```

---

## 📦 Versión Rápida (Con Caché - Más Rápida)

Si solo cambiaste código y no dependencias:

```bash
cd /var/www/codekit-pro && git pull origin main && docker compose build app && docker compose up -d && sleep 10 && docker compose ps && curl http://localhost:8604/api/health
```

---

## 🔍 Verificación y Debugging

```bash
# Ver logs en tiempo real
docker compose logs -f app

# Ver solo errores
docker compose logs app | grep -i error

# Ver estado de contenedores
docker compose ps

# Ver estado detallado (incluyendo detenidos)
docker compose ps -a

# Verificar que responde
curl http://localhost:8604/api/health

# Verificar desde fuera del servidor (si tienes acceso)
curl https://tu-dominio.com/api/health
```

---

## 🆘 Si Algo Sale Mal

### Error: No se puede actualizar código

```bash
# Verificar que tienes permisos
ls -la /var/www/codekit-pro/.git

# Forzar actualización
cd /var/www/codekit-pro
git fetch origin
git reset --hard origin/main
```

### Error: Docker no responde

```bash
# Reiniciar Docker
sudo systemctl restart docker

# Verificar que Docker funciona
docker ps
```

### Error: Contenedor no inicia

```bash
# Ver logs detallados
docker compose logs app

# Ver logs de todos los servicios
docker compose logs

# Intentar iniciar sin modo detached para ver errores
docker compose up app
```

### Error: Puerto en uso

```bash
# Ver qué está usando el puerto
sudo lsof -i :8604

# Detener proceso si es necesario
sudo kill -9 <PID>
```

### Reconstruir desde cero

```bash
cd /var/www/codekit-pro

# Detener y eliminar todo
docker compose down -v

# Eliminar imágenes
docker rmi codekit-pro-app || true

# Reconstruir completamente
docker compose build --no-cache app
docker compose up -d

# Esperar y verificar
sleep 20
docker compose ps
curl http://localhost:8604/api/health
```

---

## 📝 Script para Copiar al Servidor

Si prefieres tener el script en el servidor, cópialo así:

```bash
# En tu máquina local, copia el script al servidor
scp scripts/deploy-servidor.sh usuario@servidor:/var/www/codekit-pro/scripts/

# Luego en el servidor, ejecútalo
cd /var/www/codekit-pro
chmod +x scripts/deploy-servidor.sh
bash scripts/deploy-servidor.sh
```

---

## ✅ Checklist Post-Deploy

- [ ] Verificar que `docker compose ps` muestra todos los contenedores "Up"
- [ ] Verificar que `/api/health` responde correctamente
- [ ] Probar la aplicación en el navegador
- [ ] Verificar que no hay errores en los logs
- [ ] Probar en móvil (problema original que se corrigió)
- [ ] Verificar que las nuevas correcciones funcionan

---

## 🎯 Comando Final Recomendado

Para la mayoría de casos, este comando funciona perfecto:

```bash
cd /var/www/codekit-pro && git pull origin main && docker compose down && docker compose build --no-cache app && docker compose up -d && sleep 15 && docker compose ps && echo "" && echo "✅ Health Check:" && curl -s http://localhost:8604/api/health | jq . || curl -s http://localhost:8604/api/health
```

Este comando:
1. ✅ Actualiza código
2. ✅ Detiene contenedores
3. ✅ Reconstruye sin caché
4. ✅ Inicia contenedores
5. ✅ Espera a que inicie
6. ✅ Muestra estado
7. ✅ Verifica health check

---

**Última actualización**: $(date)
**Cambios desplegados**: Fix problemas móvil + VirtualizedGrid TypeScript error
