# Project Notes

## Overview

CodeKit Pro es una aplicación web full-stack para gestión de prompts, snippets, herramientas de desarrollo y recursos. El proyecto está funcional al 82% completado, con una base sólida implementada.

**Estado General:** Funcional - 82% completado  
**Versión:** 1.0.0  
**Última actualización:** 2025-12-14

### Métricas Clave
- **Páginas implementadas:** 18/18 (100%)
- **Herramientas implementadas:** 26/26 (100%)
- **Componentes móviles:** 9/9 creados, integración completa en 7 páginas
- **API endpoints:** 21 rutas funcionando
- **Base de datos:** PostgreSQL con Drizzle ORM

---

## Frontend-Relevant Decisions

### Sistema de Páginas Adaptativo Móvil/Desktop

**Implementado:** Sistema completo de routing adaptativo que carga automáticamente versión móvil o desktop según el dispositivo.

**Cómo funciona:**
- Utilidad `createAdaptivePage` en `client/src/utils/page-router.tsx`
- Detecta dispositivo con `useIsMobile()` hook
- Fallback automático: si no existe versión móvil, usa desktop
- Lazy loading con validación estricta de componentes

**Archivos clave:**
- `client/src/utils/page-router.tsx` - Lógica de routing adaptativo
- `client/src/pages/mobile/` - Versiones móviles de páginas
- `client/src/hooks/use-mobile.tsx` - Detección de dispositivo

**Páginas migradas (17/17):**
- Dashboard, Prompts, Snippets, Tools, Guides, Links, APIGuides, Resources, Docs, Deals, Legal, Privacy, AffiliateLanding, Admin, AdminAffiliates, AffiliateProgramsTracker, AffiliateProgramsDashboard

### Code Splitting Strategy

**Decisión:** Chunks separados para optimizar carga en móvil.

**Estructura:**
- `vendor` - React core y librerías que necesitan React en init
- `query-vendor` - @tanstack/react-query
- `router-vendor` - wouter
- `animation-vendor` - framer-motion
- `tools` - Herramientas pesadas (lazy loaded)
- `common-components` - Componentes comunes

**Archivo:** `vite.config.ts` (manualChunks configuration)

### Service Worker Versioning

**Versión actual:** v5  
**Archivo:** `client/public/sw.js`

**Estrategia de caché:**
- **Network First** para JS/CSS chunks (evita ChunkLoadError)
- **Cache First** para assets estáticos (imágenes, fuentes)
- **Network First** para HTML y API

**Incrementar versión:** Después de cambios importantes en SW, incrementar `SW_VERSION` en `sw.js` para invalidar caches antiguos.

---

## Architecture

### Stack Tecnológico

**Frontend:**
- React 19.2.0 con TypeScript
- Vite 7.1.9 para build
- Wouter para routing
- React Query para estado servidor
- Tailwind CSS 4.1.14
- Radix UI para componentes

**Backend:**
- Node.js 20+ con Express
- PostgreSQL con Drizzle ORM
- TypeScript en todo el stack
- JWT para autenticación

**Infraestructura:**
- Docker + Docker Compose
- GitHub Actions para CI/CD
- Webhook para despliegue automático

### API Structure

**Endpoints principales:**
- `/api/prompts` - CRUD de prompts
- `/api/snippets` - CRUD de snippets
- `/api/links` - CRUD de links
- `/api/guides` - CRUD de guides
- `/api/auth` - Autenticación
- `/api/admin` - Administración
- `/api/analytics` - Analytics
- `/api/docs` - Documentación Markdown
- `/api/stats` - Estadísticas (endpoint optimizado)
- `/api/health` - Health check

**Optimizaciones:**
- Endpoint `/api/stats` usa `COUNT(*)` queries en lugar de cargar datos completos
- Rate limiting configurado (300 requests/15min para `/api/analytics/view`)
- Validación con Zod en todas las rutas

### Base de Datos

**Configuración:**
- PostgreSQL 16 (Docker)
- Drizzle ORM para queries
- Migraciones con drizzle-kit

**Variables de entorno:**
- `DATABASE_URL=postgresql://codekit_user:codekit_password@postgres:5432/codekit_pro`
- Fallback a MemStorage si DATABASE_URL no está configurado (no recomendado en producción)

### PWA Configuration

**Service Worker:**
- Versión: v5
- Estrategia: Network First para chunks, Cache First para assets
- Auto-activación con `skipWaiting()` y `clients.claim()`

**Manifest:**
- Íconos: 192x192, 512x512
- Instalación: Prompt personalizado (`PWAInstallPrompt` component)

---

## Features

### Implementadas (95% completo)

**Frontend:**
- 18 páginas principales funcionando
- 26 herramientas de desarrollo
- Sistema de autenticación completo
- CRUD para prompts, snippets, links, guides
- Búsqueda y filtros
- Exportar/Importar datos
- Sistema de favoritos
- Analytics y tracking

**Backend:**
- 21 rutas API funcionando
- Autenticación JWT
- Validación con Zod
- Rate limiting
- Security headers (CSP, CORS, Helmet)
- Inicialización automática de datos

**Móvil:**
- 9 componentes móviles creados
- 17 páginas con versión móvil optimizada
- PWA funcionando con offline support
- Gestos táctiles y UX móvil optimizada

### Pendientes

**Nuevas Herramientas (8 herramientas):**
1. Code Cleaner - Analizador de código muerto
2. Dependency Analyzer - Analizador de dependencias
3. Environment Variables Validator
4. Log Cleaner - Limpiador de console.log
5. Bundle Size Analyzer
6. Security Headers Validator
7. Performance Budget Checker
8. Accessibility Checker

**CI/CD Avanzado:**
- Staging environment
- Canary deployments (10% → 50% → 100%)
- Blue-Green deployment
- Feature flags system
- Dashboard de métricas

**Testing:**
- Actualmente: Solo tests unitarios básicos
- Pendiente: Tests de integración y E2E

---

## Pending / TODO

### Alta Prioridad

1. **Testing**
   - Implementar tests de integración
   - Implementar tests E2E
   - Aumentar cobertura de tests unitarios
   - **Tiempo estimado:** 8-10 horas

### Media Prioridad

2. **Nuevas Herramientas**
   - Code Cleaner (4-5 horas)
   - Dependency Analyzer (4-5 horas)
   - Environment Variables Validator (2-3 horas)
   - Log Cleaner (2-3 horas)
   - **Tiempo estimado total:** ~30-35 horas

3. **Mejoras a Herramientas Existentes**
   - Readme Generator Pro (2-3 horas)
   - JSON Formatter & Validator (2-3 horas)
   - API Tester Pro (3-4 horas)
   - **Tiempo estimado total:** 7-10 horas

### Baja Prioridad (Opcional)

4. **CI/CD Avanzado Opcional**
   - ✅ Staging environment (COMPLETADO - ver `docker-compose.staging.yml`)
   - Canary deployments (requiere load balancer)
   - Blue-Green deployment (requiere infraestructura adicional)
   - Feature flags system (requiere servicio externo)

5. **Mejoras de Documentación**
   - Completar guías de usuario
   - Documentar APIs internas

---

## Technical Notes

### Variables de Entorno Cliente

**Frontend:**
- `VITE_API_URL` - URL de la API (opcional, usa URL relativa si no está definido)
- Fallback implementado en `client/src/lib/constants.ts`

**Backend:**
- Ver `server/config/env.ts` para validación completa
- Variables principales: `DATABASE_URL`, `JWT_SECRET`, `ADMIN_PASSWORD`, `PORT`

### Despliegue

**Opción recomendada:** Docker Compose (ya configurado)

**Comando rápido:**
```bash
cd /var/www/codekit-pro && git pull origin main && docker compose down && docker compose build --no-cache app && docker compose up -d && sleep 15 && docker compose ps && curl http://localhost:8604/api/health
```

**Instalación limpia:**
- Ver `INSTALACION_LIMPIA_COMPLETA.md` para procedimiento completo
- Script disponible: `scripts/instalacion-limpia.sh`

**Staging environment:**
- Archivo: `docker-compose.staging.yml`
- Puerto: 8605 (producción usa 8604)
- Base de datos separada: `codekit_pro_staging`

**Comandos útiles:**
- Ver logs: `docker compose logs -f app`
- Reiniciar: `docker compose restart app`
- Health check: `curl http://localhost:8604/api/health`

### Errores Resueltos

**React Error #31:**
- Resuelto: Validación estricta en `createAdaptivePage` y `createSafeLazy`
- Protecciones añadidas en ErrorBoundary y App.tsx

**Bucle infinito de renderizado:**
- Resuelto: Sistema global de reload con sessionStorage
- ErrorBoundary mejorado con detención de renderizado

**ChunkLoadError:**
- Resuelto: Service Worker con Network First para chunks
- Versionado del SW para invalidar caches antiguos

**"Actualización disponible" en bucle:**
- Resuelto: Incrementar `SW_VERSION` en `sw.js`
- Limpieza de caches en activate event

### Optimizaciones Implementadas

**Rendimiento:**
- Endpoint `/api/stats` optimizado (COUNT queries)
- Code splitting agresivo
- Lazy loading de herramientas pesadas
- Service Worker con estrategias de caché optimizadas

**Móvil:**
- Páginas móviles separadas para mejor rendimiento
- Componentes móviles optimizados
- Gestos táctiles y feedback háptico

---

## Repository Information

**URL:** https://github.com/planetazuzu/codekit-pro.git  
**Rama principal:** main  
**Puerto producción:** 8604  
**Health endpoint:** `/api/health`

---

**Notas:** Este documento consolida información técnica útil del proyecto. Para documentación de usuario, ver `docs/public/`. Para documentación técnica detallada, ver `docs/internal/`.
