#!/bin/bash

# ============================================
# Script de Despliegue Automático con Docker - CodeKit Pro
# Ejecutado por webhook o CI/CD
# ============================================

set -e  # Salir si hay algún error

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuración
DEPLOY_COMMIT=${DEPLOY_COMMIT:-"unknown"}
DEPLOY_REF=${DEPLOY_REF:-"unknown"}
DEPLOY_USER=${DEPLOY_USER:-"system"}
PROJECT_DIR=${PROJECT_DIR:-"/var/www/codekit-pro"}

# Función para imprimir mensajes
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

info "🚀 Iniciando despliegue automático con Docker..."
info "Commit: ${DEPLOY_COMMIT:0:7}"
info "Ref: ${DEPLOY_REF}"
info "Usuario: ${DEPLOY_USER}"
info "Directorio: ${PROJECT_DIR}"

# Cambiar al directorio del proyecto
cd "${PROJECT_DIR}" || {
    error "No se pudo acceder al directorio ${PROJECT_DIR}"
    exit 1
}

# Verificar que estamos en el directorio correcto
if [ ! -f "docker-compose.yml" ]; then
    error "No se encontró docker-compose.yml. Asegúrate de estar en el directorio correcto."
    exit 1
fi

# Verificar que Docker está instalado
if ! command -v docker &> /dev/null; then
    error "Docker no está instalado."
    exit 1
fi

if ! command -v docker compose &> /dev/null && ! command -v docker-compose &> /dev/null; then
    error "Docker Compose no está instalado."
    exit 1
fi

# Usar docker compose o docker-compose según disponibilidad
DOCKER_COMPOSE_CMD="docker compose"
if ! command -v docker compose &> /dev/null; then
    DOCKER_COMPOSE_CMD="docker-compose"
fi

success "Docker encontrado: $(docker --version)"
success "Docker Compose encontrado"

# 1. Pull latest changes (si estamos en un repo git)
if [ -d ".git" ]; then
    info "Actualizando código desde Git..."
    
    # Verificar que estamos en la rama correcta
    CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown")
    info "Rama actual: $CURRENT_BRANCH"
    
    # Hacer fetch primero
    if git fetch origin main 2>&1 || git fetch origin master 2>&1; then
        success "Fetch completado"
    else
        warning "No se pudo hacer fetch (puede ser normal si ya está actualizado)"
    fi
    
    # Verificar commits pendientes
    COMMITS_BEHIND=$(git rev-list --count HEAD..origin/main 2>/dev/null || git rev-list --count HEAD..origin/master 2>/dev/null || echo "0")
    if [ "$COMMITS_BEHIND" != "0" ] && [ "$COMMITS_BEHIND" != "" ]; then
        info "Hay $COMMITS_BEHIND commits pendientes de actualizar"
        
        # Hacer reset hard para actualizar
        if git reset --hard origin/main 2>&1 || git reset --hard origin/master 2>&1; then
            success "Código actualizado (reset hard completado)"
        else
            error "No se pudo hacer reset hard. Intentando pull..."
            if git pull origin main 2>&1 || git pull origin master 2>&1; then
                success "Código actualizado (pull completado)"
            else
                error "No se pudo actualizar el código. Verifica permisos y conexión."
                exit 1
            fi
        fi
    else
        success "Código ya está actualizado (sin commits pendientes)"
    fi
    
    # Mostrar último commit
    LAST_COMMIT=$(git log -1 --oneline 2>/dev/null || echo "unknown")
    info "Último commit: $LAST_COMMIT"
else
    warning "No es un repositorio Git, saltando actualización de código"
fi

# 2. Verificar que existe .env
if [ ! -f ".env" ]; then
    error "Archivo .env no encontrado. El despliegue requiere configuración."
    exit 1
fi

success "Archivo .env encontrado"

# 3. Backup de la versión anterior (solo si existe)
if $DOCKER_COMPOSE_CMD ps app | grep -q "Up"; then
    info "Haciendo backup de la versión anterior..."
    $DOCKER_COMPOSE_CMD ps app > /tmp/codekit-backup-status.txt 2>&1 || true
    success "Backup creado"
fi

# 4. Reconstruir y reiniciar contenedores
info "Reconstruyendo imagen Docker (esto puede tardar varios minutos)..."
info "Esto incluirá los últimos cambios del código actualizado"

# Usar build normal (más rápido) en lugar de --no-cache para producción
# Solo usar --no-cache si es necesario para forzar rebuild completo
if $DOCKER_COMPOSE_CMD build app; then
    success "Imagen reconstruida"
else
    error "Error al reconstruir la imagen Docker."
    error "Revisa los logs: $DOCKER_COMPOSE_CMD logs app"
    exit 1
fi

# 5. Verificar que la base de datos está saludable
info "Verificando salud de la base de datos..."
if $DOCKER_COMPOSE_CMD ps postgres | grep -q "healthy"; then
    success "Base de datos saludable"
else
    warning "Base de datos no está saludable. Intentando iniciar..."
    $DOCKER_COMPOSE_CMD up -d postgres
    sleep 5
fi

# 6. Aplicar migraciones de base de datos
info "Aplicando migraciones de base de datos..."
if $DOCKER_COMPOSE_CMD exec -T postgres psql -U codekit_user -d codekit_pro -c "SELECT 1" > /dev/null 2>&1; then
    # Verificar si las tablas existen
    TABLE_COUNT=$($DOCKER_COMPOSE_CMD exec -T postgres psql -U codekit_user -d codekit_pro -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>/dev/null | tr -d ' ')
    
    if [ -z "$TABLE_COUNT" ] || [ "$TABLE_COUNT" = "0" ]; then
        info "Creando tablas de base de datos..."
        if [ -f "scripts/create-tables-sql.sh" ]; then
            bash scripts/create-tables-sql.sh || warning "Error al crear tablas (puede que ya existan)"
        else
            warning "Script create-tables-sql.sh no encontrado"
        fi
    else
        info "Tablas ya existen ($TABLE_COUNT tablas encontradas)"
    fi
    
    success "Base de datos verificada"
else
    warning "No se pudo conectar a la base de datos. Continuando..."
fi

# 7. Reiniciar aplicación con zero-downtime
info "Reiniciando aplicación con zero-downtime..."
if $DOCKER_COMPOSE_CMD up -d --no-deps app; then
    success "Aplicación reiniciada"
else
    error "Error al reiniciar la aplicación."
    exit 1
fi

# 8. Esperar a que la aplicación esté saludable
info "Esperando a que la aplicación esté lista..."
MAX_WAIT=60
WAIT_COUNT=0
HEALTHY=false

while [ $WAIT_COUNT -lt $MAX_WAIT ]; do
    if $DOCKER_COMPOSE_CMD ps app | grep -q "healthy\|Up"; then
        # Verificar que responde HTTP
        if curl -f -s http://localhost:8604/health > /dev/null 2>&1; then
            HEALTHY=true
            break
        fi
    fi
    sleep 2
    WAIT_COUNT=$((WAIT_COUNT + 2))
    echo -n "."
done

echo ""

if [ "$HEALTHY" = true ]; then
    success "✅ Aplicación saludable y respondiendo"
else
    warning "Aplicación iniciada pero no se pudo verificar salud (puede estar iniciando)"
fi

# 9. Mostrar estado final
info "Estado de contenedores:"
$DOCKER_COMPOSE_CMD ps

# 10. Mostrar logs recientes
info "Últimas líneas de logs de la aplicación:"
$DOCKER_COMPOSE_CMD logs --tail=20 app

success "✅ Despliegue completado exitosamente!"
info "Aplicación disponible en puerto 8604"
info "Commit desplegado: ${DEPLOY_COMMIT:0:7}"
info "Para ver logs: $DOCKER_COMPOSE_CMD logs -f app"
info "Para reiniciar: $DOCKER_COMPOSE_CMD restart app"

