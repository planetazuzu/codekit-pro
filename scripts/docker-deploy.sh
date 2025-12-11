#!/bin/bash

# ============================================
# Script de Despliegue con Docker - CodeKit Pro
# ============================================

set -e

# Colores
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

info "🐳 Iniciando despliegue con Docker..."

# Verificar Docker
if ! command -v docker &> /dev/null; then
    error "Docker no está instalado"
    info "Instalando Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    success "Docker instalado"
fi

# Verificar Docker Compose
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    warning "Docker Compose no encontrado. Instalando..."
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    success "Docker Compose instalado"
fi

# Verificar .env
if [ ! -f ".env" ]; then
    warning "Archivo .env no encontrado. Creando..."
    JWT_SECRET=$(openssl rand -base64 32)
    cat > .env << EOF
NODE_ENV=production
PORT=8604
JWT_SECRET=$JWT_SECRET
ADMIN_PASSWORD=941259018a
WEBHOOK_SECRET=Oe6OTVBc4Nh2UZ0XwdIuRlek10vpJdacKtXN8N6GsI8=
DATABASE_URL=postgresql://codekit_user:codekit_password@postgres:5432/codekit_pro
EOF
    success "Archivo .env creado"
fi

# Detener contenedores existentes
info "Deteniendo contenedores existentes..."
docker-compose down 2>/dev/null || true

# Construir imágenes
info "Construyendo imágenes Docker..."
docker-compose build

# Iniciar servicios
info "Iniciando servicios..."
docker-compose up -d

# Esperar a que PostgreSQL esté listo
info "Esperando a que PostgreSQL esté listo..."
sleep 10

# Aplicar migraciones
info "Aplicando migraciones de base de datos..."
docker-compose exec -T app npm run db:push || warning "Error al aplicar migraciones"

# Verificar estado
info "Verificando estado..."
sleep 5
docker-compose ps

# Health check
info "Realizando health check..."
if curl -f http://localhost:8604/health > /dev/null 2>&1; then
    success "✅ Health check exitoso"
    curl http://localhost:8604/health
else
    warning "Health check falló. Verifica los logs: docker-compose logs app"
fi

success "🎉 Despliegue completado!"
info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
info "📊 Comandos útiles:"
info "  Ver logs:        docker-compose logs -f app"
info "  Reiniciar:       docker-compose restart app"
info "  Detener:         docker-compose stop"
info "  Estado:          docker-compose ps"
info ""
info "🌐 URLs:"
info "  Local:           http://localhost:8604"
info "  Health:          http://localhost:8604/health"
info "  Dominio:         https://codekitpro.app"
info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

