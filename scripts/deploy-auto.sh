#!/bin/bash

# ============================================
# Script de Despliegue Automático - CodeKit Pro
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
PORT=${PORT:-8604}
PM2_NAME="codekit-pro-8604"
DEPLOY_COMMIT=${DEPLOY_COMMIT:-"unknown"}
DEPLOY_REF=${DEPLOY_REF:-"unknown"}
DEPLOY_USER=${DEPLOY_USER:-"system"}

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

info "🚀 Iniciando despliegue automático..."
info "Commit: ${DEPLOY_COMMIT:0:7}"
info "Ref: ${DEPLOY_REF}"
info "Usuario: ${DEPLOY_USER}"

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    error "No se encontró package.json. Asegúrate de estar en el directorio raíz del proyecto."
    exit 1
fi

# 1. Pull latest changes (si estamos en un repo git)
if [ -d ".git" ]; then
    info "Actualizando código desde Git..."
    git fetch origin || warning "No se pudo hacer fetch (puede ser normal si ya está actualizado)"
    git reset --hard origin/main 2>/dev/null || git reset --hard origin/master 2>/dev/null || warning "No se pudo hacer reset (continuando...)"
    success "Código actualizado"
fi

# 2. Instalar dependencias
info "Instalando dependencias..."
npm ci --production=false
success "Dependencias instaladas"

# 3. Verificar TypeScript (no bloquear si falla)
info "Verificando tipos TypeScript..."
if npm run check 2>&1 | grep -q "error"; then
    warning "Hay errores de TypeScript, pero continuando con el despliegue..."
else
    success "TypeScript verificado"
fi

# 4. Build de la aplicación
info "Construyendo aplicación..."
if npm run build; then
    success "Build completado"
else
    error "Error en el build. Abortando despliegue."
    exit 1
fi

# 5. Verificar que el build se completó
if [ ! -f "dist/index.cjs" ]; then
    error "dist/index.cjs no encontrado. El build falló."
    exit 1
fi

if [ ! -d "dist/public" ]; then
    error "dist/public no encontrado. El build del frontend falló."
    exit 1
fi

success "Archivos de build verificados"

# 6. Aplicar migraciones de base de datos (si está configurada)
if grep -q "DATABASE_URL=" .env 2>/dev/null; then
    info "Aplicando migraciones de base de datos..."
    if npm run db:push 2>&1; then
        success "Migraciones aplicadas"
    else
        warning "Error al aplicar migraciones. Continuando de todas formas..."
    fi
else
    warning "DATABASE_URL no configurado. Saltando migraciones."
fi

# 7. Verificar PM2
if ! command -v pm2 &> /dev/null; then
    error "PM2 no está instalado. No se puede reiniciar la aplicación automáticamente."
    exit 1
fi

success "PM2 encontrado: $(pm2 -v)"

# 8. Detener aplicación existente si está corriendo
if pm2 list | grep -q "$PM2_NAME"; then
    info "Deteniendo aplicación existente..."
    pm2 stop "$PM2_NAME" || true
    success "Aplicación detenida"
fi

# 9. Crear archivo de configuración PM2
info "Configurando PM2..."
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: '$PM2_NAME',
    script: './dist/index.cjs',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: $PORT
    },
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    max_memory_restart: '1G',
    watch: false
  }]
};
EOF

# Crear directorio de logs si no existe
mkdir -p logs

# 10. Iniciar aplicación con PM2
info "Iniciando aplicación..."
pm2 start ecosystem.config.js
pm2 save

success "✅ Despliegue completado exitosamente!"
info "Aplicación disponible en puerto $PORT"
info "Commit desplegado: ${DEPLOY_COMMIT:0:7}"
info "Para ver logs: pm2 logs $PM2_NAME"
info "Para reiniciar: pm2 restart $PM2_NAME"

