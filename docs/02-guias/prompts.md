# Guía de Prompts

## ¿Qué es un Prompt?

Un prompt es una instrucción o plantilla de texto diseñada para interactuar con modelos de IA de programación. Un buen prompt puede ahorrarte horas de trabajo.

## Estructura de un Prompt Efectivo

### Componentes Clave

1. **Contexto**: Situación o problema a resolver
2. **Instrucción**: Qué debe hacer la IA
3. **Formato**: Cómo debe presentar la respuesta
4. **Ejemplos**: Casos de uso o ejemplos (opcional)

### Ejemplo de Prompt Estructurado

```
Actúa como un desarrollador senior especializado en React.

Contexto:
Tengo un componente que renderiza una lista de usuarios.

Tarea:
Optimiza este componente para mejor rendimiento usando:
- React.memo donde sea apropiado
- useMemo para cálculos costosos
- useCallback para funciones pasadas como props

Formato:
- Explica cada optimización
- Muestra el código antes y después
- Justifica por qué cada cambio mejora el rendimiento
```

## Cuándo Crear un Prompt

✅ **Crea un prompt cuando:**
- Realizas una tarea repetitiva con IA
- Necesitas resultados consistentes
- Quieres compartir instrucciones con tu equipo
- Una tarea requiere contexto específico

❌ **No necesitas prompt cuando:**
- La tarea es única y no se repetirá
- Puedes explicarlo en una frase simple
- Ya existe un prompt similar que puedes adaptar

## Categorías Recomendadas

- **Desarrollo**: Refactor, optimización, debugging
- **Testing**: Generación de tests, casos de prueba
- **Diseño**: UI/UX, componentes, estilos
- **Documentación**: READMEs, comentarios, guías
- **Arquitectura**: Estructura, patrones, decisiones

## Mejores Prácticas

### 1. Sé Específico
❌ "Mejora este código"
✅ "Refactoriza esta función para reducir complejidad ciclomática, extrae funciones auxiliares y mejora el nombrado"

### 2. Proporciona Contexto
Incluye información relevante:
- Stack tecnológico
- Restricciones del proyecto
- Estilo de código preferido

### 3. Define el Formato
Especifica cómo quieres la respuesta:
- Código completo o solo cambios
- Incluir explicaciones o solo código
- Formato de salida (TypeScript, JavaScript, etc.)

### 4. Usa Ejemplos
Si es posible, incluye ejemplos de:
- Input esperado
- Output deseado
- Casos edge

## Organización

### Tags Útiles
- `react`, `typescript`, `node`, `testing`
- `refactor`, `optimization`, `bug-fix`
- `beginner`, `advanced`, `production`

### Títulos Descriptivos
❌ "Prompt 1"
✅ "Refactorizar Componente React con Hooks"

## Siguiente Paso

[Ver Guía de Herramientas](./herramientas.md)

