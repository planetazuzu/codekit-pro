#!/bin/bash

# ============================================
# Script de Despliegue Completo en Servidor
# Ejecutar ESTE script en el servidor después de conectarse por SSH
# ============================================

set -e  # Salir si hay algún error

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuración
PORT=8604
PM2_NAME="codekit-pro-8604"
PROJECT_DIR="/var/www/codekit-pro"
REPO_URL="https://github.com/planetazuzu/codekit-pro.git"

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

info "🚀 Iniciando despliegue completo de CodeKit Pro..."

# 1. Verificar/Instalar Node.js
info "Verificando Node.js..."
if ! command -v node &> /dev/null; then
    warning "Node.js no encontrado. Instalando..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
    success "Node.js instalado: $(node -v)"
else
    NODE_VERSION=$(node -v)
    success "Node.js encontrado: $NODE_VERSION"
fi

# 2. Verificar/Instalar PM2
info "Verificando PM2..."
if ! command -v pm2 &> /dev/null; then
    warning "PM2 no encontrado. Instalando..."
    sudo npm install -g pm2
    success "PM2 instalado: $(pm2 -v)"
else
    success "PM2 encontrado: $(pm2 -v)"
fi

# 3. Verificar/Instalar Git
info "Verificando Git..."
if ! command -v git &> /dev/null; then
    warning "Git no encontrado. Instalando..."
    sudo apt-get update
    sudo apt-get install -y git
    success "Git instalado: $(git --version)"
else
    success "Git encontrado: $(git --version)"
fi

# 4. Crear directorio del proyecto
info "Preparando directorio del proyecto..."
if [ ! -d "$PROJECT_DIR" ]; then
    sudo mkdir -p "$PROJECT_DIR"
    sudo chown $USER:$USER "$PROJECT_DIR"
    success "Directorio creado: $PROJECT_DIR"
else
    success "Directorio existe: $PROJECT_DIR"
fi

cd "$PROJECT_DIR"

# 5. Clonar o actualizar repositorio
info "Configurando repositorio..."
if [ ! -d ".git" ]; then
    info "Clonando repositorio..."
    git clone "$REPO_URL" .
    success "Repositorio clonado"
else
    info "Actualizando código desde GitHub..."
    git fetch origin
    git reset --hard origin/main
    success "Código actualizado"
fi

# 6. Verificar archivo .env
info "Verificando archivo .env..."
if [ ! -f ".env" ]; then
    warning "Archivo .env no encontrado. Creando desde ejemplo..."
    if [ -f ".env.example" ]; then
        cp .env.example .env
        warning "Por favor edita .env con tus configuraciones antes de continuar"
        info "Presiona Enter cuando hayas editado .env, o Ctrl+C para cancelar..."
        read
    else
        error "No se encontró .env ni .env.example"
        info "Creando .env básico..."
        cat > .env << EOF
NODE_ENV=production
PORT=$PORT
JWT_SECRET=$(openssl rand -base64 32)
ADMIN_PASSWORD=941259018a
WEBHOOK_SECRET=Oe6OTVBc4Nh2UZ0XwdIuRlek10vpJdacKtXN8N6GsI8=
EOF
        warning "Archivo .env creado con valores por defecto. Revísalo y edítalo si es necesario."
    fi
else
    success "Archivo .env encontrado"
fi

# Verificar PORT en .env
if ! grep -q "PORT=" .env 2>/dev/null; then
    echo "PORT=$PORT" >> .env
fi

if ! grep -q "NODE_ENV=" .env 2>/dev/null; then
    echo "NODE_ENV=production" >> .env
fi

# 7. Instalar dependencias
info "Instalando dependencias..."
npm ci
success "Dependencias instaladas"

# 8. Build de la aplicación
info "Construyendo aplicación..."
npm run build
success "Build completado"

# 9. Verificar build
if [ ! -f "dist/index.cjs" ]; then
    error "dist/index.cjs no encontrado. El build falló."
    exit 1
fi

if [ ! -d "dist/public" ]; then
    error "dist/public no encontrado. El build del frontend falló."
    exit 1
fi

success "Archivos de build verificados"

# 10. Aplicar migraciones de BD (si está configurada)
if grep -q "DATABASE_URL=" .env 2>/dev/null; then
    info "Aplicando migraciones de base de datos..."
    if npm run db:push 2>&1; then
        success "Migraciones aplicadas"
    else
        warning "Error al aplicar migraciones. Continuando..."
    fi
else
    warning "DATABASE_URL no configurado. Saltando migraciones."
fi

# 11. Crear archivo de configuración PM2
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

mkdir -p logs
success "Configuración PM2 creada"

# 12. Detener aplicación existente si está corriendo
if pm2 list | grep -q "$PM2_NAME"; then
    info "Deteniendo aplicación existente..."
    pm2 stop "$PM2_NAME" || true
    pm2 delete "$PM2_NAME" || true
    success "Aplicación anterior detenida"
fi

# 13. Iniciar aplicación con PM2
info "Iniciando aplicación con PM2..."
pm2 start ecosystem.config.js
pm2 save

# Configurar PM2 para iniciar al arrancar el servidor
info "Configurando PM2 para iniciar al arrancar..."
pm2 startup | tail -1 | sudo bash || warning "No se pudo configurar startup automático"

success "Aplicación iniciada con PM2"

# 14. Verificar que está corriendo
sleep 3
info "Verificando que la aplicación está corriendo..."
if pm2 list | grep -q "$PM2_NAME.*online"; then
    success "✅ Aplicación corriendo correctamente"
else
    warning "La aplicación puede no estar corriendo. Verifica con: pm2 status"
fi

# 15. Health check
info "Realizando health check..."
sleep 2
if curl -f http://localhost:$PORT/health > /dev/null 2>&1; then
    success "✅ Health check exitoso"
    curl http://localhost:$PORT/health
else
    warning "Health check falló. Verifica los logs: pm2 logs $PM2_NAME"
fi

# Resumen
echo ""
success "🎉 ¡Despliegue completado!"
info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
info "📊 Comandos útiles:"
info "  Ver logs:        pm2 logs $PM2_NAME"
info "  Ver estado:      pm2 status"
info "  Reiniciar:       pm2 restart $PM2_NAME"
info "  Detener:         pm2 stop $PM2_NAME"
info ""
info "🌐 URLs:"
info "  Local:           http://localhost:$PORT"
info "  Health:          http://localhost:$PORT/health"
info "  Dominio:         https://codekitpro.app"
info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

