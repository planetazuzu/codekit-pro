#!/bin/bash
# ============================================
# INSTALACIÓN LIMPIA - CodeKit Pro
# Archivo listo para ejecutar en el servidor
# ============================================

set -e

# Configuración
PORT=8604
REPO_URL="https://github.com/planetazuzu/codekit-pro.git"

echo "🚀 Iniciando instalación limpia de CodeKit Pro..."
echo ""

# Paso 1: Backup
cd /var/www
if [ -d "codekit-pro" ]; then
    BACKUP_NAME="codekit-pro-backup-$(date +%Y%m%d-%H%M%S)"
    echo "📦 Creando backup del directorio actual..."
    mv codekit-pro "$BACKUP_NAME"
    if [ -d "$BACKUP_NAME" ]; then
        cd "$BACKUP_NAME"
        echo "🛑 Deteniendo contenedores antiguos..."
        docker compose down 2>/dev/null || true
        cd /var/www
    fi
    echo "✅ Backup creado: $BACKUP_NAME"
else
    echo "ℹ️  No hay directorio anterior para backup"
fi
echo ""

# Paso 2: Liberar puerto
echo "🔓 Liberando puerto $PORT..."
lsof -ti:$PORT | xargs kill -9 2>/dev/null || echo "Puerto ya está libre"
sleep 2
echo "✅ Puerto $PORT libre"
echo ""

# Paso 3: Clonar repositorio
echo "📥 Clonando repositorio desde GitHub..."
cd /var/www
git clone "$REPO_URL" codekit-pro
cd codekit-pro
git checkout main
git pull origin main
echo "✅ Repositorio clonado"
echo ""

# Paso 4: Crear .env con configuración
echo "⚙️  Creando archivo .env con configuración..."
cat > .env << 'EOF'
NODE_ENV=production
PORT=8604
DATABASE_URL=postgresql://codekit_user:codekit_password@postgres:5432/codekit_pro
ADMIN_PASSWORD=change_me_min_8_chars
JWT_SECRET=change_me_min_32_chars_random_string
ALLOWED_ORIGINS=
API_URL=
VITE_API_URL=
EOF

echo "⚠️  IMPORTANTE: Edita .env con tus valores reales"
echo "   - ADMIN_PASSWORD: Cambia por tu contraseña (mínimo 8 caracteres)"
echo "   - JWT_SECRET: Cambia por un string aleatorio (mínimo 32 caracteres)"
echo ""
echo "   Ejecuta: nano .env"
echo ""
read -p "Presiona Enter después de configurar .env..."

# Verificar que .env fue editado
if grep -q "change_me" .env; then
    echo "⚠️  ADVERTENCIA: Parece que no has cambiado los valores por defecto en .env"
    read -p "¿Continuar de todos modos? (s/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Ss]$ ]]; then
        echo "❌ Instalación cancelada. Edita .env y vuelve a ejecutar."
        exit 1
    fi
fi
echo ""

# Paso 5: Instalar dependencias
echo "📦 Instalando dependencias desde cero..."
rm -rf node_modules package-lock.json
npm ci --legacy-peer-deps
echo "✅ Dependencias instaladas"
echo ""

# Paso 6: Build limpio
echo "🔨 Ejecutando build completo..."
rm -rf dist build
npm run build

if [ ! -d "dist" ]; then
    echo "❌ ERROR: Build falló - directorio dist no existe"
    exit 1
fi
echo "✅ Build completado exitosamente"
echo ""

# Paso 7: Verificar Service Worker
echo "🔍 Verificando Service Worker..."
if [ -f "dist/public/sw.js" ]; then
    SW_VERSION=$(grep "SW_VERSION" dist/public/sw.js | head -1 | grep -o "v[0-9]*" || echo "no encontrado")
    echo "✅ Service Worker compilado: $SW_VERSION"
else
    echo "⚠️  Service Worker no encontrado en dist/public/sw.js"
fi
echo ""

# Paso 8: Docker Compose
echo "🐳 Construyendo imágenes Docker (sin caché)..."
docker compose build --no-cache
echo "✅ Imágenes construidas"
echo ""

echo "🚀 Iniciando servicios..."
docker compose up -d
echo "✅ Servicios iniciados"
echo ""

# Paso 9: Esperar inicio
echo "⏳ Esperando a que la aplicación inicie (15 segundos)..."
sleep 15
echo ""

# Paso 10: Verificación
echo "✅ Verificando instalación..."
echo ""

# Health check
if curl -f http://localhost:$PORT/api/health > /dev/null 2>&1; then
    echo "✅ Health endpoint responde correctamente"
    curl -s http://localhost:$PORT/api/health | head -3
else
    echo "❌ Health endpoint no responde"
    echo "   Revisa los logs: docker compose logs app"
fi
echo ""

# Verificar que la app carga
if curl -I http://localhost:$PORT/ > /dev/null 2>&1; then
    echo "✅ Aplicación responde en http://localhost:$PORT"
else
    echo "⚠️  La aplicación podría no estar lista aún"
fi
echo ""

# Mostrar estado de contenedores
echo "📊 Estado de contenedores:"
docker compose ps
echo ""

echo "=========================================="
echo "✅ INSTALACIÓN COMPLETADA"
echo "=========================================="
echo ""
echo "📋 Próximos pasos:"
echo "   1. Ver logs: docker compose logs -f app"
echo "   2. Abre en navegador: http://tu-servidor:$PORT"
echo "   3. Verifica Service Worker en DevTools > Application > Service Workers"
echo "   4. Verifica que no hay errores en consola"
echo ""
echo "🔧 Comandos útiles:"
echo "   - Ver logs: docker compose logs -f app"
echo "   - Ver estado: docker compose ps"
echo "   - Reiniciar: docker compose restart app"
echo "   - Detener: docker compose down"
echo ""
echo "⚠️  Si ves 'Actualización disponible' en bucle:"
echo "   1. Abre DevTools > Application > Clear storage"
echo "   2. Limpia Cache Storage y Service Workers"
echo "   3. Recarga la página"
echo ""
