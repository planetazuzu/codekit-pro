#!/bin/bash

# ============================================
# Script de Despliegue - CodeKit Pro
# Puerto: 8604
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
APP_NAME="codekit-pro"
PM2_NAME="codekit-pro-8604"
DOMAIN="codekitpro.app"

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

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    error "No se encontró package.json. Asegúrate de estar en el directorio raíz del proyecto."
    exit 1
fi

info "Iniciando despliegue de CodeKit Pro en puerto $PORT..."

# 1. Verificar Node.js
info "Verificando Node.js..."
if ! command -v node &> /dev/null; then
    error "Node.js no está instalado. Por favor instálalo primero."
    exit 1
fi
NODE_VERSION=$(node -v)
success "Node.js encontrado: $NODE_VERSION"

# 2. Verificar npm
info "Verificando npm..."
if ! command -v npm &> /dev/null; then
    error "npm no está instalado. Por favor instálalo primero."
    exit 1
fi
success "npm encontrado: $(npm -v)"

# 3. Verificar archivo .env
info "Verificando variables de entorno..."
if [ ! -f ".env" ]; then
    warning "Archivo .env no encontrado."
    if [ -f ".env.example" ]; then
        info "Copiando .env.example a .env..."
        cp .env.example .env
        warning "Por favor edita el archivo .env con tus configuraciones antes de continuar."
        exit 1
    else
        error "No se encontró .env ni .env.example. Crea un archivo .env con las variables necesarias."
        exit 1
    fi
fi

# Verificar variables críticas en .env
if ! grep -q "PORT=" .env 2>/dev/null; then
    info "Agregando PORT=$PORT al archivo .env..."
    echo "" >> .env
    echo "# Puerto de la aplicación" >> .env
    echo "PORT=$PORT" >> .env
else
    # Actualizar PORT en .env
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s/^PORT=.*/PORT=$PORT/" .env
    else
        # Linux
        sed -i "s/^PORT=.*/PORT=$PORT/" .env
    fi
fi

# Verificar NODE_ENV
if ! grep -q "NODE_ENV=" .env 2>/dev/null; then
    echo "NODE_ENV=production" >> .env
fi

success "Variables de entorno verificadas"

# 4. Instalar dependencias
info "Instalando dependencias..."
npm ci --production=false
success "Dependencias instaladas"

# 5. Verificar TypeScript
info "Verificando tipos TypeScript..."
if npm run check 2>&1 | grep -q "error"; then
    warning "Hay errores de TypeScript. Revisa los errores arriba."
    read -p "¿Continuar de todos modos? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        error "Despliegue cancelado."
        exit 1
    fi
else
    success "TypeScript verificado"
fi

# 6. Build de la aplicación
info "Construyendo aplicación..."
if npm run build; then
    success "Build completado"
else
    error "Error en el build. Revisa los errores arriba."
    exit 1
fi

# 7. Verificar que el build se completó
if [ ! -f "dist/index.cjs" ]; then
    error "dist/index.cjs no encontrado. El build falló."
    exit 1
fi

if [ ! -d "dist/public" ]; then
    error "dist/public no encontrado. El build del frontend falló."
    exit 1
fi

success "Archivos de build verificados"

# 8. Verificar base de datos (opcional)
info "Verificando conexión a base de datos..."
if grep -q "DATABASE_URL=" .env; then
    if npm run db:check 2>&1 | grep -q "Error\|error\|failed"; then
        warning "No se pudo conectar a la base de datos. Verifica DATABASE_URL en .env"
        read -p "¿Continuar de todos modos? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            error "Despliegue cancelado."
            exit 1
        fi
    else
        success "Conexión a base de datos verificada"
        
        # Aplicar índices de BD automáticamente (requerido para las mejoras incrementales)
        info "Aplicando índices de base de datos (db:push)..."
        if npm run db:push; then
            success "Índices de BD aplicados correctamente"
        else
            warning "Error al aplicar índices. Continuando de todas formas..."
            warning "Puedes ejecutar 'npm run db:push' manualmente después si es necesario"
        fi
    fi
else
    warning "DATABASE_URL no configurado. La aplicación usará MemStorage (no recomendado para producción)."
fi

# 9. Verificar PM2
info "Verificando PM2..."
if ! command -v pm2 &> /dev/null; then
    warning "PM2 no está instalado."
    read -p "¿Instalar PM2 globalmente? (Y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Nn]$ ]]; then
        info "Instalando PM2..."
        npm install -g pm2
        success "PM2 instalado"
    else
        warning "Sin PM2, la aplicación se ejecutará directamente. No se reiniciará automáticamente."
        USE_PM2=false
    fi
else
    success "PM2 encontrado: $(pm2 -v)"
    USE_PM2=true
fi

# 10. Detener aplicación existente si está corriendo
if [ "$USE_PM2" = true ]; then
    if pm2 list | grep -q "$PM2_NAME"; then
        info "Deteniendo aplicación existente..."
        pm2 stop "$PM2_NAME" || true
        pm2 delete "$PM2_NAME" || true
        success "Aplicación anterior detenida"
    fi
else
    # Verificar si el puerto está en uso
    if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1 ; then
        warning "Puerto $PORT está en uso."
        PID=$(lsof -Pi :$PORT -sTCP:LISTEN -t)
        info "Proceso usando el puerto: PID $PID"
        read -p "¿Detener el proceso? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            kill $PID
            sleep 2
            success "Proceso detenido"
        else
            error "No se puede continuar con el puerto en uso."
            exit 1
        fi
    fi
fi

# 11. Iniciar aplicación
info "Iniciando aplicación en puerto $PORT..."

if [ "$USE_PM2" = true ]; then
    # Crear archivo de configuración PM2
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
    
    # Iniciar con PM2
    pm2 start ecosystem.config.js
    pm2 save
    
    success "Aplicación iniciada con PM2"
    info "Para ver logs: pm2 logs $PM2_NAME"
    info "Para detener: pm2 stop $PM2_NAME"
    info "Para reiniciar: pm2 restart $PM2_NAME"
else
    # Iniciar directamente
    info "Iniciando aplicación directamente..."
    info "Presiona Ctrl+C para detener"
    NODE_ENV=production PORT=$PORT node dist/index.cjs
fi

success "¡Despliegue completado!"
info "Aplicación disponible en:"
info "  - Local: http://localhost:$PORT"
info "  - Dominio: https://$DOMAIN"
info "Health check: http://localhost:$PORT/health"
info "Ver logs: pm2 logs $PM2_NAME"

