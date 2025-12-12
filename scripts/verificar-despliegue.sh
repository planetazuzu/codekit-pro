#!/bin/bash

# Script para verificar el estado del despliegue
# Útil para diagnosticar por qué no se ven los cambios

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
echo "🔍 Verificación de Despliegue - CodeKit Pro"
echo "=========================================="
echo ""

cd "${PROJECT_DIR}" || {
    error "No se pudo acceder al directorio ${PROJECT_DIR}"
    exit 1
}

# 1. Verificar estado de Git
info "1. Verificando estado de Git..."
echo ""
echo "Último commit local:"
git log --oneline -1 || warning "No se pudo obtener último commit"
echo ""

echo "Estado del repositorio:"
git status --short || warning "No se pudo obtener estado"
echo ""

echo "Último commit en origin/main:"
git fetch origin main --quiet 2>/dev/null || warning "No se pudo hacer fetch"
git log origin/main --oneline -1 || warning "No se pudo obtener commit remoto"
echo ""

echo "Commits pendientes de pull:"
PENDING=$(git log HEAD..origin/main --oneline 2>/dev/null | wc -l)
if [ "$PENDING" -gt 0 ]; then
    warning "Hay $PENDING commits pendientes de pull"
    git log HEAD..origin/main --oneline
else
    success "Repositorio está actualizado"
fi
echo ""

# 2. Verificar Docker
info "2. Verificando estado de Docker..."
echo ""

if command -v docker &> /dev/null; then
    success "Docker está instalado: $(docker --version)"
else
    error "Docker no está instalado"
fi

if command -v docker compose &> /dev/null || command -v docker-compose &> /dev/null; then
    success "Docker Compose está disponible"
else
    error "Docker Compose no está disponible"
fi
echo ""

# 3. Verificar contenedores
info "3. Verificando estado de contenedores..."
echo ""

if [ -f "docker-compose.yml" ]; then
    DOCKER_COMPOSE_CMD="docker compose"
    if ! command -v docker compose &> /dev/null; then
        DOCKER_COMPOSE_CMD="docker-compose"
    fi
    
    echo "Estado de contenedores:"
    $DOCKER_COMPOSE_CMD ps || warning "No se pudo obtener estado de contenedores"
    echo ""
    
    echo "Últimos logs de la aplicación (últimas 20 líneas):"
    $DOCKER_COMPOSE_CMD logs app --tail=20 2>/dev/null || warning "No se pudieron obtener logs"
    echo ""
else
    error "No se encontró docker-compose.yml"
fi

# 4. Verificar webhook
info "4. Verificando webhook..."
echo ""

if curl -s http://localhost:8604/api/webhooks/status > /dev/null 2>&1; then
    echo "Estado del webhook:"
    curl -s http://localhost:8604/api/webhooks/status | python3 -m json.tool 2>/dev/null || curl -s http://localhost:8604/api/webhooks/status
    echo ""
else
    warning "No se pudo conectar al endpoint de webhook"
fi

# 5. Verificar health check
info "5. Verificando health check..."
echo ""

if curl -s http://localhost:8604/health > /dev/null 2>&1; then
    echo "Respuesta del health check:"
    curl -s http://localhost:8604/health | python3 -m json.tool 2>/dev/null || curl -s http://localhost:8604/health
    success "Health check OK"
    echo ""
else
    error "Health check falló - la aplicación no está respondiendo"
fi

# 6. Verificar nueva ruta de docs
info "6. Verificando nueva ruta de documentación..."
echo ""

if curl -s http://localhost:8604/api/docs/README.md > /dev/null 2>&1; then
    success "Ruta /api/docs está disponible"
    echo "Primeras líneas del documento:"
    curl -s http://localhost:8604/api/docs/README.md | head -5
    echo ""
else
    warning "Ruta /api/docs no está disponible - puede que el despliegue no se haya completado"
fi

# 7. Verificar logs de webhook recientes
info "7. Buscando logs de webhook recientes..."
echo ""

if [ -f "docker-compose.yml" ]; then
    echo "Últimas menciones de 'webhook' o 'deploy' en logs:"
    $DOCKER_COMPOSE_CMD logs app --tail=200 2>/dev/null | grep -i "webhook\|deploy" | tail -10 || warning "No se encontraron logs de webhook"
    echo ""
fi

# Resumen
echo "=========================================="
echo "📊 Resumen"
echo "=========================================="
echo ""

if [ "$PENDING" -gt 0 ]; then
    warning "⚠️  Hay commits pendientes - ejecuta 'git pull origin main'"
fi

if curl -s http://localhost:8604/health > /dev/null 2>&1; then
    success "✅ Aplicación está funcionando"
else
    error "❌ Aplicación no está respondiendo"
fi

if curl -s http://localhost:8604/api/docs/README.md > /dev/null 2>&1; then
    success "✅ Nueva funcionalidad está disponible"
else
    warning "⚠️  Nueva funcionalidad no está disponible - puede necesitar despliegue"
fi

echo ""
echo "Para forzar despliegue manual, ejecuta:"
echo "  cd ${PROJECT_DIR}"
echo "  git pull origin main"
echo "  docker compose build app"
echo "  docker compose restart app"

