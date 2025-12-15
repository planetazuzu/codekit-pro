# 🎯 Prompts Útiles para Desarrollo

Colección de prompts efectivos usados en este proyecto y sugerencias adicionales.

---

## 📋 Prompts Usados en Este Proyecto

### 🔧 Debugging y Análisis

#### 1. Análisis Completo de Errores Críticos
```
Actúa como un desarrollador senior full-stack especializado en React / Next.js / PWAs, 
debugging avanzado y refactorización de código en producción. 

OBJETIVO PRINCIPAL: Tengo una app que presenta fallos, especialmente en la versión móvil.

PROBLEMA CRÍTICO:
- En móvil, la página de inicio no termina de cargar
- Se queda en estado de "pensando / loading"
- El resto de páginas funcionan
- En desktop el problema no siempre aparece

QUIERO QUE HAGAS ESTO EN ORDEN:
1️⃣ ANÁLISIS GLOBAL DEL PROYECTO
- Revisa la estructura de carpetas
- Detecta archivos muertos, duplicados o sin uso
- Señala componentes demasiado grandes o con múltiples responsabilidades
- Detecta lógica repetida que debería abstraerse

2️⃣ DEBUG PROFUNDO DE LA HOME (FOCO MÓVIL)
Analiza en detalle el componente de la página de inicio y sus dependencias:
- useEffect / useLayoutEffect problemáticos
- Estados que no se resuelven
- Bucles de render
- Fetchs que no terminan o fallan en móvil
- Condiciones de render incorrectas
- Diferencias mobile / desktop
- Uso inseguro de window, document, navigator
- Suspense / lazy mal usados

Indica exactamente:
- Archivo
- Línea aproximada
- Motivo del posible bloqueo

[... continúa con limpieza, buenas prácticas, rendimiento, etc.]
```

#### 2. Análisis de Errores Específicos de PWA
```
Actúa como un ingeniero senior de Frontend especializado en React, PWA y Service Workers.

Contexto:
- La aplicación está instalada como PWA en Android
- Al abrirla aparece el error: "No se pudo cargar este componente"
- La app funciona o ha funcionado previamente en navegador
- Es posible que haya habido un redeploy reciente

Tareas:
1. Revisa el proyecto completo en busca de:
   - Errores de carga dinámica de componentes (lazy, dynamic import)
   - ChunkLoadError o referencias a archivos JS inexistentes
   - Problemas de rutas absolutas/relativas en build
   - Incompatibilidades entre Service Worker y el build actual

2. Analiza:
   - service-worker.js / registerServiceWorker
   - configuración PWA (manifest, workbox, vite-plugin-pwa, etc.)
   - configuración de build (Vite / CRA / Next)
   - imports rotos o condicionales que puedan fallar en producción

3. Busca específicamente:
   - Componentes que se cargan solo en cliente
   - Código que acceda a window, document o navigator sin comprobación
   - Variables de entorno que puedan ser undefined en producción
   - Diferencias entre modo dev y build

4. Si detectas un problema:
   - Explica EXACTAMENTE por qué ocurre
   - Indica el archivo concreto
   - Propón la solución más segura

5. Si el problema es de caché:
   - Indica cómo versionar correctamente el Service Worker
   - Indica cómo forzar actualización sin romper usuarios
```

#### 3. Fix Específico de React Error #31
```
Veo en la captura que aparece:
- "Actualización disponible" (típico de PWA/service worker)
- "Minified React error #31 ... object with keys {render, displayName} ..."

Esto SIEMPRE significa:
React intenta desmontar un nodo que ya no pertenece al árbol actual

1) Buscar estos 3 PATRONES (CTRL+F):
   - Suspense
   - lazy(
   - key=
   - isMobile ?
   - matchMedia

2) Revisar solo:
   - Layouts
   - Pages
   - Wrappers
   - Router
   - Providers

3) El caso MÁS habitual:
   ❌ {icon} o {item.icon}
   ✅ <Icon /> o <item.icon />
```

### 🏗️ Arquitectura y Organización

#### 4. Limpieza y Reorganización de Documentación
```
Actúa como un arquitecto de proyecto senior y editor técnico.

Objetivo: Limpiar y reorganizar los archivos Markdown (.md) del proyecto sin romper el frontend.

Instrucciones estrictas:
1. Analiza TODOS los archivos `.md` del proyecto, excepto `README.md`
2. Clasifica cada archivo `.md` en una de estas categorías:
   A) Documentación usada o referenciada por el frontend
   B) Documentación técnica interna útil
   C) Documentación obsoleta, duplicada, incompleta o basura

3. Regla CRÍTICA:
   - NO modificar
   - NO mover
   - NO borrar ningún archivo `.md` que pertenezca a la categoría A

4. Para los archivos de la categoría C: Elimínalos completamente

5. Para los archivos de la categoría B:
   - Extrae únicamente la información útil y vigente
   - Unifica esa información en UN SOLO archivo nuevo llamado: `PROJECT_NOTES.md`

[... continúa con estructura obligatoria]
```

#### 5. Análisis DevOps y Despliegue
```
Actúa como un ingeniero DevOps senior.

Objetivo: Determinar la forma MÁS SIMPLE y SEGURA de desplegar esta aplicación en un servidor Linux.

Tareas:
1. Analiza el proyecto completo:
   - package.json
   - Dockerfile (si existe)
   - docker-compose.yml (si existe)
   - scripts de build
   - estructura de frontend y backend

2. Responde explícitamente:
   - ¿La app necesita build (npm run build)?
   - ¿Puede ejecutarse sin Docker?
   - ¿Puede servirse como app estática?
   - ¿El backend es Node, solo API, o fullstack?
   - ¿Qué archivos son imprescindibles en producción?

3. Indica UNA opción recomendada (solo una):
   A) Docker puro
   B) Build local + Docker
   C) Build local + zip + deploy
   D) Ejecución directa con Node/PM2

4. Justifica la opción elegida en pocas líneas

5. Devuelve los comandos exactos para:
   - Borrar la instalación previa
   - Desplegar desde cero
   - Verificar que funciona
```

---

## 🚀 Prompts Adicionales Útiles

### 🐛 Debugging Específico

#### React Error Debugging
```
Tengo este error en React: [PEGAR ERROR]

Analiza:
1. Tipo de error (Runtime, Build, TypeScript, etc.)
2. Causa raíz probable
3. Archivos involucrados (basándote en stack trace)
4. Solución paso a paso
5. Cómo prevenir en el futuro

Sé específico con nombres de archivos y líneas.
```

#### Performance Debugging
```
Mi aplicación React está lenta. Analiza estos aspectos:

1. Componentes que se re-renderizan innecesariamente
2. Hooks pesados en render (calculaciones, filtros, etc.)
3. Lazy loading mal implementado
4. Bundle size (archivos grandes)
5. Imágenes no optimizadas
6. Estado global mal estructurado

Para cada problema encontrado:
- Archivo y línea aproximada
- Impacto estimado
- Solución específica
- Código antes/después
```

### 🏛️ Arquitectura

#### Code Review Profundo
```
Haz un code review completo de [ARCHIVO/CARPETA]:

1. Arquitectura:
   - ¿Sigue principios SOLID?
   - ¿Hay separación de responsabilidades?
   - ¿Los componentes son reutilizables?

2. Performance:
   - Re-renders innecesarios
   - Memoization faltante o mal usada
   - Lazy loading oportunidades

3. Best Practices:
   - Manejo de errores
   - TypeScript (tipos correctos)
   - Accesibilidad
   - Seguridad

4. Bugs potenciales:
   - Race conditions
   - Memory leaks
   - Estado inconsistente

5. Mejoras sugeridas con código concreto
```

#### Refactoring Strategy
```
Necesito refactorizar [COMPONENTE/FUNCIONALIDAD] porque:
[RAZÓN]

Propon una estrategia:
1. Análisis del código actual (problemas identificados)
2. Diseño de la solución (arquitectura propuesta)
3. Plan de migración paso a paso (sin romper funcionalidad)
4. Tests necesarios antes/durante/después
5. Código de ejemplo de cómo quedaría

Incluye:
- Qué archivos crear/modificar/eliminar
- Orden de implementación
- Cómo mantener compatibilidad durante migración
```

### 🔒 Seguridad y Calidad

#### Security Audit
```
Haz una auditoría de seguridad de [ARCHIVO/FUNCIONALIDAD]:

Busca:
1. XSS vulnerabilities (user input sin sanitizar)
2. Injection attacks (SQL, NoSQL, Command)
3. Exposición de secrets (API keys, tokens en código)
4. CSRF protection faltante
5. Authentication/Authorization issues
6. Dependencies vulnerables (package.json)
7. Headers de seguridad faltantes
8. Permisos excesivos

Para cada vulnerabilidad:
- Severidad (Critical/High/Medium/Low)
- Explotación (cómo se explota)
- Impacto
- Fix específico con código
```

#### Testing Strategy
```
Diseña una estrategia de testing para [FUNCIONALIDAD]:

Incluye:
1. Unit tests (qué funciones/procesos)
2. Integration tests (qué flujos)
3. E2E tests (qué user journeys)
4. Tests de regresión (qué no debe romperse)
5. Performance tests (si aplica)

Para cada tipo de test:
- Qué herramienta usar (Jest, Vitest, Playwright, etc.)
- Qué cubrir específicamente
- Ejemplo de test concreto
- Mock data necesario
```

### 🎨 UI/UX

#### Component Design
```
Diseña un componente [NOMBRE] que:
- [FUNCIONALIDAD 1]
- [FUNCIONALIDAD 2]
- [FUNCIONALIDAD 3]

Requisitos:
- TypeScript con tipos completos
- Responsive (mobile-first)
- Accesible (ARIA, keyboard navigation)
- Dark mode compatible
- Optimizado para performance
- Reutilizable y configurable

Proporciona:
1. Interface/Props design
2. Estructura del componente
3. Lógica de estado
4. Estilos (Tailwind preferido)
5. Ejemplo de uso
6. Variantes si aplica
```

#### Accessibility Audit
```
Audita la accesibilidad de [COMPONENTE/PÁGINA]:

Verifica:
1. ARIA labels y roles correctos
2. Keyboard navigation completa
3. Focus management (focus trap, focus visible)
4. Screen reader compatibility
5. Color contrast (WCAG AA mínimo)
6. Text alternatives (alt, aria-label)
7. Semantic HTML
8. Skip links si aplica

Para cada problema:
- Qué elemento
- Problema específico
- Impacto en usuarios
- Fix con código
```

### 📊 Performance

#### Bundle Analysis
```
Analiza el bundle de mi aplicación React/Vite:

1. Tamaño del bundle principal
2. Chunks grandes (>100KB)
3. Dependencies duplicadas
4. Libraries no usadas
5. Code splitting oportunidades
6. Tree shaking issues
7. Dynamic imports faltantes

Proporciona:
- Comando para analizar (webpack-bundle-analyzer, vite-bundle-visualizer)
- Lista ordenada por prioridad
- Soluciones específicas con código
- Impacto estimado de cada optimización
```

#### Database Query Optimization
```
Analiza estas queries de base de datos:

[PEGAR QUERIES]

Para cada query:
1. Complejidad (O notation si aplica)
2. Índices faltantes o mal usados
3. N+1 query problems
4. Joins innecesarios
5. Campos seleccionados (SELECT *)
6. Cache opportunities

Proporciona:
- Query optimizada
- Índices a crear
- Explicación de mejora
- Impacto estimado
```

### 🧪 Testing

#### Test Generation
```
Genera tests completos para [COMPONENTE/FUNCIÓN]:

Usando [Jest/Vitest/React Testing Library]:

1. Happy path tests
2. Edge cases
3. Error handling
4. User interactions
5. Async operations
6. Props variations

Incluye:
- Setup necesario
- Mocks requeridos
- Tests con código completo
- Coverage objetivo
- Ejemplos de ejecución
```

### 🔄 Migración y Actualización

#### Dependency Update Strategy
```
Necesito actualizar [LIBRERÍA] de [VERSION_ACTUAL] a [VERSION_NUEVA].

Crea un plan:
1. Breaking changes identificados
2. Cambios de código necesarios
3. Tests a actualizar
4. Orden de migración (si hay múltiples)
5. Rollback plan
6. Verificación post-update

Incluye:
- Comandos exactos
- Cambios de código específicos
- Checklist de verificación
```

#### Framework Migration
```
Planifica migración de [FRAMEWORK_ORIGEN] a [FRAMEWORK_DESTINO]:

1. Análisis de compatibilidad
2. Diferencias arquitectónicas clave
3. Componentes a reescribir vs adaptar
4. Routing changes
5. State management migration
6. Build/config changes
7. Timeline estimado
8. Estrategia incremental (si es posible)

Incluye:
- Archivos afectados
- Cambios específicos con código
- Riesgos y mitigaciones
```

---

## 💡 Tips para Usar Prompts Efectivamente

### ✅ Mejores Prácticas

1. **Sé Específico**: Incluye contexto, archivos, errores exactos
2. **Define el Rol**: "Actúa como [rol específico]" ayuda mucho
3. **Estructura Clara**: Usa números, bullets, secciones
4. **Incluye Ejemplos**: Muestra código actual cuando sea relevante
5. **Define Output Esperado**: Qué formato quieres (código, lista, análisis)

### ❌ Evitar

1. Prompts demasiado genéricos
2. Múltiples objetivos sin priorizar
3. Falta de contexto del proyecto
4. No especificar tecnologías/frameworks
5. Pedir cambios sin entender el problema primero

### 🎯 Plantilla Base

```
Actúa como [ROL ESPECÍFICO].

Contexto:
- [TECNOLOGÍAS]
- [PROBLEMA/OBJETIVO]
- [RESTRICCIONES]

Objetivo:
[QUÉ QUIERO LOGRAR]

Tareas:
1. [TAREA 1 ESPECÍFICA]
2. [TAREA 2 ESPECÍFICA]
3. [TAREA 3 ESPECÍFICA]

Formato esperado:
[QUÉ FORMATO QUIERO DEL OUTPUT]

Criterios de éxito:
[CÓMO SABRÉ QUE ESTÁ BIEN]
```

---

## 📚 Recursos Adicionales

- [Awesome ChatGPT Prompts](https://github.com/f/awesome-chatgpt-prompts)
- [Prompt Engineering Guide](https://www.promptingguide.ai/)
- [React Best Practices](https://react.dev/learn)

---

**Nota**: Estos prompts están diseñados para trabajar con modelos de lenguaje grandes (GPT-4, Claude, etc.) y requieren contexto específico del proyecto para ser más efectivos.
