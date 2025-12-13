# 📋 Clasificación y Reorganización de Documentación

## 🎯 Objetivo

Separar claramente la documentación en dos categorías:
- **FRONTEND**: Contenido educativo/informativo para usuarios finales
- **INTERNA**: Documentación técnica/operativa para desarrolladores

---

## 📊 Análisis de Archivos Actuales

### ✅ FRONTEND / DOCUMENTACIÓN PÚBLICA (A)

**Ubicación propuesta:** `/docs/public/` o mantener en `/docs/01-07/`

#### Ya Bien Organizados:
- ✅ `docs/01-introduccion/README.md` - A
- ✅ `docs/01-introduccion/inicio-rapido.md` - A
- ✅ `docs/02-guias/README.md` - A
- ✅ `docs/02-guias/prompts.md` - A
- ✅ `docs/03-comparativas/README.md` - A
- ✅ `docs/03-comparativas/ia-programacion.md` - A
- ✅ `docs/04-arquitectura/README.md` - A (pero podría ser B)
- ✅ `docs/04-arquitectura/arquitectura-general.md` - A (pero podría ser B)
- ✅ `docs/05-buenas-practicas/README.md` - A
- ✅ `docs/06-conceptos/README.md` - A
- ✅ `docs/07-faq/README.md` - A
- ✅ `README.md` (raíz) - A

#### Necesitan Revisión/Mejora:
- ⚠️ `docs/CAJA_HERRAMIENTAS_ACTUALIZADA.md` - A (pero es más bien plan interno)
- ⚠️ `docs/CARACTERISTICAS.md` - A (si es para usuarios) o B (si es técnica)

---

### 🔧 INTERNA / DOCUMENTACIÓN TÉCNICA (B)

**Ubicación propuesta:** `/docs/internal/` o `/docs/dev/`

#### Configuración y Despliegue:
- ✅ `ACTUALIZAR_DATOS_AHORA.md` - B → `docs/internal/operaciones/actualizar-datos.md`
- ✅ `ACTUALIZAR_PROMPTS_SERVIDOR.md` - B → `docs/internal/operaciones/actualizar-prompts.md`
- ✅ `AGREGAR_USE_DOCKER.md` - B → `docs/internal/configuracion/docker.md`
- ✅ `COMANDO_ACTUALIZAR_PROMPTS.md` - B → Consolidar con `actualizar-prompts.md`
- ✅ `COMANDO_EXACTO_SERVIDOR.md` - B → Consolidar
- ✅ `COMANDOS_DESPLIEGUE_MANUAL.md` - B → `docs/internal/despliegue/manual.md`
- ✅ `COMANDOS_RAPIDOS_SERVIDOR.md` - B → Consolidar
- ✅ `COMANDOS_SERVIDOR_BUILD_FIX.md` - B → Consolidar o eliminar si está resuelto
- ✅ `COMANDOS_VERIFICAR_Y_DESPLEGAR.md` - B → Consolidar
- ✅ `CONFIGURACION_COMPLETA.md` - B → `docs/internal/configuracion/completa.md`
- ✅ `CONFIGURACION_DOMINIO.md` - B → `docs/internal/configuracion/dominio.md`
- ✅ `CONFIGURAR_GITHUB_SERVIDOR.md` - B → `docs/internal/configuracion/github.md`
- ✅ `CONFIGURAR_SECRETS.md` - B → `docs/internal/configuracion/secrets.md`
- ✅ `CONFIGURAR_SERVIDOR.md` - B → `docs/internal/configuracion/servidor.md`
- ✅ `CONFIGURAR_WEBHOOK.md` - B → `docs/internal/configuracion/webhook.md`
- ✅ `CREAR_ENV_EN_SERVIDOR.md` - B → `docs/internal/configuracion/env.md`
- ✅ `CREAR_TABLAS_DIRECTO.md` - B → `docs/internal/base-datos/crear-tablas.md`
- ✅ `CREAR_TABLAS.md` - B → Consolidar con anterior
- ✅ `DEBUG_DOCKER.md` - B → `docs/internal/troubleshooting/docker.md`
- ✅ `DESPLIEGUE_DOCKER.md` - B → `docs/internal/despliegue/docker.md`
- ✅ `DESPLIEGUE_RAPIDO.md` - B → Consolidar
- ✅ `DESPLIEGUE_RAPIDO_ROOT.md` - B → Consolidar
- ✅ `DIAGNOSTICO_ERRORES_500.md` - B → `docs/internal/troubleshooting/errores-500.md`
- ✅ `DOCKER_DESPUES_ACTUALIZAR.md` - B → Consolidar
- ✅ `ENV_COMPLETO_SERVIDOR.md` - B → Consolidar con `configuracion/env.md`
- ✅ `ERRORES_DESPLIEGUE.md` - B → `docs/internal/troubleshooting/despliegue.md`
- ✅ `FIX_DIRECTO_SERVIDOR.md` - B → Consolidar o eliminar si está resuelto
- ✅ `GUIA_DESPLIEGUE_SERVIDOR.md` - B → Consolidar con `despliegue/`
- ✅ `INSTRUCCIONES_SSH.md` - B → `docs/internal/operaciones/ssh.md`
- ✅ `LIMPIAR_Y_DOCKER.md` - B → Consolidar
- ✅ `PROBAR_DESPLIEGUE.md` - B → `docs/internal/despliegue/probar.md`
- ✅ `RESUMEN_CONFIGURACION.md` - B → Consolidar
- ✅ `SOLUCIONAR_ERROR_WEBHOOK.md` - B → `docs/internal/troubleshooting/webhook.md`
- ✅ `SOLUCION_COMPLETA_SERVIDOR.md` - B → Consolidar o eliminar
- ✅ `SOLUCION_ERROR_BUILD.md` - B → `docs/internal/troubleshooting/build.md`
- ✅ `SOLUCION_ERROR_NPM.md` - B → Consolidar
- ✅ `SOLUCION_ERRORES.md` - B → Consolidar
- ✅ `SOLUCION_NO_VES_CAMBIOS.md` - B → `docs/internal/troubleshooting/cambios-no-visibles.md`
- ✅ `VERIFICAR_WEBHOOK_FUNCIONANDO.md` - B → Consolidar
- ✅ `VERIFICAR_Y_PROBAR.md` - B → Consolidar

#### Documentación Técnica en /docs:
- ✅ `docs/ACTUALIZAR_DATOS.md` - B → Consolidar
- ✅ `docs/ANALISIS_MODELO_NEGOCIO.md` - B → `docs/internal/decisiones/modelo-negocio.md`
- ✅ `docs/APIS_AFILIADOS.md` - B → `docs/internal/arquitectura/apis-afiliados.md`
- ✅ `docs/ARREGLAR_DESPLIEGUE_AUTOMATICO.md` - B → `docs/internal/despliegue/automatico.md`
- ✅ `docs/AUDITORIA_TECNICA.md` - B → `docs/internal/decisiones/auditoria.md`
- ✅ `docs/CHECKLIST_DESPLIEGUE_COMPLETO.md` - B → `docs/internal/despliegue/checklist.md`
- ✅ `docs/CICD_AUTOMATICO.md` - B → `docs/internal/ci-cd/automatico.md`
- ✅ `docs/CICD_AVANZADO.md` - B → `docs/internal/ci-cd/avanzado.md`
- ✅ `docs/COMO_FUNCIONA_WEBHOOK.md` - B → `docs/internal/ci-cd/webhook.md`
- ✅ `docs/CONFIGURACION_DOMINIO.md` - B → Consolidar
- ✅ `docs/CONFIGURACION_POSTGRESQL.md` - B → `docs/internal/base-datos/postgresql.md`
- ✅ `docs/DATOS_NECESARIOS_POSTGRESQL.md` - B → Consolidar
- ✅ `docs/DESPLIEGUE_POST_MEJORAS.md` - B → Consolidar
- ✅ `docs/DESPLIEGUE_PUERTO_8604.md` - B → Consolidar
- ✅ `docs/DIAGNOSTICO_DESPLIEGUE.md` - B → `docs/internal/troubleshooting/despliegue.md`
- ✅ `docs/ESTADO_CI_CD.md` - B → `docs/internal/ci-cd/estado.md`
- ✅ `docs/GITHUB_SYNC.md` - B → `docs/internal/ci-cd/github-sync.md`
- ✅ `docs/GUIA_CONFIGURACION_GITHUB.md` - B → Consolidar
- ✅ `docs/INSTALAR_POSTGRESQL_LOCAL.md` - B → `docs/internal/base-datos/instalacion-local.md`
- ✅ `docs/LO_QUE_FALTA_BASE_DATOS.md` - B → Consolidar o eliminar si está resuelto
- ✅ `docs/LO_QUE_FALTA.md` - B → `docs/internal/planificacion/pendiente.md`
- ✅ `docs/MEJORAS_INCREMENTALES.md` - B → `docs/internal/planificacion/mejoras.md`
- ✅ `docs/MOBILE_FIRST_GUIDE.md` - B → `docs/internal/desarrollo/mobile-first.md`
- ✅ `docs/PLAN_COMPLETAR_FUNCIONALIDADES.md` - B → `docs/internal/planificacion/completar-funcionalidades.md`
- ✅ `docs/PLAN_IMPLEMENTACION.md` - B → `docs/internal/planificacion/implementacion.md`
- ✅ `docs/PLAN_SINCRONIZACION_GITHUB.md` - B → Consolidar
- ✅ `docs/PROJECT_MEMORY.md` - B → `docs/internal/decisiones/project-memory.md`
- ✅ `docs/PROMPT_LISTO_USAR.md` - B → Eliminar o mover a notas
- ✅ `docs/QUICK_DEPLOY.md` - B → Consolidar
- ✅ `docs/RECURSOS_DISPONIBLES.md` - A o B (depende del contenido)

---

## 📁 Estructura Propuesta

```
docs/
├── README.md (índice general)
│
├── public/                    # FRONTEND - Visible en la app
│   ├── README.md
│   ├── introduccion/
│   │   ├── README.md
│   │   └── inicio-rapido.md
│   ├── guias/
│   │   ├── README.md
│   │   ├── prompts.md
│   │   └── [otras guías]
│   ├── comparativas/
│   │   ├── README.md
│   │   ├── ia-programacion.md
│   │   └── [otras comparativas]
│   ├── conceptos/
│   │   └── README.md
│   └── faq/
│       └── README.md
│
└── internal/                  # INTERNA - Solo para desarrolladores
    ├── README.md
    ├── configuracion/
    │   ├── README.md
    │   ├── servidor.md
    │   ├── docker.md
    │   ├── env.md
    │   ├── secrets.md
    │   ├── webhook.md
    │   ├── github.md
    │   └── dominio.md
    ├── despliegue/
    │   ├── README.md
    │   ├── docker.md
    │   ├── manual.md
    │   ├── automatico.md
    │   ├── checklist.md
    │   └── probar.md
    ├── base-datos/
    │   ├── README.md
    │   ├── postgresql.md
    │   ├── crear-tablas.md
    │   └── instalacion-local.md
    ├── ci-cd/
    │   ├── README.md
    │   ├── automatico.md
    │   ├── avanzado.md
    │   ├── webhook.md
    │   ├── github-sync.md
    │   └── estado.md
    ├── operaciones/
    │   ├── README.md
    │   ├── ssh.md
    │   ├── actualizar-datos.md
    │   └── actualizar-prompts.md
    ├── troubleshooting/
    │   ├── README.md
    │   ├── despliegue.md
    │   ├── docker.md
    │   ├── webhook.md
    │   ├── build.md
    │   ├── errores-500.md
    │   └── cambios-no-visibles.md
    ├── desarrollo/
    │   ├── README.md
    │   └── mobile-first.md
    ├── planificacion/
    │   ├── README.md
    │   ├── implementacion.md
    │   ├── completar-funcionalidades.md
    │   ├── pendiente.md
    │   └── mejoras.md
    └── decisiones/
        ├── README.md
        ├── arquitectura.md
        ├── modelo-negocio.md
        ├── auditoria.md
        └── project-memory.md
```

---

## 🗑️ Archivos a Eliminar o Consolidar

### Eliminar (duplicados o resueltos):
- `COMANDO_ACTUALIZAR_PROMPTS.md` → Consolidar
- `COMANDO_EXACTO_SERVIDOR.md` → Consolidar
- `COMANDOS_RAPIDOS_SERVIDOR.md` → Consolidar
- `COMANDOS_SERVIDOR_BUILD_FIX.md` → Eliminar si está resuelto
- `CREAR_TABLAS.md` → Consolidar con `CREAR_TABLAS_DIRECTO.md`
- `DESPLIEGUE_RAPIDO.md` → Consolidar
- `DESPLIEGUE_RAPIDO_ROOT.md` → Consolidar
- `DOCKER_DESPUES_ACTUALIZAR.md` → Consolidar
- `ENV_COMPLETO_SERVIDOR.md` → Consolidar
- `FIX_DIRECTO_SERVIDOR.md` → Eliminar si está resuelto
- `RESUMEN_CONFIGURACION.md` → Consolidar
- `SOLUCION_COMPLETA_SERVIDOR.md` → Consolidar
- `SOLUCION_ERROR_NPM.md` → Consolidar
- `SOLUCION_ERRORES.md` → Consolidar
- `VERIFICAR_WEBHOOK_FUNCIONANDO.md` → Consolidar
- `VERIFICAR_Y_PROBAR.md` → Consolidar
- `docs/PROMPT_LISTO_USAR.md` → Eliminar o mover a notas
- `docs/LO_QUE_FALTA_BASE_DATOS.md` → Eliminar si está resuelto
- `docs/PLAN_SINCRONIZACION_GITHUB.md` → Consolidar
- `docs/QUICK_DEPLOY.md` → Consolidar

### Consolidar en Documentos Únicos:
- Todos los archivos de configuración → `docs/internal/configuracion/`
- Todos los archivos de despliegue → `docs/internal/despliegue/`
- Todos los archivos de troubleshooting → `docs/internal/troubleshooting/`

---

## 📝 Plan de Acción

### Fase 1: Crear Estructura (30 min)
1. Crear directorios `docs/public/` y `docs/internal/`
2. Crear subdirectorios según estructura propuesta
3. Mover archivos existentes de `docs/01-07/` a `docs/public/`

### Fase 2: Consolidar Documentación Interna (2-3 horas)
1. Consolidar archivos de configuración
2. Consolidar archivos de despliegue
3. Consolidar archivos de troubleshooting
4. Eliminar duplicados

### Fase 3: Limpiar y Mejorar (2-3 horas)
1. Revisar cada documento consolidado
2. Eliminar contenido redundante
3. Ajustar tono según público objetivo
4. Añadir índices en cada sección

### Fase 4: Actualizar Referencias (1 hora)
1. Actualizar enlaces en código
2. Actualizar `server/routes/docs.ts` para nueva estructura
3. Actualizar README principal

---

## ✅ Criterios de Clasificación

### FRONTEND (A) - Si:
- ✅ Explica cómo usar la aplicación
- ✅ Enseña conceptos generales
- ✅ Compara herramientas para usuarios
- ✅ Responde preguntas de usuarios finales
- ✅ Lenguaje no técnico o técnico accesible

### INTERNA (B) - Si:
- ✅ Instrucciones de despliegue
- ✅ Configuración de servidor
- ✅ Troubleshooting técnico
- ✅ Decisiones de arquitectura
- ✅ Planes de desarrollo
- ✅ Scripts y comandos
- ✅ Configuración de CI/CD

---

**Estado:** Análisis completo, listo para implementación

