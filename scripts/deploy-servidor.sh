#!/bin/bash

# ============================================
# Script de Redeploy - CodeKit Pro (Servidor)
# Para ejecutar en el servidor de producción
# ============================================

set -e  # Salir si hay algún error

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuración
PROJECT_DIR="/var/www/codekit-pro"
PORT=8604

# Funciones de ayuda
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

# Banner
echo ""
echo "========================================="
echo "  🚀 REDEPLOY CodeKit Pro - Servidor"
echo "========================================="
echo ""

# 1. Verificar que estamos en el directorio correcto
info "Verificando directorio del proyecto..."
if [ ! -d "$PROJECT_DIR" ]; then
    error "Directorio $PROJECT_DIR no encontrado"
    exit 1
fi

cd "$PROJECT_DIR"
success "Directorio correcto: $PROJECT_DIR"

# 2. Verificar Docker
info "Verificando Docker..."
if ! command -v docker &> /dev/null; then
    error "Docker no está instalado"
    exit 1
fi
success "Docker encontrado: $(docker --version)"

# 3. Verificar Docker Compose
info "Verificando Docker Compose..."
if ! docker compose version &> /dev/null; then
    error "Docker Compose no está disponible"
    exit 1
fi
success "Docker Compose encontrado: $(docker compose version)"

# 4. Actualizar código desde GitHub
info "Actualizando código desde GitHub..."
if git pull origin main; then
    success "Código actualizado desde GitHub"
    info "Últimos commits:"
    git log --oneline -3
else
    error "Error al actualizar código"
    exit 1
fi

# 5. Detener contenedores
info "Deteniendo contenedores existentes..."
if docker compose down; then
    success "Contenedores detenidos"
else
    warning "No había contenedores corriendo o hubo un error"
fi

# 6. Reconstruir imagen
info "Reconstruyendo imagen de la aplicación (esto puede tardar varios minutos)..."
if docker compose build --no-cache app; then
    success "Imagen reconstruida correctamente"
else
    error "Error al reconstruir la imagen"
    exit 1
fi

# 7. Iniciar contenedores
info "Iniciando contenedores..."
if docker compose up -d; then
    success "Contenedores iniciados"
else
    error "Error al iniciar contenedores"
    exit 1
fi

# 8. Esperar a que la aplicación inicie
info "Esperando a que la aplicación inicie (15 segundos)..."
sleep 15

# 9. Verificar estado de contenedores
info "Verificando estado de contenedores..."
echo ""
docker compose ps
echo ""

# 10. Verificar health check
info "Verificando health check..."
for i in {1..10}; do
    if curl -sf http://localhost:$PORT/api/health > /dev/null; then
        success "✅ Aplicación respondiendo correctamente"
        echo ""
        info "Health check response:"
        curl -s http://localhost:$PORT/api/health | jq . || curl -s http://localhost:$PORT/api/health
        echo ""
        break
    else
        if [ $i -eq 10 ]; then
            warning "⚠️  La aplicación aún no responde después de varios intentos"
            info "Ver logs con: docker compose logs app"
        else
            info "Esperando respuesta... (intento $i/10)"
            sleep 3
        fi
    fi
done

# 11. Mostrar logs recientes
info "Últimos logs de la aplicación:"
echo ""
docker compose logs --tail=20 app
echo ""

# Resumen final
echo ""
echo "========================================="
success "✅ REDEPLOY COMPLETADO"
echo "========================================="
info "Aplicación disponible en:"
info "  - Local: http://localhost:$PORT"
info ""
info "Comandos útiles:"
info "  - Ver logs: docker compose logs -f app"
info "  - Ver estado: docker compose ps"
info "  - Reiniciar: docker compose restart app"
info "  - Ver logs de errores: docker compose logs app | grep -i error"
echo ""
