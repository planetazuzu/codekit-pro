#!/usr/bin/env tsx
/**
 * PostgreSQL Requirements Checker
 * Verifica qué datos necesitas para configurar PostgreSQL
 */

import { logger } from "../utils/logger";
import { execSync } from "child_process";

interface PostgresInfo {
  installed: boolean;
  running: boolean;
  version?: string;
  databases?: string[];
  users?: string[];
}

function checkPostgresInstalled(): boolean {
  try {
    const version = execSync("psql --version", { encoding: "utf-8" }).trim();
    logger.info(`✅ PostgreSQL encontrado: ${version}`);
    return true;
  } catch {
    logger.warn("❌ PostgreSQL no encontrado en PATH");
    return false;
  }
}

function checkPostgresRunning(): boolean {
  try {
    execSync("pg_isready -h localhost", { stdio: "ignore" });
    logger.info("✅ PostgreSQL está ejecutándose");
    return true;
  } catch {
    logger.warn("❌ PostgreSQL no está ejecutándose o no es accesible");
    return false;
  }
}

function getPostgresVersion(): string | undefined {
  try {
    return execSync("psql --version", { encoding: "utf-8" }).trim();
  } catch {
    return undefined;
  }
}

function listDatabases(): string[] {
  try {
    const output = execSync(
      'sudo -u postgres psql -t -c "SELECT datname FROM pg_database WHERE datistemplate = false;"',
      { encoding: "utf-8" }
    );
    return output
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
  } catch {
    return [];
  }
}

function listUsers(): string[] {
  try {
    const output = execSync(
      'sudo -u postgres psql -t -c "SELECT usename FROM pg_user;"',
      { encoding: "utf-8" }
    );
    return output
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
  } catch {
    return [];
  }
}

async function main() {
  logger.info("🔍 Verificando requisitos para PostgreSQL...\n");

  const info: PostgresInfo = {
    installed: checkPostgresInstalled(),
    running: false,
  };

  if (info.installed) {
    info.version = getPostgresVersion();
    info.running = checkPostgresRunning();

    if (info.running) {
      logger.info("\n📊 Información de PostgreSQL:");
      logger.info("─────────────────────────────");

      try {
        info.databases = listDatabases();
        if (info.databases.length > 0) {
          logger.info(`\n📁 Bases de datos existentes:`);
          info.databases.forEach((db) => {
            logger.info(`   - ${db}`);
          });
        } else {
          logger.info("\n📁 No se encontraron bases de datos personalizadas");
        }
      } catch (error: any) {
        logger.warn(`\n⚠️  No se pudieron listar bases de datos: ${error.message}`);
      }

      try {
        info.users = listUsers();
        if (info.users && info.users.length > 0) {
          logger.info(`\n👤 Usuarios existentes:`);
          info.users.forEach((user) => {
            logger.info(`   - ${user}`);
          });
        }
      } catch (error: any) {
        logger.warn(`\n⚠️  No se pudieron listar usuarios: ${error.message}`);
      }
    }
  }

  logger.info("\n📋 DATOS NECESARIOS PARA CONFIGURAR POSTGRESQL:");
  logger.info("═══════════════════════════════════════════════\n");

  logger.info("1️⃣  USUARIO DE POSTGRESQL");
  logger.info("   └─ Nombre del usuario que accederá a la base de datos");
  logger.info("   └─ Ejemplo: 'codekit_user' o 'tu_usuario'");
  if (info.users && info.users.length > 0) {
    logger.info(`   └─ Usuarios disponibles: ${info.users.join(", ")}`);
  } else {
    logger.info("   └─ ⚠️  Necesitas crear un usuario");
  }

  logger.info("\n2️⃣  CONTRASEÑA DEL USUARIO");
  logger.info("   └─ Contraseña segura para el usuario de PostgreSQL");
  logger.info("   └─ Ejemplo: 'MiPasswordSeguro123!'");
  logger.info("   └─ ⚠️  Debe ser segura (mínimo 8 caracteres)");

  logger.info("\n3️⃣  NOMBRE DE LA BASE DE DATOS");
  logger.info("   └─ Nombre de la base de datos para CodeKit Pro");
  logger.info("   └─ Ejemplo: 'codekit_pro'");
  if (info.databases && info.databases.length > 0) {
    logger.info(`   └─ Bases de datos disponibles: ${info.databases.join(", ")}`);
  } else {
    logger.info("   └─ ⚠️  Necesitas crear la base de datos 'codekit_pro'");
  }

  logger.info("\n4️⃣  PUERTO");
  logger.info("   └─ Puerto donde escucha PostgreSQL (generalmente 5432)");
  logger.info("   └─ Valor por defecto: 5432");

  logger.info("\n5️⃣  HOST");
  logger.info("   └─ Dirección del servidor PostgreSQL");
  logger.info("   └─ Para local: 'localhost' o '127.0.0.1'");

  logger.info("\n📝 FORMATO DE DATABASE_URL:");
  logger.info("═══════════════════════════════════════════════");
  logger.info("postgresql://USUARIO:CONTRASEÑA@HOST:PUERTO/NOMBRE_BASE_DATOS");
  logger.info("\nEjemplo:");
  logger.info("postgresql://codekit_user:MiPassword123@localhost:5432/codekit_pro");

  logger.info("\n🔧 PRÓXIMOS PASOS:");
  logger.info("═══════════════════════════════════════════════");

  if (!info.installed) {
    logger.info("1. Instalar PostgreSQL:");
    logger.info("   sudo apt update");
    logger.info("   sudo apt install postgresql postgresql-contrib");
  } else if (!info.running) {
    logger.info("1. Iniciar PostgreSQL:");
    logger.info("   sudo systemctl start postgresql");
    logger.info("   sudo systemctl enable postgresql");
  } else {
    logger.info("1. ✅ PostgreSQL está instalado y ejecutándose");
  }

  logger.info("\n2. Crear usuario y base de datos:");
  logger.info("   sudo -u postgres psql");
  logger.info("   CREATE USER tu_usuario WITH PASSWORD 'tu_password';");
  logger.info("   CREATE DATABASE codekit_pro OWNER tu_usuario;");
  logger.info("   GRANT ALL PRIVILEGES ON DATABASE codekit_pro TO tu_usuario;");
  logger.info("   \\q");

  logger.info("\n3. Crear archivo .env con:");
  logger.info("   DATABASE_URL=postgresql://tu_usuario:tu_password@localhost:5432/codekit_pro");
  logger.info("   JWT_SECRET=$(openssl rand -base64 32)");
  logger.info("   ADMIN_PASSWORD=941259018a");

  logger.info("\n4. Verificar configuración:");
  logger.info("   npm run db:setup");

  logger.info("\n5. Crear tablas:");
  logger.info("   npm run db:push");

  logger.info("\n💡 CONSEJO:");
  logger.info("   Si prefieres usar el usuario 'postgres' por defecto,");
  logger.info("   puedes usar: postgresql://postgres:tu_password@localhost:5432/codekit_pro");
  logger.info("   (pero es menos seguro para producción)");
}

main().catch((error) => {
  logger.error("Error:", error);
  process.exit(1);
});

