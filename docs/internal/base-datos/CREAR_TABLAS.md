# 🗄️ Crear Tablas de Base de Datos

## Problema

`drizzle-kit` necesita acceso a `drizzle.config.ts` y el schema, pero en producción puede no estar disponible.

## Solución: Usar Script SQL Directo

El script `create-tables.ts` crea las tablas usando SQL directo, sin necesidad de `drizzle-kit`.

### Opción 1: Usar el Script SQL Directo (Recomendado)

```bash
cd /var/www/codekit-pro

# Ejecutar el script compilado
docker compose exec app node -e "
require('dotenv').config();
const { getDatabase } = require('./dist/config/database');
const db = getDatabase();

async function createTables() {
  try {
    console.log('Creating tables...');
    
    await db.execute(\`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        plan VARCHAR(20) DEFAULT 'free' NOT NULL,
        stripe_customer_id TEXT,
        stripe_subscription_id TEXT,
        subscription_status VARCHAR(20),
        subscription_ends_at TIMESTAMP,
        email_verified TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
    \`);

    await db.execute(\`
      CREATE TABLE IF NOT EXISTS prompts (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        category VARCHAR(50) NOT NULL,
        content TEXT NOT NULL,
        tags TEXT[] DEFAULT '{}',
        status VARCHAR(20) DEFAULT 'approved' NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
    \`);

    await db.execute(\`
      CREATE TABLE IF NOT EXISTS snippets (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        language VARCHAR(50) NOT NULL,
        code TEXT NOT NULL,
        description TEXT NOT NULL,
        tags TEXT[] DEFAULT '{}',
        status VARCHAR(20) DEFAULT 'approved' NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
    \`);

    await db.execute(\`
      CREATE TABLE IF NOT EXISTS links (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        url TEXT NOT NULL,
        icon VARCHAR(100),
        category VARCHAR(50) NOT NULL,
        description TEXT NOT NULL,
        status VARCHAR(20) DEFAULT 'approved' NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
    \`);

    await db.execute(\`
      CREATE TABLE IF NOT EXISTS guides (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        content TEXT,
        type VARCHAR(50) NOT NULL,
        tags TEXT[] DEFAULT '{}',
        image_url TEXT,
        status VARCHAR(20) DEFAULT 'approved' NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
    \`);

    await db.execute(\`
      CREATE TABLE IF NOT EXISTS views (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        page VARCHAR(100) NOT NULL,
        entity_type VARCHAR(50),
        entity_id VARCHAR(100),
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        user_agent TEXT,
        referrer TEXT
      );
    \`);

    await db.execute(\`
      CREATE TABLE IF NOT EXISTS affiliates (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        category VARCHAR(50) NOT NULL,
        url TEXT NOT NULL,
        code TEXT,
        commission TEXT,
        icon VARCHAR(100),
        utm TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
    \`);

    await db.execute(\`
      CREATE TABLE IF NOT EXISTS affiliate_clicks (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        affiliate_id VARCHAR NOT NULL REFERENCES affiliates(id) ON DELETE CASCADE,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        user_agent TEXT,
        referrer TEXT
      );
    \`);

    await db.execute(\`
      CREATE TABLE IF NOT EXISTS affiliate_programs (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        category VARCHAR(50) NOT NULL,
        registration_url TEXT,
        dashboard_url TEXT,
        status VARCHAR(50) DEFAULT 'not_requested' NOT NULL,
        request_date TIMESTAMP,
        approval_date TIMESTAMP,
        notes TEXT,
        tags TEXT[] DEFAULT '{}',
        priority VARCHAR(20) DEFAULT 'medium',
        integration_type VARCHAR(50) DEFAULT 'manual',
        integration_config TEXT,
        last_sync_at TIMESTAMP,
        total_clicks INTEGER DEFAULT 0,
        estimated_revenue REAL DEFAULT 0,
        internal_notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
    \`);

    // Crear índices
    await db.execute(\`
      CREATE INDEX IF NOT EXISTS prompts_user_id_idx ON prompts(user_id);
      CREATE INDEX IF NOT EXISTS prompts_status_idx ON prompts(status);
      CREATE INDEX IF NOT EXISTS prompts_created_at_idx ON prompts(created_at);
      CREATE INDEX IF NOT EXISTS prompts_user_id_status_idx ON prompts(user_id, status);
      
      CREATE INDEX IF NOT EXISTS snippets_user_id_idx ON snippets(user_id);
      CREATE INDEX IF NOT EXISTS snippets_status_idx ON snippets(status);
      CREATE INDEX IF NOT EXISTS snippets_created_at_idx ON snippets(created_at);
      CREATE INDEX IF NOT EXISTS snippets_user_id_status_idx ON snippets(user_id, status);
      
      CREATE INDEX IF NOT EXISTS links_user_id_idx ON links(user_id);
      CREATE INDEX IF NOT EXISTS links_status_idx ON links(status);
      CREATE INDEX IF NOT EXISTS links_created_at_idx ON links(created_at);
      CREATE INDEX IF NOT EXISTS links_user_id_status_idx ON links(user_id, status);
      
      CREATE INDEX IF NOT EXISTS guides_user_id_idx ON guides(user_id);
      CREATE INDEX IF NOT EXISTS guides_status_idx ON guides(status);
      CREATE INDEX IF NOT EXISTS guides_created_at_idx ON guides(created_at);
      CREATE INDEX IF NOT EXISTS guides_user_id_status_idx ON guides(user_id, status);
    \`);

    console.log('✅ Tables created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createTables();
"
```

### Opción 2: Usar drizzle-kit (si está disponible)

Si `drizzle.config.ts` está disponible en el contenedor:

```bash
cd /var/www/codekit-pro

# Verificar que drizzle.config.ts exista
docker compose exec app ls -la /app/drizzle.config.ts

# Si existe, ejecutar:
docker compose exec app drizzle-kit push
```

### Opción 3: Conectar directamente a PostgreSQL

```bash
cd /var/www/codekit-pro

# Conectar a PostgreSQL
docker compose exec postgres psql -U codekit_user -d codekit_pro

# Luego ejecutar el SQL del script create-tables.ts manualmente
```

## Verificar que funcionó

```bash
# Ver todas las tablas
docker compose exec postgres psql -U codekit_user -d codekit_pro -c "\dt"

# Deberías ver:
# - users
# - prompts
# - snippets
# - links
# - guides
# - views
# - affiliates
# - affiliate_clicks
# - affiliate_programs
```

## Después de crear las tablas

Reinicia el contenedor de la aplicación:

```bash
docker compose restart app
```

Los errores 500 deberían desaparecer una vez que las tablas estén creadas.

