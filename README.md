# 🚀 CodeKit Pro

**Suite completa de herramientas para desarrollo asistido por IA**

CodeKit Pro es una aplicación SaaS que proporciona un conjunto de herramientas esenciales para desarrolladores que trabajan con entornos de programación asistida por IA como Vibe Code, Lovable, Cursor, etc.

---

## ✨ Características Principales

- 🧠 **Biblioteca de Prompts** - Organiza y gestiona prompts por categorías
- 🧩 **Herramientas de Desarrollo** - Generadores de favicons, meta tags, README, y más
- 📚 **Guías Visuales** - Almacena referencias UI, capturas y manuales de estilo
- 🔗 **Enlaces Rápidos** - Accesos directos a herramientas de desarrollo
- 💾 **Snippets** - Repositorio de código reutilizable
- 👥 **Multi-Tenancy** - Sistema de usuarios con aislamiento de datos
- 💳 **Suscripciones** - Planes Free, Pro y Enterprise con Stripe
- 📊 **Panel de Afiliados** - Tracking y gestión de programas de afiliados

---

## 🛠️ Stack Tecnológico

- **Frontend:** React 19 + TypeScript + Vite + TailwindCSS
- **Backend:** Express + TypeScript + Node.js
- **Base de Datos:** PostgreSQL + Drizzle ORM
- **Autenticación:** JWT + bcrypt
- **Pagos:** Stripe
- **Seguridad:** Helmet + DOMPurify + Rate Limiting

---

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js 18+
- PostgreSQL 12+
- npm o yarn

### Instalación

```bash
# Clonar el repositorio
git clone <repo-url>
cd CodeKit\ Pro

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus configuraciones

# Configurar base de datos
npm run db:push

# Iniciar en desarrollo
npm run dev
```

### Variables de Entorno Requeridas

```bash
NODE_ENV=development
PORT=5000
DATABASE_URL=postgresql://usuario:password@host:5432/database
JWT_SECRET=tu-secret-key-minimo-32-caracteres
ADMIN_PASSWORD=tu-password-admin
```

Ver **docs/CHECKLIST_DESPLIEGUE_COMPLETO.md** para la lista completa.

---

## 📚 Documentación

Toda la documentación está en la carpeta `/docs`:

- **[CHECKLIST_DESPLIEGUE_COMPLETO.md](docs/CHECKLIST_DESPLIEGUE_COMPLETO.md)** - Guía completa de despliegue
- **[INFORME_EJECUTIVO_FASE_0.md](docs/INFORME_EJECUTIVO_FASE_0.md)** - Auditoría y roadmap
- **[CONFIGURACION_POSTGRESQL.md](docs/CONFIGURACION_POSTGRESQL.md)** - Configuración de PostgreSQL

Ver [docs/README.md](docs/README.md) para el índice completo de documentación.

---

## 🏗️ Scripts Disponibles

```bash
# Desarrollo
npm run dev              # Iniciar servidor de desarrollo
npm run dev:client       # Solo frontend (Vite)

# Build
npm run build            # Build de producción
npm start                # Iniciar servidor de producción

# Base de Datos
npm run db:push          # Crear/actualizar esquema de BD
npm run db:setup         # Verificar conexión a BD
npm run db:check         # Verificar requisitos de BD
npm run db:migrate       # Migrar datos

# Testing
npm test                 # Ejecutar tests
npm run test:ui          # Tests con UI
npm run test:coverage    # Tests con cobertura

# TypeScript
npm run check            # Verificar tipos TypeScript
```

---

## 📁 Estructura del Proyecto

```
CodeKit Pro/
├── client/              # Frontend React
│   └── src/
│       ├── components/  # Componentes React
│       ├── pages/       # Páginas
│       ├── hooks/       # Custom hooks
│       └── tools/       # Herramientas de desarrollo
├── server/              # Backend Express
│   ├── controllers/     # Controladores
│   ├── routes/          # Rutas API
│   ├── middleware/      # Middleware
│   ├── services/        # Servicios de negocio
│   └── storage/         # Capa de almacenamiento
├── shared/              # Código compartido
│   └── schema.ts        # Esquemas Drizzle ORM
└── docs/                # Documentación
```

---

## 🔐 Seguridad

- ✅ Input sanitization con DOMPurify
- ✅ Rate limiting en todos los endpoints
- ✅ Security headers con Helmet
- ✅ JWT para autenticación
- ✅ Bcrypt para hash de contraseñas
- ✅ Validación de entrada con Zod

---

## 💳 Planes de Suscripción

- **Free** - Plan gratuito con límites básicos
- **Pro** - $9.99/mes - Para usuarios avanzados
- **Enterprise** - $49.99/mes - Para equipos y empresas

Ver [server/config/plans.ts](server/config/plans.ts) para detalles completos.

---

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

---

## 🆘 Soporte

- 📖 [Documentación Completa](docs/README.md)
- 🐛 [Reportar Issues](https://github.com/tu-repo/issues)
- 💬 [Discusiones](https://github.com/tu-repo/discussions)

---

**Desarrollado con ❤️ para la comunidad de desarrolladores**

<!-- Último despliegue automático: 2025-12-12 20:28:29 -->
