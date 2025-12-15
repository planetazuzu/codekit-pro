# Análisis de Scripts Obsoletos

## Scripts identificados como obsoletos

### 1. Scripts de instalación duplicados
- **`COMANDO_INSTALACION_LIMPIA_SERVIDOR.sh`** ❌ OBSOLETO
  - **Razón**: Duplicado de `INSTALACION_LIMPIA_SERVIDOR.sh`
  - **Mejor alternativa**: `INSTALACION_LIMPIA_SERVIDOR.sh` (tiene datos preconfigurados) o `scripts/instalacion-limpia.sh` (versión genérica)

### 2. Scripts de deploy con PM2 (obsoletos porque usamos Docker)
- **`scripts/deploy.sh`** ❌ OBSOLETO
  - **Razón**: Usa PM2, pero el proyecto usa Docker Compose (opción recomendada)
  - **Alternativa**: `scripts/deploy-docker-auto.sh` o `scripts/deploy-servidor.sh`
  
- **`scripts/deploy-auto.sh`** ⚠️ FALLBACK (mantener pero documentar)
  - **Razón**: Solo usado como fallback cuando Docker no está disponible
  - **Estado**: Se mantiene temporalmente para compatibilidad, pero se debería migrar a Docker

- **`scripts/deploy-quick.sh`** ❌ OBSOLETO
  - **Razón**: Versión simplificada con PM2, obsoleto
  - **Alternativa**: `scripts/deploy-servidor.sh` para deploy rápido con Docker

### 3. Scripts de actualización
- **`ACTUALIZAR_SERVIDOR.sh`** ❌ OBSOLETO
  - **Razón**: Versión simplificada, funcionalidad cubierta por scripts más completos
  - **Alternativa**: `scripts/deploy-servidor.sh` (más completo y robusto)

## Scripts que se mantienen (activos)

### Scripts de instalación
- ✅ `scripts/instalacion-limpia.sh` - Instalación genérica completa
- ✅ `INSTALACION_LIMPIA_SERVIDOR.sh` - Instalación con datos preconfigurados para el servidor

### Scripts de deploy (Docker)
- ✅ `scripts/deploy-docker-auto.sh` - **USADO POR WEBHOOKS** (script principal)
- ✅ `scripts/deploy-servidor.sh` - Redeploy manual en servidor

### Scripts de utilidad
- ✅ `scripts/stop.sh` - Detener servicios
- ✅ `scripts/restart.sh` - Reiniciar servicios
- ✅ `scripts/check-missing-imports.sh` - Verificar imports
- ✅ `scripts/create-tables-sql.sh` - Crear tablas BD
- ✅ `scripts/force-init-data.sh` - Inicializar datos
- ✅ `scripts/forzar-actualizacion-prompts.sh` - Actualizar prompts
- ✅ `scripts/update-data.sh` - Actualizar datos
- ✅ `scripts/verificar-datos.sh` - Verificar datos

## Resumen de acciones

1. ❌ Eliminar: `COMANDO_INSTALACION_LIMPIA_SERVIDOR.sh`
2. ❌ Eliminar: `scripts/deploy.sh`
3. ❌ Eliminar: `scripts/deploy-quick.sh`
4. ❌ Eliminar: `ACTUALIZAR_SERVIDOR.sh`
5. ⚠️ Mantener temporalmente: `scripts/deploy-auto.sh` (fallback sin Docker)

## Nota sobre package.json

El `package.json` referencia algunos scripts obsoletos:
- `"deploy": "bash scripts/deploy.sh"` → Debería cambiar a `scripts/deploy-servidor.sh`
- `"deploy:quick": "bash scripts/deploy-quick.sh"` → Debería eliminarse o cambiar
