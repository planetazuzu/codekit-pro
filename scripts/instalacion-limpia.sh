#!/bin/bash

# ============================================
# Script de Instalación Limpia - CodeKit Pro
# Instala la aplicación desde cero como si fuera la primera vez
# ============================================

set -e  # Salir si hay error
set -u  # Error si variable no definida

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuración
PROJECT_DIR="/var/www/codekit-pro"
BACKUP_DIR="/var/www/codekit-pro-backup-$(date +%Y%m%d-%H%M%S)"
PORT=8604
REPO_URL="${REPO_URL:-}"  # Se debe definir antes de ejecutar

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Instalación Limpia - CodeKit Pro${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Función para mostrar mensajes
info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

success() {
    echo -e "${GREEN}✅${NC} $1"
}

warning() {
    echo -e "${YELLOW}⚠️${NC} $1"
}

error() {
    echo -e "${RED}❌${NC} $1"
}

# Función para verificar comando
check_command() {
    if ! command -v "$1" &> /dev/null; then
        error "$1 no está instalado"
        exit 1
    fi
}

# Verificar prerequisitos
info "Verificando prerequisitos..."
check_command "node"
check_command "npm"
check_command "docker"
check_command "git"

NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    error "Node.js debe ser >= 20. Actual: $(node --version)"
    exit 1
fi

success "Prerequisitos OK"
echo ""

# Paso 1: Backup del directorio actual
if [ -d "$PROJECT_DIR" ]; then
    info "Creando backup del directorio actual..."
    cd /var/www
    mv "$PROJECT_DIR" "$BACKUP_DIR"
    success "Backup creado en: $BACKUP_DIR"
else
    info "No hay directorio anterior para backup"
fi
echo ""

# Paso 2: Detener contenedores antiguos
if [ -d "$BACKUP_DIR" ]; then
    info "Deteniendo contenedores antiguos..."
    cd "$BACKUP_DIR"
    docker compose down 2>/dev/null || true
    success "Contenedores detenidos"
    cd /var/www
    echo ""
fi

# Paso 3: Liberar puerto
info "Verificando puerto $PORT..."
if lsof -ti:$PORT > /dev/null 2>&1; then
    warning "Puerto $PORT en uso, intentando liberar..."
    lsof -ti:$PORT | xargs kill -9 2>/dev/null || true
    sleep 2
fi
success "Puerto $PORT libre"
echo ""

# Paso 4: Clonar repositorio
if [ -z "$REPO_URL" ]; then
    error "REPO_URL no definido. Ejecuta: export REPO_URL='https://github.com/usuario/repo.git'"
    exit 1
fi

info "Clonando repositorio..."
cd /var/www
git clone "$REPO_URL" codekit-pro
cd codekit-pro
git checkout main
git pull origin main
success "Repositorio clonado"
echo ""

# Paso 5: Crear .env si no existe
if [ ! -f ".env" ]; then
    info "Creando archivo .env desde plantilla..."
    cat > .env << 'EOF'
NODE_ENV=production
PORT=8604
DATABASE_URL=postgresql://usuario:password@postgres:5432/codekit_pro
ADMIN_PASSWORD=change_me_min_8_chars
JWT_SECRET=change_me_min_32_chars_random_string
ALLOWED_ORIGINS=
API_URL=
VITE_API_URL=
EOF
    warning "Archivo .env creado. IMPORTANTE: Edita .env y configura las variables necesarias"
    warning "Ejecuta: nano .env"
    read -p "Presiona Enter después de configurar .env..."
else
    info "Archivo .env ya existe"
fi
echo ""

# Paso 6: Instalar dependencias
info "Instalando dependencias..."
rm -rf node_modules package-lock.json
npm ci --legacy-peer-deps
success "Dependencias instaladas"
echo ""

# Paso 7: Build
info "Ejecutando build..."
rm -rf dist build
npm run build

if [ ! -d "dist" ]; then
    error "Build falló - directorio dist no existe"
    exit 1
fi
success "Build completado"
echo ""

# Paso 8: Verificar Service Worker
info "Verificando Service Worker..."
if [ -f "dist/public/sw.js" ]; then
    SW_VERSION=$(grep "SW_VERSION" dist/public/sw.js | head -1)
    success "Service Worker encontrado: $SW_VERSION"
else
    warning "Service Worker no encontrado en dist/public/sw.js"
fi
echo ""

# Paso 9: Docker Compose
info "Construyendo imágenes Docker..."
docker compose build --no-cache
success "Imágenes construidas"
echo ""

info "Iniciando servicios..."
docker compose up -d
success "Servicios iniciados"
echo ""

# Paso 10: Esperar a que inicie
info "Esperando a que la aplicación inicie..."
sleep 15

# Paso 11: Verificación
info "Verificando instalación..."

# Health check
if curl -f http://localhost:$PORT/api/health > /dev/null 2>&1; then
    success "Health endpoint responde correctamente"
else
    error "Health endpoint no responde"
    warning "Revisa los logs: docker compose logs app"
fi

# Verificar que la app carga
if curl -I http://localhost:$PORT/ > /dev/null 2>&1; then
    success "Aplicación responde en puerto $PORT"
else
    error "Aplicación no responde"
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✅ Instalación completada${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Próximos pasos:"
echo "1. Verifica logs: docker compose logs -f app"
echo "2. Abre en navegador: http://tu-servidor:$PORT"
echo "3. Verifica Service Worker en DevTools"
echo "4. Revisa que no hay errores en consola"
echo ""
echo "Si hay problemas:"
echo "- Ver logs: docker compose logs app"
echo "- Verificar .env: cat .env"
echo "- Reiniciar: docker compose restart app"
echo ""
