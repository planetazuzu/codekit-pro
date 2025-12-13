# 🚀 PROMPT LISTO PARA USAR - Crear Proyecto de Datos GitHub

Copia y pega este prompt completo en ChatGPT/Claude para crear el proyecto:

---

```
Crea un repositorio GitHub público llamado "codekit-pro-data" con estructura básica y README completo.

OBJETIVO: Repositorio público con datos estructurados (prompts, snippets, tools, links, guides) para CodeKit Pro, una aplicación de herramientas para desarrolladores.

## ESTRUCTURA REQUERIDA:

```
codekit-pro-data/
├── README.md
├── prompts/
│   ├── frontend.json
│   ├── backend.json
│   ├── ai-assistant.json
│   ├── testing.json
│   └── devops.json
├── snippets/
│   ├── react.json
│   ├── nodejs.json
│   ├── typescript.json
│   └── utilities.json
├── tools/
│   ├── scripts.json
│   └── generators.json
├── links/
│   ├── hosting.json
│   ├── apis.json
│   └── tools.json
└── guides/
    ├── tutorials.json
    └── best-practices.json
```

## FORMATO JSON REQUERIDO:

### Para PROMPTS (prompts/*.json):
```json
{
  "category": "Frontend",
  "items": [
    {
      "title": "Título del prompt",
      "category": "Desarrollo",
      "content": "Contenido completo del prompt...",
      "tags": ["tag1", "tag2"],
      "difficulty": "beginner|intermediate|advanced",
      "language": "es"
    }
  ]
}
```

### Para SNIPPETS (snippets/*.json):
```json
{
  "category": "React",
  "items": [
    {
      "title": "Nombre del snippet",
      "language": "typescript",
      "code": "código completo aquí...",
      "description": "Descripción del snippet",
      "tags": ["react", "hook"],
      "difficulty": "beginner",
      "language": "es"
    }
  ]
}
```

### Para TOOLS/SCRIPTS (tools/*.json):
```json
{
  "category": "Scripts",
  "items": [
    {
      "title": "Nombre del script",
      "type": "bash|node|python",
      "code": "código del script...",
      "description": "Descripción",
      "tags": ["bash", "automation"],
      "difficulty": "intermediate",
      "language": "es"
    }
  ]
}
```

### Para LINKS (links/*.json):
```json
{
  "category": "Hosting",
  "items": [
    {
      "title": "Nombre del servicio",
      "url": "https://ejemplo.com",
      "icon": "Cloud",
      "category": "VPS",
      "description": "Descripción del servicio",
      "tags": ["hosting", "vps"],
      "affiliate": true
    }
  ]
}
```

### Para GUIDES (guides/*.json):
```json
{
  "category": "Tutorials",
  "items": [
    {
      "title": "Título de la guía",
      "description": "Descripción breve",
      "content": "Contenido completo en markdown...",
      "type": "manual",
      "tags": ["tutorial", "guide"],
      "difficulty": "beginner",
      "language": "es"
    }
  ]
}
```

## README.md DEBE INCLUIR:

- Título y descripción clara del proyecto
- Estructura de carpetas explicada
- Formato de datos documentado con ejemplos
- Cómo usar los datos
- Cómo contribuir
- Licencia MIT
- Badges (opcional pero recomendado)

El README debe ser profesional, claro y completo.

## ESTÁNDARES:

- Todos los JSON deben ser válidos
- Idioma principal: Español (es)
- Tags consistentes y útiles
- Descripciones claras
- Formato consistente en todos los archivos

## ENTREGABLES:

1. ✅ Estructura completa de carpetas (vacías por ahora, solo estructura)
2. ✅ README.md profesional y completo
3. ✅ Archivos .gitkeep en carpetas vacías para mantener estructura
4. ✅ Ejemplos de formato JSON en el README

## IMPORTANTE:

- Por ahora solo crear la ESTRUCTURA y el README
- No necesitas crear datos iniciales todavía
- El README debe explicar claramente cómo se usarán los datos
- Incluir ejemplos de formato JSON en el README

Crea el repositorio con estructura y README completo siguiendo estas especificaciones.
```

---

## 📝 INSTRUCCIONES DE USO

1. **Copia el prompt completo** (desde "Crea un repositorio..." hasta "...estas especificaciones")
2. **Pégalo en ChatGPT/Claude**
3. **El AI creará**:
   - ✅ Estructura completa de carpetas
   - ✅ README.md profesional y completo
   - ✅ Archivos .gitkeep en carpetas vacías
   - ✅ Ejemplos de formato JSON en el README
   - ✅ Todo listo para subir a GitHub

## 📋 LO QUE SE CREARÁ

- **Estructura de carpetas**: prompts/, snippets/, tools/, links/, guides/
- **README.md**: Documentación completa con ejemplos
- **Archivos .gitkeep**: Para mantener las carpetas en Git
- **Sin datos iniciales**: Solo estructura y documentación

## 🔄 DESPUÉS DE CREAR EL PROYECTO

Una vez que tengas el repositorio creado en GitHub:

1. **Añadir datos**: Podrás ir añadiendo prompts, snippets, etc. siguiendo el formato del README
2. **Script de importación**: Prepararé un script en CodeKit Pro para leer los datos desde GitHub
3. **Sincronización**: Podrás actualizar datos en GitHub y sincronizarlos con la app

¿Quieres que prepare también el script de importación para cuando tengas datos en GitHub?

