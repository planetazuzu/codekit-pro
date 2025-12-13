#!/bin/bash
# Script para mover archivos .md del raíz a docs/internal/

set -e

PROJECT_DIR="/home/planetazuzu/CodeKit Pro"
cd "$PROJECT_DIR"

echo "📦 Moviendo archivos de documentación interna..."

# Configuración
mv -f ACTUALIZAR_DATOS_AHORA.md docs/internal/operaciones/ 2>/dev/null || true
mv -f ACTUALIZAR_PROMPTS_SERVIDOR.md docs/internal/operaciones/ 2>/dev/null || true
mv -f AGREGAR_USE_DOCKER.md docs/internal/configuracion/ 2>/dev/null || true
mv -f COMANDO_ACTUALIZAR_PROMPTS.md docs/internal/operaciones/ 2>/dev/null || true
mv -f COMANDO_EXACTO_SERVIDOR.md docs/internal/despliegue/ 2>/dev/null || true
mv -f COMANDOS_DESPLIEGUE_MANUAL.md docs/internal/despliegue/ 2>/dev/null || true
mv -f COMANDOS_RAPIDOS_SERVIDOR.md docs/internal/despliegue/ 2>/dev/null || true
mv -f COMANDOS_SERVIDOR_BUILD_FIX.md docs/internal/troubleshooting/ 2>/dev/null || true
mv -f COMANDOS_VERIFICAR_Y_DESPLEGAR.md docs/internal/despliegue/ 2>/dev/null || true
mv -f CONFIGURACION_COMPLETA.md docs/internal/configuracion/ 2>/dev/null || true
mv -f CONFIGURACION_DOMINIO.md docs/internal/configuracion/ 2>/dev/null || true
mv -f CONFIGURAR_GITHUB_SERVIDOR.md docs/internal/configuracion/ 2>/dev/null || true
mv -f CONFIGURAR_SECRETS.md docs/internal/configuracion/ 2>/dev/null || true
mv -f CONFIGURAR_SERVIDOR.md docs/internal/configuracion/ 2>/dev/null || true
mv -f CONFIGURAR_WEBHOOK.md docs/internal/configuracion/ 2>/dev/null || true
mv -f CREAR_ENV_EN_SERVIDOR.md docs/internal/configuracion/ 2>/dev/null || true
mv -f CREAR_TABLAS_DIRECTO.md docs/internal/base-datos/ 2>/dev/null || true
mv -f CREAR_TABLAS.md docs/internal/base-datos/ 2>/dev/null || true
mv -f DEBUG_DOCKER.md docs/internal/troubleshooting/ 2>/dev/null || true
mv -f DESPLIEGUE_DOCKER.md docs/internal/despliegue/ 2>/dev/null || true
mv -f DESPLIEGUE_RAPIDO.md docs/internal/despliegue/ 2>/dev/null || true
mv -f DESPLIEGUE_RAPIDO_ROOT.md docs/internal/despliegue/ 2>/dev/null || true
mv -f DIAGNOSTICO_ERRORES_500.md docs/internal/troubleshooting/ 2>/dev/null || true
mv -f DOCKER_DESPUES_ACTUALIZAR.md docs/internal/despliegue/ 2>/dev/null || true
mv -f ENV_COMPLETO_SERVIDOR.md docs/internal/configuracion/ 2>/dev/null || true
mv -f ERRORES_DESPLIEGUE.md docs/internal/troubleshooting/ 2>/dev/null || true
mv -f FIX_DIRECTO_SERVIDOR.md docs/internal/troubleshooting/ 2>/dev/null || true
mv -f GUIA_DESPLIEGUE_SERVIDOR.md docs/internal/despliegue/ 2>/dev/null || true
mv -f INSTRUCCIONES_SSH.md docs/internal/operaciones/ 2>/dev/null || true
mv -f LIMPIAR_Y_DOCKER.md docs/internal/despliegue/ 2>/dev/null || true
mv -f PROBAR_DESPLIEGUE.md docs/internal/despliegue/ 2>/dev/null || true
mv -f RESUMEN_CONFIGURACION.md docs/internal/configuracion/ 2>/dev/null || true
mv -f SOLUCIONAR_ERROR_WEBHOOK.md docs/internal/troubleshooting/ 2>/dev/null || true
mv -f SOLUCION_COMPLETA_SERVIDOR.md docs/internal/troubleshooting/ 2>/dev/null || true
mv -f SOLUCION_ERROR_BUILD.md docs/internal/troubleshooting/ 2>/dev/null || true
mv -f SOLUCION_ERROR_NPM.md docs/internal/troubleshooting/ 2>/dev/null || true
mv -f SOLUCION_ERRORES.md docs/internal/troubleshooting/ 2>/dev/null || true
mv -f SOLUCION_NO_VES_CAMBIOS.md docs/internal/troubleshooting/ 2>/dev/null || true
mv -f VERIFICAR_WEBHOOK_FUNCIONANDO.md docs/internal/despliegue/ 2>/dev/null || true
mv -f VERIFICAR_Y_PROBAR.md docs/internal/despliegue/ 2>/dev/null || true

# Mover archivos de docs/ a docs/internal/
mv -f docs/ACTUALIZAR_DATOS.md docs/internal/operaciones/ 2>/dev/null || true
mv -f docs/ANALISIS_MODELO_NEGOCIO.md docs/internal/decisiones/ 2>/dev/null || true
mv -f docs/APIS_AFILIADOS.md docs/internal/arquitectura/ 2>/dev/null || true
mv -f docs/ARREGLAR_DESPLIEGUE_AUTOMATICO.md docs/internal/despliegue/ 2>/dev/null || true
mv -f docs/AUDITORIA_TECNICA.md docs/internal/decisiones/ 2>/dev/null || true
mv -f docs/CHECKLIST_DESPLIEGUE_COMPLETO.md docs/internal/despliegue/ 2>/dev/null || true
mv -f docs/CICD_AUTOMATICO.md docs/internal/ci-cd/ 2>/dev/null || true
mv -f docs/CICD_AVANZADO.md docs/internal/ci-cd/ 2>/dev/null || true
mv -f docs/COMO_FUNCIONA_WEBHOOK.md docs/internal/ci-cd/ 2>/dev/null || true
mv -f docs/CONFIGURACION_DOMINIO.md docs/internal/configuracion/ 2>/dev/null || true
mv -f docs/CONFIGURACION_POSTGRESQL.md docs/internal/base-datos/ 2>/dev/null || true
mv -f docs/DATOS_NECESARIOS_POSTGRESQL.md docs/internal/base-datos/ 2>/dev/null || true
mv -f docs/DESPLIEGUE_POST_MEJORAS.md docs/internal/despliegue/ 2>/dev/null || true
mv -f docs/DESPLIEGUE_PUERTO_8604.md docs/internal/despliegue/ 2>/dev/null || true
mv -f docs/DIAGNOSTICO_DESPLIEGUE.md docs/internal/troubleshooting/ 2>/dev/null || true
mv -f docs/ESTADO_CI_CD.md docs/internal/ci-cd/ 2>/dev/null || true
mv -f docs/GITHUB_SYNC.md docs/internal/ci-cd/ 2>/dev/null || true
mv -f docs/GUIA_CONFIGURACION_GITHUB.md docs/internal/configuracion/ 2>/dev/null || true
mv -f docs/INSTALAR_POSTGRESQL_LOCAL.md docs/internal/base-datos/ 2>/dev/null || true
mv -f docs/LO_QUE_FALTA_BASE_DATOS.md docs/internal/base-datos/ 2>/dev/null || true
mv -f docs/LO_QUE_FALTA.md docs/internal/decisiones/ 2>/dev/null || true
mv -f docs/MEJORAS_INCREMENTALES.md docs/internal/decisiones/ 2>/dev/null || true
mv -f docs/MOBILE_FIRST_GUIDE.md docs/internal/decisiones/ 2>/dev/null || true
mv -f docs/PLAN_COMPLETAR_FUNCIONALIDADES.md docs/internal/decisiones/ 2>/dev/null || true
mv -f docs/PLAN_IMPLEMENTACION.md docs/internal/decisiones/ 2>/dev/null || true
mv -f docs/PLAN_SINCRONIZACION_GITHUB.md docs/internal/ci-cd/ 2>/dev/null || true
mv -f docs/PROMPT_LISTO_USAR.md docs/internal/decisiones/ 2>/dev/null || true
mv -f docs/QUICK_DEPLOY.md docs/internal/despliegue/ 2>/dev/null || true
mv -f docs/RECURSOS_DISPONIBLES.md docs/internal/decisiones/ 2>/dev/null || true
mv -f docs/CLASIFICACION_DOCUMENTACION.md docs/internal/decisiones/ 2>/dev/null || true
mv -f docs/REORGANIZACION_COMPLETA.md docs/internal/decisiones/ 2>/dev/null || true
mv -f docs/CAJA_HERRAMIENTAS_ACTUALIZADA.md docs/internal/decisiones/ 2>/dev/null || true

echo "✅ Archivos movidos correctamente"
