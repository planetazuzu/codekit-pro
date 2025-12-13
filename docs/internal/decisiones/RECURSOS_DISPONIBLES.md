# 📚 Recursos Disponibles - CodeKit Pro

Documentación completa de todos los recursos, endpoints y funcionalidades disponibles en CodeKit Pro.

## 🌐 Endpoints de API

### 🔓 Públicos (Sin autenticación)

#### Prompts
- `GET /api/prompts` - Listar todos los prompts
- `GET /api/prompts/:id` - Obtener un prompt específico

#### Snippets
- `GET /api/snippets` - Listar todos los snippets
- `GET /api/snippets/:id` - Obtener un snippet específico

#### Links
- `GET /api/links` - Listar todos los enlaces
- `GET /api/links/:id` - Obtener un enlace específico

#### Guides
- `GET /api/guides` - Listar todas las guías
- `GET /api/guides/:id` - Obtener una guía específica

#### Analytics
- `POST /api/analytics/view` - Registrar una vista

#### Affiliates
- `GET /api/affiliates` - Listar afiliados públicos
- `GET /api/affiliates/:id` - Obtener afiliado específico
- `POST /api/affiliates/:id/click` - Registrar click en afiliado

#### Shortlinks
- `GET /s/:slug` - Redireccionar shortlink

### 🔐 Requieren Autenticación de Usuario

#### Prompts
- `POST /api/prompts` - Crear nuevo prompt
- `PUT /api/prompts/:id` - Actualizar prompt
- `DELETE /api/prompts/:id` - Eliminar prompt

#### Snippets
- `POST /api/snippets` - Crear nuevo snippet
- `PUT /api/snippets/:id` - Actualizar snippet
- `DELETE /api/snippets/:id` - Eliminar snippet

#### Links
- `POST /api/links` - Crear nuevo enlace
- `PUT /api/links/:id` - Actualizar enlace
- `DELETE /api/links/:id` - Eliminar enlace

#### Guides
- `POST /api/guides` - Crear nueva guía
- `PUT /api/guides/:id` - Actualizar guía
- `DELETE /api/guides/:id` - Eliminar guía

#### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/logout` - Cerrar sesión
- `GET /api/auth/me` - Obtener usuario actual

#### Usuarios
- `POST /api/users/register` - Registrar nuevo usuario
- `GET /api/users/me` - Obtener perfil del usuario actual
- `PUT /api/users/me` - Actualizar perfil

### 🔒 Requieren Autenticación de Admin

#### Moderación
- `GET /api/admin/moderation/pending` - Obtener contenido pendiente
- `POST /api/admin/moderation/approve/:type/:id` - Aprobar contenido
- `POST /api/admin/moderation/reject/:type/:id` - Rechazar contenido

#### GitHub Sync
- `GET /api/admin/github/status` - Estado de sincronización
- `POST /api/admin/github/sync` - Sincronizar todo desde GitHub
- `POST /api/admin/github/push` - Enviar todo a GitHub
- `POST /api/admin/github/sync/:type` - Sincronizar tipo específico
- `POST /api/admin/github/push/:type` - Enviar tipo específico

#### Affiliate Programs
- `GET /api/admin/affiliate-programs` - Listar programas de afiliados
- `POST /api/admin/affiliate-programs` - Crear programa
- `PUT /api/admin/affiliate-programs/:id` - Actualizar programa
- `DELETE /api/admin/affiliate-programs/:id` - Eliminar programa

#### Analytics (Admin)
- `GET /api/admin/analytics/stats` - Estadísticas completas

### 🏥 Health Check
- `GET /health` - Estado del servidor

---

## 🖥️ Páginas del Frontend

### Páginas Principales
- `/` - Dashboard principal
- `/prompts` - Gestión de prompts
- `/snippets` - Gestión de snippets
- `/links` - Gestión de enlaces
- `/guides` - Gestión de guías
- `/resources` - Recursos y contenido
- `/tools` - Catálogo de herramientas
- `/deals` - Ofertas y afiliados
- `/api-guides` - Guías de API

### Páginas Legales
- `/legal` - Términos y condiciones
- `/privacy` - Política de privacidad

### Panel de Administración
- `/admin` - Panel principal (Analytics + GitHub Sync)
- `/admin/affiliates` - Gestión de afiliados
- `/admin/affiliates-tracker` - Tracker de programas de afiliados
- `/admin/affiliates-dashboard` - Dashboard de afiliados

---

## 🛠️ Herramientas Disponibles

### Generadores de Documentación
- `/tools/readme` - Generador de README.md
- `/tools/meta` - Generador de Meta Tags SEO
- `/tools/license` - Generador de Licencias
- `/tools/auto-docs` - Documentación automática de código

### Generadores de Código
- `/tools/folders` - Generador de estructuras de carpetas
- `/tools/json` - Generador de JSON Schema
- `/tools/json-to-ts` - Convertidor JSON a TypeScript
- `/tools/db-models` - Generador de modelos de base de datos
- `/tools/function-generator` - Generador de funciones
- `/tools/test-generator` - Generador de tests

### Herramientas de Código
- `/tools/code-rewriter` - Reescribir código
- `/tools/error-explainer` - Explicador de errores
- `/tools/smart-prompts` - Generador inteligente de prompts
- `/tools/usage-examples` - Generador de ejemplos de uso

### Convertidores y Formateadores
- `/tools/base64` - Convertidor de imágenes a Base64
- `/tools/json-formatter` - Formateador de JSON
- `/tools/yaml-formatter` - Formateador de YAML
- `/tools/jwt` - Decodificador de JWT

### Generadores de Assets
- `/tools/colors` - Generador de paletas de colores
- `/tools/svg` - Generador de SVG
- `/tools/favicon` - Generador de favicons
- `/tools/mockup` - Generador de mockups

### Utilidades
- `/tools/gitignore` - Generador de .gitignore
- `/tools/regex` - Tester de expresiones regulares
- `/tools/uuid` - Generador de UUID
- `/tools/api-tester` - Tester de APIs

---

## 📊 Tipos de Contenido

### Prompts
- **Campos**: `title`, `category`, `content`, `tags`
- **Estado**: `pending`, `approved`, `rejected`
- **Usuario**: Asignado al usuario que lo crea

### Snippets
- **Campos**: `title`, `language`, `code`, `description`, `tags`
- **Lenguajes soportados**: TypeScript, JavaScript, Python, etc.
- **Estado**: `pending`, `approved`, `rejected`

### Links
- **Campos**: `title`, `url`, `icon`, `category`, `description`
- **Iconos**: Lucide React icons
- **Estado**: `pending`, `approved`, `rejected`

### Guides
- **Campos**: `title`, `description`, `content`, `type`, `tags`
- **Tipos**: `manual`, `template`, `ui-guide`, `reference`
- **Estado**: `pending`, `approved`, `rejected`

---

## 🔄 Funcionalidades de Sincronización

### GitHub Sync
- **Sincronización bidireccional** con repositorio GitHub
- **Formato**: Archivos JSON organizados por categoría
- **Tipos soportados**: Prompts, Snippets, Links, Guides
- **Configuración**: Variables de entorno (`GITHUB_TOKEN`, `GITHUB_REPO_OWNER`, `GITHUB_REPO_NAME`)

### Flujos Disponibles
1. **GitHub → App**: Descargar contenido desde GitHub
2. **App → GitHub**: Subir contenido a GitHub
3. **Por tipo**: Sincronizar tipo específico (prompts, snippets, etc.)

---

## 📈 Analytics y Estadísticas

### Métricas Disponibles
- **Vistas totales**: Contador de todas las vistas
- **Vistas por página**: Estadísticas por ruta
- **Vistas por tipo de entidad**: Prompts, Snippets, Links, Guides
- **Vistas por fecha**: Gráficos temporales
- **Páginas más visitadas**: Top páginas

### Endpoints de Analytics
- `POST /api/analytics/view` - Registrar vista
- `GET /api/admin/analytics/stats` - Estadísticas completas (Admin)

---

## 💰 Sistema de Afiliados

### Funcionalidades
- **Gestión de afiliados**: CRUD completo
- **Tracking de clicks**: Registro de clicks en enlaces
- **Programas de afiliados**: Integración con APIs externas
- **Estadísticas**: Métricas de clicks y conversiones

### Endpoints
- `GET /api/affiliates` - Listar afiliados
- `POST /api/affiliates/:id/click` - Registrar click
- `GET /api/admin/affiliate-programs` - Programas (Admin)

---

## 🔐 Autenticación y Autorización

### Niveles de Acceso
1. **Público**: Sin autenticación (solo lectura)
2. **Usuario**: Autenticado (crear/editar propio contenido)
3. **Admin**: Autenticado como admin (acceso completo)

### Sistema de Moderación
- **Contenido pendiente**: Requiere aprobación de admin
- **Contenido aprobado**: Visible públicamente
- **Contenido rechazado**: No visible

---

## 📦 Modelo de Negocio

### Plan Actual
- **Plan Free**: Ilimitado, todas las funcionalidades
- **Monetización**: Enlaces de afiliados y programas recomendados
- **Sin suscripciones**: Completamente gratuito

---

## 🚀 Características Técnicas

### Stack Tecnológico
- **Frontend**: React + TypeScript + Vite
- **Backend**: Node.js + Express + TypeScript
- **Base de datos**: PostgreSQL con Drizzle ORM
- **Autenticación**: JWT + Sessions
- **Deployment**: PM2 en puerto 8604

### PWA (Progressive Web App)
- **Manifest**: Configurado
- **Service Worker**: Network First strategy
- **Iconos**: 192x192 y 512x512

### Seguridad
- **Rate Limiting**: Aplicado en endpoints sensibles
- **CORS**: Configurado con `ALLOWED_ORIGINS`
- **CSP**: Content Security Policy configurado
- **Sanitización**: Input sanitization en formularios

---

## 📝 Notas Importantes

### Límites
- **Rate Limits**: Aplicados en endpoints de escritura
- **Tamaño de archivos**: Límite de 10MB por request
- **GitHub API**: 5,000 requests/hora con token autenticado

### Estado del Contenido
- **Sistema**: Contenido del usuario "system" siempre aprobado
- **Usuarios**: Contenido nuevo requiere aprobación
- **Actualizaciones**: Vuelven a estado "pending"

### Sincronización GitHub
- **Manual**: Por ahora requiere acción manual
- **Bidireccional**: Soporta lectura y escritura
- **Detección de duplicados**: Por título + categoría/lenguaje/tipo

---

## 🔗 Enlaces Útiles

- **Documentación completa**: `/docs/README.md`
- **Guía de despliegue**: `/docs/QUICK_DEPLOY.md`
- **Configuración GitHub**: `/docs/GUIA_CONFIGURACION_GITHUB.md`
- **Sincronización técnica**: `/docs/GITHUB_SYNC.md`

---

**Última actualización**: 2025-01-07

