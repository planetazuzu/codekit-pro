#!/bin/bash

# Script para forzar despliegue manual cuando el automático falla
# Útil cuando no se ven los cambios en producción

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

success() {
    echo -e "${GREEN}[✓]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[⚠]${NC} $1"
}

error() {
    echo -e "${RED}[✗]${NC} $1"
}

PROJECT_DIR=${PROJECT_DIR:-"/var/www/codekit-pro"}

echo "=========================================="
echo "🚀 Forzar Despliegue Manual - CodeKit Pro"
echo "=========================================="
echo ""

cd "${PROJECT_DIR}" || {
    error "No se pudo acceder al directorio ${PROJECT_DIR}"
    exit 1
}

# Verificar Docker
if ! command -v docker &> /dev/null; then
    error "Docker no está instalado"
    exit 1
fi

DOCKER_COMPOSE_CMD="docker compose"
if ! command -v docker compose &> /dev/null; then
    DOCKER_COMPOSE_CMD="docker-compose"
fi

# 1. Actualizar código desde Git
info "1. Actualizando código desde Git..."
if [ -d ".git" ]; then
    git fetch origin main || {
        warning "No se pudo hacer fetch, continuando..."
    }
    
    # Ver commits pendientes
    PENDING=$(git log HEAD..origin/main --oneline 2>/dev/null | wc -l)
    if [ "$PENDING" -gt 0 ]; then
        info "Hay $PENDING commits pendientes"
        git log HEAD..origin/main --oneline
        echo ""
        info "Haciendo pull..."
        git pull origin main || {
            error "No se pudo hacer pull. Verifica permisos y conexión."
            exit 1
        }
        success "Código actualizado"
    else
        success "Código ya está actualizado"
    fi
else
    warning "No es un repositorio Git, saltando actualización"
fi
echo ""

# 2. Verificar .env
info "2. Verificando archivo .env..."
if [ ! -f ".env" ]; then
    error "Archivo .env no encontrado"
    exit 1
fi
success "Archivo .env encontrado"
echo ""

# 3. Reconstruir imagen Docker
info "3. Reconstruyendo imagen Docker (esto puede tardar varios minutos)..."
if $DOCKER_COMPOSE_CMD build app; then
    success "Imagen reconstruida"
else
    error "Error al reconstruir la imagen"
    exit 1
fi
echo ""

# 4. Reiniciar contenedor
info "4. Reiniciando contenedor de la aplicación..."
$DOCKER_COMPOSE_CMD up -d app || {
    error "Error al reiniciar contenedor"
    exit 1
}
success "Contenedor reiniciado"
echo ""

# 5. Esperar a que la app inicie
info "5. Esperando a que la aplicación inicie (15 segundos)..."
sleep 15
echo ""

# 6. Verificar health check
info "6. Verificando health check..."
for i in {1..5}; do
    if curl -f -s http://localhost:8604/health > /dev/null 2>&1; then
        success "Health check OK"
        break
    else
        if [ $i -eq 5 ]; then
            error "Health check falló después de 5 intentos"
            warning "Revisa los logs: docker compose logs app"
            exit 1
        fi
        warning "Intento $i/5 falló, esperando 5 segundos..."
        sleep 5
    fi
done
echo ""

# 7. Verificar nueva funcionalidad
info "7. Verificando nueva funcionalidad..."
if curl -s http://localhost:8604/api/docs/README.md > /dev/null 2>&1; then
    success "Nueva ruta /api/docs está disponible"
else
    warning "Nueva ruta /api/docs no está disponible aún"
fi
echo ""

# 8. Mostrar logs recientes
info "8. Últimos logs de la aplicación:"
$DOCKER_COMPOSE_CMD logs app --tail=20
echo ""

# Resumen
echo "=========================================="
echo "✅ Despliegue Completado"
echo "=========================================="
echo ""
echo "La aplicación debería estar actualizada en:"
echo "  - https://codekitpro.app"
echo "  - https://codekitpro.app/docs"
echo ""
echo "Si no ves los cambios:"
echo "  1. Limpia la caché del navegador (Ctrl+Shift+R)"
echo "  2. Desregistra el Service Worker (DevTools > Application > Service Workers)"
echo "  3. Espera unos minutos y recarga"
echo ""


