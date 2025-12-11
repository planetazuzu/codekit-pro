#!/bin/bash
# Script para configurar PostgreSQL con usuario planetazuzu
# Ejecutar con: bash server/scripts/setup-postgres-user.sh

set -e

USERNAME="planetazuzu"
PASSWORD="941259018a"
DATABASE="codekit_pro"

echo "🚀 Configurando PostgreSQL para CodeKit Pro..."
echo "=============================================="
echo ""
echo "Usuario: $USERNAME"
echo "Base de datos: $DATABASE"
echo ""

# Verificar si PostgreSQL está instalado
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL no está instalado."
    echo "📦 Instalando PostgreSQL..."
    sudo apt update
    sudo apt install -y postgresql postgresql-contrib
    echo "✅ PostgreSQL instalado"
fi

# Iniciar PostgreSQL si no está ejecutándose
if ! sudo systemctl is-active --quiet postgresql; then
    echo "🔄 Iniciando PostgreSQL..."
    sudo systemctl start postgresql
    sudo systemctl enable postgresql
    echo "✅ PostgreSQL iniciado"
fi

# Crear usuario y base de datos
echo "📝 Creando usuario y base de datos..."
sudo -u postgres psql <<EOF
-- Crear usuario si no existe
DO \$\$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_user WHERE usename = '$USERNAME') THEN
        CREATE USER $USERNAME WITH PASSWORD '$PASSWORD';
        RAISE NOTICE 'Usuario $USERNAME creado';
    ELSE
        RAISE NOTICE 'Usuario $USERNAME ya existe';
    END IF;
END
\$\$;

-- Crear base de datos si no existe
SELECT 'CREATE DATABASE $DATABASE OWNER $USERNAME'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '$DATABASE')\gexec

-- Dar permisos
GRANT ALL PRIVILEGES ON DATABASE $DATABASE TO $USERNAME;

-- Conectar a la base de datos y dar permisos en el esquema public
\c $DATABASE
GRANT ALL ON SCHEMA public TO $USERNAME;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO $USERNAME;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO $USERNAME;

\q
EOF

echo "✅ Usuario y base de datos configurados"
echo ""

# Verificar conexión
echo "🔍 Verificando conexión..."
if PGPASSWORD="$PASSWORD" psql -U "$USERNAME" -d "$DATABASE" -h localhost -c "SELECT 1;" &> /dev/null; then
    echo "✅ Conexión exitosa!"
else
    echo "⚠️  No se pudo verificar la conexión automáticamente"
    echo "   Esto puede ser normal si pg_hba.conf requiere configuración"
fi

echo ""
echo "📋 DATABASE_URL para tu archivo .env:"
echo "======================================"
echo "postgresql://$USERNAME:$PASSWORD@localhost:5432/$DATABASE"
echo ""
echo "✅ Configuración completada!"
echo ""
echo "💡 Próximos pasos:"
echo "   1. Crear archivo .env con DATABASE_URL"
echo "   2. Ejecutar: npm run db:setup"
echo "   3. Ejecutar: npm run db:push"

