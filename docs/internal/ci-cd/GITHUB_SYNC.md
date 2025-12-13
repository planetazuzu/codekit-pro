# 🔄 Sincronización con GitHub

Sistema de sincronización bidireccional entre CodeKit Pro y un repositorio GitHub público para almacenar y compartir prompts, snippets, links y guides.

## 📋 Configuración

### Variables de Entorno

Agrega las siguientes variables a tu archivo `.env`:

```bash
# GitHub Sync Configuration
GITHUB_TOKEN=tu_token_de_github
GITHUB_REPO_OWNER=tu_usuario_o_organizacion
GITHUB_REPO_NAME=codekit-pro-data
GITHUB_SYNC_ENABLED=true
```

### Crear Token de GitHub

1. Ve a [GitHub Settings > Developer settings > Personal access tokens > Tokens (classic)](https://github.com/settings/tokens)
2. Click en "Generate new token (classic)"
3. Nombre: `CodeKit Pro Sync`
4. Permisos necesarios:
   - `repo` (Full control of private repositories) - si el repo es privado
   - `public_repo` (Access public repositories) - si el repo es público
5. Genera y copia el token

### Estructura del Repositorio

El repositorio debe tener la siguiente estructura:

```
codekit-pro-data/
├── prompts/
│   ├── react.json
│   ├── javascript.json
│   └── ...
├── snippets/
│   ├── typescript.json
│   ├── python.json
│   └── ...
├── links/
│   ├── tools.json
│   ├── resources.json
│   └── ...
├── guides/
│   ├── manual.json
│   ├── template.json
│   └── ...
└── README.md
```

### Formato de Archivos JSON

Cada archivo JSON debe seguir este formato:

```json
{
  "category": "Nombre de la categoría",
  "description": "Descripción de la categoría",
  "items": [
    {
      "title": "Título del item",
      "category": "Categoría",
      "content": "Contenido...",
      "tags": ["tag1", "tag2"]
    }
  ]
}
```

**Ejemplo para prompts:**
```json
{
  "category": "React",
  "description": "Prompts de React",
  "items": [
    {
      "title": "Experto en React Performance",
      "category": "React",
      "content": "Eres un experto en optimización de React...",
      "tags": ["react", "performance"]
    }
  ]
}
```

**Ejemplo para snippets:**
```json
{
  "category": "TypeScript",
  "description": "Snippets de TypeScript",
  "items": [
    {
      "title": "Custom Hook: useFetch",
      "language": "typescript",
      "code": "export function useFetch...",
      "description": "Hook para hacer fetch de datos",
      "tags": ["react", "hook"]
    }
  ]
}
```

## 🚀 Uso

### Desde el Panel de Administración

1. Accede al panel de administración (`/admin`)
2. Ve a la pestaña "GitHub Sync"
3. Verifica el estado de configuración
4. Usa los botones para sincronizar:

   - **Sincronizar desde GitHub**: Descarga contenido desde el repositorio
   - **Enviar a GitHub**: Sube contenido al repositorio
   - Botones individuales por tipo: `prompts`, `snippets`, `links`, `guides`

### Desde la API

#### Obtener Estado

```bash
GET /api/admin/github/status
```

#### Sincronizar Todo desde GitHub

```bash
POST /api/admin/github/sync
```

#### Enviar Todo a GitHub

```bash
POST /api/admin/github/push
```

#### Sincronizar Tipo Específico

```bash
POST /api/admin/github/sync/:type
# type: prompts | snippets | links | guides
```

#### Enviar Tipo Específico

```bash
POST /api/admin/github/push/:type
# type: prompts | snippets | links | guides
```

## 🔄 Flujo de Sincronización

### Sincronización desde GitHub (GitHub → App)

1. Lee todos los archivos JSON del directorio correspondiente
2. Parsea cada archivo y extrae los items
3. Para cada item:
   - Si existe (mismo título + categoría): **actualiza**
   - Si no existe: **crea nuevo**
4. Los items sincronizados se asignan al usuario "system"
5. Estado automático: `approved` (porque es del usuario sistema)

### Envío a GitHub (App → GitHub)

1. Obtiene todos los items de la base de datos
2. Los agrupa por categoría (o lenguaje/tipo)
3. Crea/actualiza archivos JSON en GitHub
4. Un archivo por categoría
5. Usa el SHA del archivo para actualizaciones (evita conflictos)

## ⚠️ Consideraciones

### Conflictos

- El sistema usa SHA para detectar cambios en GitHub
- Si un archivo cambia entre lectura y escritura, GitHub rechazará la actualización
- En ese caso, sincroniza primero desde GitHub antes de enviar

### Límites de GitHub API

- **Rate Limit**: 5,000 requests/hora para tokens autenticados
- Cada sincronización completa hace ~10-20 requests
- El sistema incluye rate limiting en los endpoints

### Usuario Sistema

- Todo el contenido sincronizado se asigna al usuario "system"
- Este usuario se crea automáticamente si no existe
- Email: `system@codekit.pro`
- El contenido del sistema siempre tiene estado `approved`

## 🐛 Troubleshooting

### Error: "GitHub sync not configured"

- Verifica que todas las variables de entorno estén configuradas
- Revisa que el token tenga los permisos correctos
- Asegúrate de que el repositorio exista y sea accesible

### Error: "GitHub API error: 404"

- Verifica que `GITHUB_REPO_OWNER` y `GITHUB_REPO_NAME` sean correctos
- Asegúrate de que el repositorio exista
- Verifica los permisos del token

### Error: "GitHub API error: 401"

- El token es inválido o expiró
- Genera un nuevo token y actualiza `GITHUB_TOKEN`

### Error: "GitHub API error: 403"

- El token no tiene los permisos necesarios
- Verifica que tenga acceso al repositorio
- Si es privado, necesita permiso `repo`

### Contenido no se sincroniza

- Verifica que los archivos JSON tengan el formato correcto
- Revisa los logs del servidor para ver errores específicos
- Asegúrate de que los items tengan los campos requeridos

## 📝 Notas

- La sincronización es **manual** por ahora (no automática)
- Los archivos se agrupan por categoría automáticamente
- El sistema detecta duplicados por título + categoría/lenguaje/tipo
- Los tags se preservan durante la sincronización

