# CodeKit Pro - Memoria del Proyecto

## 📋 Descripción General
CodeKit Pro es una aplicación full-stack diseñada como suite de herramientas para desarrolladores que trabajan con entornos de programación asistida por IA (Vibe Code, Lovable, Cursor, etc.).

## 🛠️ Stack Tecnológico

### Frontend
- **React 19** + **Vite 7** (build tool)
- **Wouter** (routing)
- **TailwindCSS 4** (estilos)
- **Radix UI** (componentes accesibles)
- **TanStack Query** (gestión de estado del servidor)
- **Lucide React** (iconos)
- **Framer Motion** (animaciones)
- **React Hook Form** + **Zod** (formularios y validación)

### Backend
- **Express 4** (servidor HTTP)
- **Drizzle ORM** (ORM para PostgreSQL)
- **PostgreSQL** (base de datos)
- **Express Session** + **Passport** (autenticación)
- **WebSockets** (ws) para comunicación en tiempo real

### Desarrollo
- **TypeScript 5.6**
- **Drizzle Kit** (migraciones de BD)
- **TSX** (ejecución TypeScript)

## 📁 Estructura del Proyecto

```
CodeKit Pro/
├── client/              # Frontend React
│   ├── src/
│   │   ├── components/  # Componentes UI (Radix UI)
│   │   ├── pages/       # Páginas principales
│   │   ├── tools/       # Herramientas individuales
│   │   ├── layout/      # Layout y Sidebar
│   │   ├── hooks/       # Custom hooks
│   │   ├── lib/         # Utilidades
│   │   └── data/        # Datos estáticos
│   └── public/
├── server/              # Backend Express
│   ├── index.ts        # Punto de entrada
│   ├── routes.ts       # Definición de rutas API
│   ├── storage.ts      # Capa de acceso a datos
│   └── static.ts       # Servir archivos estáticos
├── shared/             # Código compartido
│   └── schema.ts       # Esquemas Drizzle ORM
└── script/             # Scripts de build
```

## 🎨 Diseño Visual

### Tema Oscuro Estilo VSCode
- **Fondo principal**: `#0D1117`
- **Fondo secundario**: `#161B22`
- **Fondo terciario**: `#1F2428`
- **Texto**: `#C9D1D9`
- **Acentos**: `#58A6FF`

### Tipografías
- **UI**: Inter
- **Código**: JetBrains Mono

### Layout
- Sidebar izquierdo fijo
- Contenido central responsive
- Componentes minimalistas tipo dashboard técnico

## 🚀 Funcionalidades Principales

### 1. Prompts (`/prompts`)
Biblioteca de prompts organizados por categorías:
- IA
- Desarrollo
- Testing
- Diseño
- Mobile
- Refactor
- Documentación

### 2. Herramientas (`/tools`)
Mini-aplicaciones dentro del frontend:

**Implementadas:**
- ✅ Generador de README (`/tools/readme`)
- ✅ Generador de Meta Tags (`/tools/meta`)

**Planificadas:**
- Generador de Favicons
- Generador de screenshots de mockups
- Generador de logos rápidos
- Generador de estructuras de carpetas
- Generador de JSON Schemas
- Conversor de imágenes → Base64
- Mini editor de colores y paletas
- Generador de íconos SVG simples

### 3. Snippets (`/snippets`)
Repositorio interno con:
- React snippets
- Hooks reutilizables
- Snippets de Tailwind
- Scripts de despliegue
- Configs útiles (vite.config.js, tsconfig.json, etc.)

### 4. Links (`/links`)
Página con accesos rápidos a:
- Replit
- Cursor
- Vibe Code
- Lovable
- GitHub
- Vercel
- Supabase
- Firebase

### 5. Guides (`/guides`)
Espacio para guardar:
- Guías UI
- Capturas de referencia
- Manuales de estilo
- Plantillas de componentes

## ⚙️ Configuración

### Variables de Entorno
- `PORT`: Puerto del servidor (default: 5000)
- `DATABASE_URL`: URL de conexión a PostgreSQL
- `NODE_ENV`: Entorno (development/production)

### Scripts Disponibles
```bash
npm run dev          # Desarrollo (backend)
npm run dev:client   # Desarrollo frontend (puerto 5000)
npm run build        # Build de producción
npm run start        # Iniciar producción
npm run check        # Verificar tipos TypeScript
npm run db:push      # Push de esquemas a BD
```

### Aliases de Path
- `@/` → `client/src/`
- `@shared/` → `shared/`
- `@assets/` → `attached_assets/`

## 📊 Base de Datos

### Esquemas Actuales
- **users**: Usuarios del sistema
  - `id` (UUID, primary key)
  - `username` (text, unique)
  - `password` (text)
- **prompts**: Biblioteca de prompts
  - `id`, `title`, `category`, `content`, `tags[]`, `createdAt`, `updatedAt`
- **snippets**: Snippets de código
  - `id`, `title`, `language`, `code`, `description`, `tags[]`, `createdAt`, `updatedAt`
- **links**: Enlaces rápidos
  - `id`, `title`, `url`, `icon`, `category`, `description`, `createdAt`, `updatedAt`
- **guides**: Guías visuales
  - `id`, `title`, `description`, `content`, `type`, `tags[]`, `imageUrl`, `createdAt`, `updatedAt`

### Migraciones
Las migraciones se gestionan con Drizzle Kit:
```bash
npm run db:push
```

## 🔌 API

### Rutas
Todas las rutas API deben tener el prefijo `/api`.

**Estado actual**: ✅ Rutas API completas implementadas para prompts, snippets, links y guides. Endpoints REST con CRUD completo.

## 📝 Estado del Proyecto

### Versión Actual
**v2.0 Alpha Release**

### Completado
- ✅ Estructura base del proyecto
- ✅ Layout con sidebar
- ✅ Sistema de routing
- ✅ Componentes UI base (Radix UI)
- ✅ Dashboard principal
- ✅ Generador de README
- ✅ Generador de Meta Tags
- ✅ Tema oscuro estilo VSCode
- ✅ Configuración de base de datos
- ✅ **Esquemas de BD para prompts, snippets, links, guides**
- ✅ **Storage con métodos CRUD completos**
- ✅ **Rutas API REST para todas las entidades**
- ✅ **Hooks de React Query (use-prompts, use-snippets, use-links)**
- ✅ **Frontend conectado a APIs (Prompts, Snippets, Links)**
- ✅ **Inicialización automática de datos estáticos**
- ✅ **Estados de carga y error en páginas**

### Pendiente
- [ ] **Formularios CRUD** (crear/editar prompts, snippets, links)
- [ ] **Sistema de Guides completo** (hook + página conectada a API)
- [ ] **Buscador global funcional** (actualmente solo UI)
- [ ] **Sistema de favoritos con LocalStorage**
- [ ] **7 herramientas faltantes** (folders, json, base64, colors, svg, favicon, mockup)
- [ ] Sistema de autenticación funcional
- [ ] Persistencia real en PostgreSQL (actualmente MemStorage)
- [ ] Exportación/Importación de datos
- [ ] Optimizaciones de rendimiento

## 🎯 Próximos Pasos Sugeridos

1. Completar implementación de rutas API para CRUD de prompts, snippets, links
2. Implementar sistema de autenticación completo
3. Añadir persistencia local (LocalStorage) para datos temporales
4. Desarrollar buscador global
5. Implementar herramientas restantes según prioridad
6. Añadir sistema de exportación/importación de datos
7. Optimizar rendimiento y añadir tests

## 📚 Notas Técnicas

- El proyecto usa **monorepo** con estructura client/server/shared
- Vite se configura para servir el frontend en desarrollo y compilarlo en producción
- Express sirve tanto la API como los archivos estáticos en producción
- El puerto 5000 es el único puerto no bloqueado por firewall
- Los componentes UI están basados en shadcn/ui (Radix UI + TailwindCSS)

---

**Última actualización**: Generado automáticamente como memoria del proyecto

