# Arquitectura General

## Visión de Alto Nivel

CodeKit Pro sigue una arquitectura **monorepo full-stack** con separación clara entre cliente y servidor.

```
┌─────────────────┐
│   Frontend      │  React + Vite + TypeScript
│   (Cliente)     │  UI Components + State Management
└────────┬────────┘
         │ HTTP/REST
┌────────▼────────┐
│   Backend       │  Node.js + Express + TypeScript
│   (Servidor)    │  API Routes + Business Logic
└────────┬────────┘
         │
┌────────▼────────┐
│   Base de       │  PostgreSQL
│   Datos         │  Drizzle ORM
└─────────────────┘
```

## Principios de Diseño

### 1. Separación de Responsabilidades

- **Frontend**: Presentación, interacción, validación de UI
- **Backend**: Lógica de negocio, validación de datos, persistencia
- **Base de Datos**: Almacenamiento y relaciones

### 2. Type Safety

TypeScript en todo el stack para:
- Detectar errores en tiempo de compilación
- Mejorar autocompletado
- Documentar interfaces implícitamente

### 3. Escalabilidad

- **Modular**: Componentes y módulos independientes
- **Extensible**: Fácil añadir nuevas funcionalidades
- **Mantenible**: Código organizado y documentado

## Decisiones Clave

### ¿Por qué Monorepo?

✅ **Ventajas:**
- Compartir tipos entre frontend y backend
- Un solo repositorio para mantener
- Deploy coordinado de cambios

❌ **Desventajas:**
- Repositorio más grande
- Builds más lentos (mitigado con lazy loading)

### ¿Por qué PostgreSQL?

✅ **Ventajas:**
- Relacional cuando se necesita
- JSONB para datos flexibles
- Maduro y confiable
- Buen rendimiento

❌ **Alternativas consideradas:**
- SQLite: Demasiado simple para producción
- MongoDB: No necesitamos NoSQL puro

### ¿Por qué React + Vite?

✅ **Ventajas:**
- React: Ecosistema maduro, componentes reutilizables
- Vite: Build rápido, HMR excelente
- TypeScript: Type safety en frontend

## Flujo de Datos

```
Usuario → Frontend → API Request → Backend → Base de Datos
                ← Response ←          ← Query Result
```

### Ejemplo: Crear un Prompt

1. Usuario completa formulario en Frontend
2. Frontend valida datos localmente
3. Frontend envía POST `/api/prompts`
4. Backend valida datos con Zod
5. Backend guarda en PostgreSQL
6. Backend responde con prompt creado
7. Frontend actualiza UI con React Query

## Siguiente

[Ver Stack Tecnológico](./stack-tecnologico.md)

