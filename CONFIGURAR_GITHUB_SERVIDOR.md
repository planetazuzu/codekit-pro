# 🔗 Configurar Sincronización con GitHub en el Servidor

## 📋 Pasos Rápidos

### 1. Crear Repositorio en GitHub

1. Ve a https://github.com/new
2. Nombre: `codekit-pro-data` (o el que prefieras)
3. Descripción: `Datos de CodeKit Pro`
4. Visibilidad: **Público** ✅
5. Click en "Create repository"

### 2. Crear Token de GitHub

1. Ve a: https://github.com/settings/tokens
2. Click en "Generate new token (classic)"
3. **Note**: `CodeKit Pro Sync`
4. **Expiration**: Elige duración (90 días o sin expiración)
5. **Select scopes**:
   - ✅ `public_repo` (si el repo es público)
   - ✅ `repo` (si el repo es privado)
6. Click en "Generate token"
7. **⚠️ COPIA EL TOKEN** (solo se muestra una vez)

### 3. Configurar en el Servidor

Ejecuta estos comandos en el servidor:

```bash
cd /var/www/codekit-pro

# Editar archivo .env
nano .env
# O usar vi: vi .env
```

Agrega estas líneas al archivo `.env`:

```bash
# GitHub Sync Configuration
GITHUB_TOKEN=ghp_tu_token_aqui
GITHUB_REPO_OWNER=planetazuzu
GITHUB_REPO_NAME=codekit-pro-data
GITHUB_SYNC_ENABLED=true
```

**Reemplaza:**
- `ghp_tu_token_aqui` → Tu token de GitHub
- `planetazuzu` → Tu usuario de GitHub
- `codekit-pro-data` → El nombre de tu repositorio

### 4. Reiniciar el Servidor

```bash
# Reiniciar contenedor para cargar nuevas variables
docker compose restart app

# Verificar que se cargaron correctamente
docker compose exec app printenv | grep GITHUB
```

### 5. Verificar Configuración

1. **Accede al panel Admin**:
   - Ve a: `https://codekitpro.app/admin`
   - Ingresa tu contraseña de admin
   - Busca la pestaña **"GitHub Sync"**

2. **Verifica el estado**:
   - Deberías ver: ✅ **Configurado**
   - Repositorio: `tu_usuario/codekit-pro-data`

## 🚀 Usar la Sincronización

### Enviar Datos a GitHub (Backup)

1. En el panel Admin > GitHub Sync
2. Click en **"Enviar Todo"** o el tipo específico:
   - "Enviar Prompts"
   - "Enviar Snippets"
   - "Enviar Links"
   - "Enviar Guides"
3. Espera a que termine
4. Ve a GitHub y verifica que los archivos se crearon

### Sincronizar desde GitHub

1. En el panel Admin > GitHub Sync
2. Click en **"Sincronizar Todo"** o el tipo específico
3. Los datos de GitHub se importarán a la aplicación

## 📁 Estructura en GitHub

Los datos se guardan así:

```
codekit-pro-data/
├── prompts/
│   ├── Desarrollo.json
│   ├── Testing.json
│   └── ...
├── snippets/
│   ├── typescript.json
│   ├── javascript.json
│   └── ...
├── links/
│   ├── Hosting.json
│   ├── Tools.json
│   └── ...
└── guides/
    ├── manual.json
    ├── ui.json
    └── ...
```

## 🔍 Verificar que Funciona

```bash
# Verificar variables de entorno
docker compose exec app printenv | grep GITHUB

# Verificar estado desde la API
curl -s http://localhost:8604/api/admin/github/status
# (Requiere autenticación admin)
```

## ⚠️ Solución de Problemas

### Error: "GitHub sync not configured"

- Verifica que todas las variables estén en `.env`
- Reinicia el contenedor: `docker compose restart app`
- Verifica que no haya espacios extra en las variables

### Error: "401 Unauthorized"

- El token es inválido o expiró
- Genera un nuevo token y actualiza `GITHUB_TOKEN`

### Error: "404 Not Found"

- Verifica que `GITHUB_REPO_OWNER` sea correcto
- Verifica que `GITHUB_REPO_NAME` sea correcto
- Asegúrate de que el repositorio exista

## 💡 Ventajas

- ✅ **Backup automático** de tus datos
- ✅ **Versionado** con Git
- ✅ **Colaboración** - otros pueden contribuir
- ✅ **Sincronización bidireccional**
- ✅ **Acceso desde cualquier lugar**

---

**Nota**: El panel Admin está en `/admin` y requiere la contraseña configurada en `ADMIN_PASSWORD`.

