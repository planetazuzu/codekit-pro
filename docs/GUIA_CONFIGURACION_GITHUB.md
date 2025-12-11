# 🚀 Guía Completa: Configurar Sincronización con GitHub

Esta guía te ayudará a configurar paso a paso la sincronización bidireccional con GitHub.

## 📋 Paso 1: Crear el Repositorio GitHub

### Opción A: Usar el Prompt (Recomendado)

1. **Abre el archivo** `docs/PROMPT_LISTO_USAR.md`
2. **Copia todo el contenido** del prompt (desde "Crea un repositorio..." hasta "...estas especificaciones")
3. **Pégalo en ChatGPT o Claude**
4. **El AI creará**:
   - ✅ Estructura completa de carpetas
   - ✅ README.md profesional
   - ✅ Archivos .gitkeep en carpetas vacías
   - ✅ Ejemplos de formato JSON

### Opción B: Crear Manualmente

1. Ve a [GitHub](https://github.com/new)
2. Nombre del repositorio: `codekit-pro-data`
3. Descripción: `Datos estructurados para CodeKit Pro - Prompts, snippets, links y guides`
4. Visibilidad: **Público** ✅
5. **NO** marques "Add a README file" (el prompt lo creará mejor)
6. Click en "Create repository"

Luego crea manualmente estas carpetas:
```
codekit-pro-data/
├── prompts/
├── snippets/
├── links/
├── guides/
└── README.md
```

## 🔑 Paso 2: Crear Token de GitHub

1. **Ve a GitHub Settings**:
   - Click en tu avatar (esquina superior derecha)
   - Click en "Settings"
   - En el menú lateral izquierdo: "Developer settings"
   - Click en "Personal access tokens"
   - Click en "Tokens (classic)"

2. **Generar nuevo token**:
   - Click en "Generate new token (classic)"
   - **Note**: `CodeKit Pro Sync`
   - **Expiration**: Elige una duración (recomendado: 90 días o "No expiration" si confías)
   - **Select scopes**:
     - ✅ `public_repo` (Access public repositories)
     - Si el repo es privado, también: ✅ `repo` (Full control of private repositories)

3. **Generar y copiar**:
   - Click en "Generate token" (abajo)
   - **⚠️ IMPORTANTE**: Copia el token inmediatamente (solo se muestra una vez)
   - Guárdalo en un lugar seguro

## ⚙️ Paso 3: Configurar Variables de Entorno

1. **Copia el archivo de ejemplo**:
   ```bash
   cp .env.example .env
   ```

2. **Edita el archivo `.env`** y completa estas variables:

   ```bash
   # GitHub Sync Configuration
   GITHUB_TOKEN=ghp_tu_token_aqui
   GITHUB_REPO_OWNER=tu_usuario_github
   GITHUB_REPO_NAME=codekit-pro-data
   GITHUB_SYNC_ENABLED=true
   ```

   **Ejemplo real**:
   ```bash
   GITHUB_TOKEN=ghp_1234567890abcdefghijklmnopqrstuvwxyz
   GITHUB_REPO_OWNER=planetazuzu
   GITHUB_REPO_NAME=codekit-pro-data
   GITHUB_SYNC_ENABLED=true
   ```

## ✅ Paso 4: Verificar Configuración

1. **Inicia el servidor**:
   ```bash
   npm run dev
   ```

2. **Accede al panel Admin**:
   - Ve a `http://localhost:8604/admin`
   - Ingresa tu contraseña de admin
   - Click en la pestaña **"GitHub Sync"**

3. **Verifica el estado**:
   - Deberías ver: ✅ **Configurado**
   - Repositorio: `tu_usuario/codekit-pro-data`
   - Si ves errores, revisa las variables de entorno

## 🧪 Paso 5: Probar Sincronización

### Primera Sincronización (GitHub → App)

Si ya tienes datos en GitHub:

1. En el panel Admin > GitHub Sync
2. Click en **"Sincronizar Todo"** o el tipo específico
3. Espera a que termine
4. Verifica que los datos aparezcan en la app

### Primera Exportación (App → GitHub)

Si quieres enviar tus datos actuales a GitHub:

1. En el panel Admin > GitHub Sync
2. Click en **"Enviar Todo"** o el tipo específico
3. Espera a que termine
4. Ve a GitHub y verifica que los archivos se hayan creado

## 📝 Paso 6: Estructura de Archivos JSON

### Formato para Prompts (`prompts/categoria.json`)

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

### Formato para Snippets (`snippets/lenguaje.json`)

```json
{
  "category": "TypeScript",
  "description": "Snippets de TypeScript",
  "items": [
    {
      "title": "Custom Hook: useFetch",
      "language": "typescript",
      "code": "export function useFetch<T>(url: string) { ... }",
      "description": "Hook para hacer fetch de datos",
      "tags": ["react", "hook"]
    }
  ]
}
```

### Formato para Links (`links/categoria.json`)

```json
{
  "category": "Hosting",
  "description": "Servicios de hosting",
  "items": [
    {
      "title": "Vercel",
      "url": "https://vercel.com",
      "icon": "Cloud",
      "category": "Hosting",
      "description": "Plataforma de hosting para aplicaciones web"
    }
  ]
}
```

### Formato para Guides (`guides/tipo.json`)

```json
{
  "category": "Manual",
  "description": "Guías manuales",
  "items": [
    {
      "title": "Guía de React Hooks",
      "description": "Aprende a usar React Hooks",
      "content": "# Guía completa de React Hooks\n\n...",
      "type": "manual",
      "tags": ["react", "hooks"]
    }
  ]
}
```

## 🔍 Verificación Rápida

Ejecuta este comando para verificar que las variables estén configuradas:

```bash
# Verificar variables de GitHub
grep GITHUB .env
```

Deberías ver:
```
GITHUB_TOKEN=ghp_...
GITHUB_REPO_OWNER=tu_usuario
GITHUB_REPO_NAME=codekit-pro-data
GITHUB_SYNC_ENABLED=true
```

## 🐛 Solución de Problemas

### Error: "GitHub sync not configured"

- ✅ Verifica que todas las variables estén en `.env`
- ✅ Reinicia el servidor después de cambiar `.env`
- ✅ Verifica que no haya espacios extra en las variables

### Error: "GitHub API error: 401"

- ✅ El token es inválido o expiró
- ✅ Genera un nuevo token y actualiza `GITHUB_TOKEN`
- ✅ Verifica que el token tenga el scope `public_repo`

### Error: "GitHub API error: 404"

- ✅ Verifica que `GITHUB_REPO_OWNER` sea tu usuario correcto
- ✅ Verifica que `GITHUB_REPO_NAME` sea `codekit-pro-data`
- ✅ Asegúrate de que el repositorio exista y sea público

### Error: "GitHub API error: 403"

- ✅ El token no tiene permisos suficientes
- ✅ Verifica que tenga el scope `public_repo`
- ✅ Si el repo es privado, necesita `repo`

## 📚 Próximos Pasos

Una vez configurado:

1. **Añade datos a GitHub**: Crea archivos JSON siguiendo el formato
2. **Sincroniza**: Usa el panel Admin para sincronizar
3. **Mantén actualizado**: Sincroniza regularmente para mantener los datos actualizados

## 💡 Tips

- **Backup**: Los datos en GitHub sirven como backup
- **Colaboración**: Otros pueden contribuir al repositorio
- **Versionado**: Git mantiene historial de cambios
- **Sincronización manual**: Por ahora es manual, pero puedes automatizarla después

---

¿Necesitas ayuda con algún paso específico? Revisa `docs/GITHUB_SYNC.md` para más detalles técnicos.

