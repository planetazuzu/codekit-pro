# 🔍 Comandos para Verificar y Desplegar

## Diagnóstico Actual

El health check funciona pero la ruta `/api/docs` no existe. Esto significa que el código nuevo no está desplegado.

## Pasos para Solucionar

### 1. Verificar Estado de Git en el Servidor

```bash
cd /var/www/codekit-pro
git status
git log --oneline -5
git fetch origin main
git log HEAD..origin/main --oneline
```

### 2. Si Hay Commits Pendientes, Hacer Pull

```bash
cd /var/www/codekit-pro
git pull origin main
```

### 3. Verificar que los Archivos Nuevos Están Presentes

```bash
cd /var/www/codekit-pro
ls -la server/routes/docs.ts
ls -la client/src/pages/Docs.tsx
ls -la client/src/components/docs/
```

### 4. Reconstruir la Imagen Docker

```bash
cd /var/www/codekit-pro
docker compose build app
```

### 5. Reiniciar el Contenedor

```bash
docker compose restart app
```

### 6. Esperar y Verificar

```bash
sleep 20
curl http://localhost:8604/health
curl http://localhost:8604/api/docs/README.md
```

### 7. Ver Logs si Algo Falla

```bash
docker compose logs app --tail=50
```

## Comando Todo-en-Uno

```bash
cd /var/www/codekit-pro && \
git fetch origin main && \
git pull origin main && \
docker compose build app && \
docker compose restart app && \
sleep 20 && \
echo "=== Health Check ===" && \
curl http://localhost:8604/health && \
echo "" && \
echo "=== Verificando /api/docs ===" && \
curl http://localhost:8604/api/docs/README.md | head -10
```

