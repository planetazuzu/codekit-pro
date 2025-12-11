# 🔄 PLAN DE SINCRONIZACIÓN BIDIRECCIONAL CON GITHUB

## 🎯 OBJETIVO

Conectar CodeKit Pro con el repositorio GitHub `codekit-pro-data` para sincronización bidireccional:
- **GitHub → App**: Cuando añadas datos en GitHub, se sincronizan automáticamente a la app
- **App → GitHub**: Cuando añadas datos en la app, se sincronizan al repositorio GitHub

---

## 📋 PREGUNTAS ANTES DE IMPLEMENTAR

### 1. Autenticación con GitHub
- [ ] ¿Tienes un **Personal Access Token (PAT)** de GitHub?
- [ ] ¿Prefieres autenticación por usuario o token de aplicación?
- [ ] ¿El token necesita permisos de escritura? (para App → GitHub)

### 2. Frecuencia de Sincronización
- [ ] ¿Sincronización automática cada X minutos/horas?
- [ ] ¿Sincronización manual desde el panel admin?
- [ ] ¿Sincronización en tiempo real (webhooks)?

### 3. Manejo de Conflictos
- [ ] Si un recurso se modifica en ambos lados, ¿cuál tiene prioridad?
  - Opción A: GitHub tiene prioridad (GitHub es la fuente de verdad)
  - Opción B: App tiene prioridad
  - Opción C: Última modificación gana
  - Opción D: Requiere resolución manual

### 4. Tipos de Recursos a Sincronizar
- [ ] Prompts
- [ ] Snippets
- [ ] Links
- [ ] Guides
- [ ] Tools/Scripts
- [ ] ¿Todos los anteriores?

### 5. Usuario del Repositorio
- [ ] ¿Cuál es tu usuario/organización de GitHub?
- [ ] ¿El repositorio será `usuario/codekit-pro-data`?
- [ ] ¿El repositorio ya existe o lo crearemos?

### 6. Identificación de Recursos
- [ ] ¿Cómo identificamos si un recurso ya existe?
  - Por ID único
  - Por título + categoría
  - Por hash del contenido

### 7. Historial y Versiones
- [ ] ¿Quieres mantener historial de cambios?
- [ ] ¿Usar commits de Git para tracking?
- [ ] ¿Notificaciones cuando hay cambios?

---

## 🏗️ ARQUITECTURA PROPUESTA

### Opción 1: Sincronización Manual (Más Simple)
```
Panel Admin → Botón "Sincronizar con GitHub"
  ↓
Lee todos los archivos JSON del repo
  ↓
Compara con datos en BD
  ↓
Aplica cambios (crear/actualizar)
  ↓
Muestra resumen de cambios
```

**Ventajas**: Simple, controlado, sin conflictos inesperados
**Desventajas**: Requiere acción manual

### Opción 2: Sincronización Automática (Más Complejo)
```
Cron Job cada X minutos
  ↓
Lee cambios desde GitHub (API)
  ↓
Compara con última sincronización
  ↓
Aplica solo cambios nuevos
  ↓
Log de sincronizaciones
```

**Ventajas**: Automático, siempre actualizado
**Desventajas**: Más complejo, requiere manejo de errores

### Opción 3: Webhooks (Tiempo Real)
```
GitHub → Webhook cuando hay push
  ↓
Endpoint en CodeKit Pro recibe notificación
  ↓
Sincroniza solo archivos modificados
  ↓
Actualiza BD inmediatamente
```

**Ventajas**: Tiempo real, eficiente
**Desventajas**: Requiere endpoint público, más complejo

---

## 🔧 COMPONENTES NECESARIOS

### 1. Servicio de Sincronización (`server/services/github-sync.service.ts`)
- Leer archivos desde GitHub API
- Comparar con datos locales
- Aplicar cambios (crear/actualizar/eliminar)
- Manejar conflictos

### 2. Servicio de Escritura GitHub (`server/services/github-write.service.ts`)
- Escribir archivos a GitHub API
- Crear commits
- Manejar errores de escritura

### 3. Endpoints API
- `POST /api/admin/github/sync` - Sincronizar desde GitHub
- `POST /api/admin/github/push` - Enviar cambios a GitHub
- `GET /api/admin/github/status` - Estado de sincronización
- `GET /api/admin/github/changes` - Ver cambios pendientes

### 4. Panel Admin
- Botones de sincronización
- Vista de estado
- Log de sincronizaciones
- Resolución de conflictos

### 5. Configuración
- Variables de entorno:
  - `GITHUB_TOKEN` - Token de autenticación
  - `GITHUB_REPO_OWNER` - Usuario/org
  - `GITHUB_REPO_NAME` - Nombre del repo
  - `GITHUB_SYNC_ENABLED` - Habilitar/deshabilitar

---

## 📊 FLUJO DE SINCRONIZACIÓN

### GitHub → App (Pull)
```
1. Usuario hace push a GitHub
2. Admin hace clic en "Sincronizar desde GitHub"
3. Sistema lee archivos JSON del repo
4. Compara con datos en BD:
   - Nuevos → Crear
   - Modificados → Actualizar
   - Eliminados → Marcar como eliminado (o eliminar)
5. Muestra resumen de cambios
6. Confirma y aplica
```

### App → GitHub (Push)
```
1. Usuario crea/modifica recurso en la app
2. Sistema marca como "pendiente de sincronizar"
3. Admin hace clic en "Enviar a GitHub"
4. Sistema:
   - Lee datos modificados desde BD
   - Convierte a formato JSON del repo
   - Actualiza archivo correspondiente en GitHub
   - Crea commit con mensaje descriptivo
5. Confirma éxito
```

---

## 🛠️ IMPLEMENTACIÓN PROPUESTA

### Fase 1: Sincronización Manual GitHub → App
- [ ] Servicio para leer desde GitHub
- [ ] Comparación de datos
- [ ] Endpoint de sincronización
- [ ] Panel admin básico

### Fase 2: Sincronización Manual App → GitHub
- [ ] Servicio para escribir a GitHub
- [ ] Conversión de datos a formato JSON
- [ ] Endpoint de push
- [ ] Manejo de errores

### Fase 3: Automatización (Opcional)
- [ ] Cron job para sincronización automática
- [ ] Webhooks para tiempo real
- [ ] Notificaciones de cambios

---

## 📝 PREGUNTAS PARA RESPONDER

Antes de implementar, necesito saber:

1. **¿Tienes token de GitHub?** (necesario para autenticación)
2. **¿Cuál es tu usuario de GitHub?** (para construir la URL del repo)
3. **¿Prefieres sincronización manual o automática?**
4. **¿Qué hacer con conflictos?** (GitHub gana / App gana / Manual)
5. **¿Qué recursos sincronizar?** (todos o algunos específicos)

---

## 🚀 SIGUIENTE PASO

Una vez que respondas las preguntas, implementaré:
1. Servicio de sincronización GitHub → App
2. Servicio de escritura App → GitHub
3. Endpoints API
4. Panel admin para gestionar sincronización
5. Documentación de uso

¿Qué prefieres empezar primero?

