# 📊 Análisis DevOps - Estrategia de Despliegue

## 🔍 Análisis del Proyecto

### 1. ¿La app necesita build (`npm run build`)?

**✅ SÍ, absolutamente necesario**

**Proceso de build:**
- Ejecuta `tsx script/build.ts`
- **Frontend:** Vite build → genera `dist/public/` (HTML, JS, CSS compilados)
- **Backend:** esbuild → genera `dist/index.cjs` (servidor Node.js compilado)
- **Output:** Todo en carpeta `dist/`

**Sin build, la app NO puede ejecutarse en producción.**

---

### 2. ¿Puede ejecutarse sin Docker?

**⚠️ TÉCNICAMENTE SÍ, pero NO RECOMENDADO**

**Sin Docker requeriría:**
- Node.js 20+ instalado
- PostgreSQL instalado y configurado
- Variables de entorno configuradas
- Build manual en el servidor
- Gestión manual de procesos (PM2 o similar)

**Con Docker:**
- Todo incluido (Node + PostgreSQL)
- Configuración aislada
- Fácil rollback
- Consistencia entre entornos

**Conclusión:** Funcional sin Docker, pero mucho más complejo y propenso a errores.

---

### 3. ¿Puede servirse como app estática?

**❌ NO**

**Razones:**
- Es **fullstack**: Backend Express + Frontend React
- Frontend es SPA que necesita APIs del backend
- Backend sirve:
  - Frontend estático desde `dist/public/`
  - APIs REST en `/api/*`
  - Documentación en `/api/docs`
- Requiere base de datos PostgreSQL
- Requiere autenticación y sesiones

**No es una app estática pura.**

---

### 4. ¿El backend es Node, solo API, o fullstack?

**✅ FULLSTACK con Node.js/Express**

**Backend sirve:**
1. **APIs REST** (`/api/prompts`, `/api/snippets`, `/api/auth`, etc.)
2. **Frontend estático** (SPA React desde `dist/public/`)
3. **Documentación** (`/api/docs` - archivos Markdown)
4. **Health check** (`/health`)

**Arquitectura:**
- Express.js como servidor único
- En producción: sirve archivos estáticos desde `dist/public/`
- En desarrollo: Vite dev server con HMR

---

### 5. ¿Qué archivos son imprescindibles en producción?

**Archivos críticos:**
```
dist/                    # Build completo (frontend + backend)
├── public/             # Frontend compilado (HTML, JS, CSS)
└── index.cjs           # Backend compilado

package.json            # Dependencias de producción
.env                    # Variables de entorno
docs/                   # Documentación (servida por /api/docs)
shared/                 # Schemas compartidos
drizzle.config.ts       # Configuración de base de datos
```

**Archivos NO necesarios:**
- `client/src/` (código fuente - ya compilado en `dist/public/`)
- `server/` (código fuente - ya compilado en `dist/index.cjs`)
- `node_modules/` (se instala en Docker)
- `.git/` (no necesario en producción)

---

## 🎯 OPCIÓN RECOMENDADA

### **A) Docker Compose (Recomendado)**

**Justificación:**
1. ✅ **Ya está configurado y funcionando** - No requiere cambios
2. ✅ **Incluye PostgreSQL** - No necesita instalación separada
3. ✅ **Build dentro del contenedor** - Consistencia garantizada
4. ✅ **Aislamiento** - No contamina el sistema
5. ✅ **Fácil rollback** - Solo bajar contenedor y subir anterior
6. ✅ **Health checks** - Verificación automática
7. ✅ **Despliegue simple** - Un solo comando
8. ✅ **Reproducible** - Mismo resultado en cualquier servidor

**Alternativas descartadas:**
- ❌ **B) Build local + Docker**: Más complejo, requiere build manual
- ❌ **C) Build local + zip**: Problemas con dependencias y PostgreSQL
- ❌ **D) Ejecución directa Node/PM2**: Requiere instalación manual de PostgreSQL y configuración compleja

---

## 📝 Comandos de Despliegue

### **1. Borrar Instalación Previa**

```bash
# Conectarse al servidor
ssh root@tu-servidor

# Ir al directorio
cd /var/www

# Backup (opcional pero recomendado)
if [ -d "codekit-pro" ]; then
    mv codekit-pro "codekit-pro-backup-$(date +%Y%m%d-%H%M%S)"
fi

# Detener y eliminar contenedores antiguos
if [ -d "codekit-pro-backup"* ]; then
    cd codekit-pro-backup*
    docker compose down -v 2>/dev/null || true
    cd ..
fi

# Limpiar imágenes huérfanas (opcional)
docker system prune -f
```

---

### **2. Desplegar desde Cero**

```bash
# Clonar repositorio
cd /var/www
git clone https://github.com/planetazuzu/codekit-pro.git codekit-pro
cd codekit-pro

# Crear archivo .env
cat > .env << 'EOF'
NODE_ENV=production
PORT=8604
DATABASE_URL=postgresql://codekit_user:codekit_password@postgres:5432/codekit_pro
ADMIN_PASSWORD=tu_password_seguro_minimo_8_caracteres
JWT_SECRET=tu_jwt_secret_minimo_32_caracteres_aleatorios
ALLOWED_ORIGINS=
API_URL=
VITE_API_URL=
EOF

# Editar .env con valores reales
nano .env

# Construir e iniciar
docker compose build --no-cache
docker compose up -d

# Verificar logs
docker compose logs -f app
```

---

### **3. Verificar que Funciona**

```bash
# Esperar 15-20 segundos a que inicie
sleep 15

# Health check
curl -f http://localhost:8604/api/health

# Verificar que responde
curl -I http://localhost:8604/

# Ver estado de contenedores
docker compose ps

# Ver logs
docker compose logs --tail=50 app

# Verificar base de datos
docker compose exec postgres psql -U codekit_user -d codekit_pro -c "SELECT COUNT(*) FROM prompts;"
```

---

## 🔄 Comando Completo (Una Línea)

```bash
cd /var/www && [ -d "codekit-pro" ] && mv codekit-pro "codekit-pro-backup-$(date +%Y%m%d-%H%M%S)" && cd codekit-pro-backup* 2>/dev/null && docker compose down -v 2>/dev/null || true && cd /var/www && git clone https://github.com/planetazuzu/codekit-pro.git codekit-pro && cd codekit-pro && cat > .env << 'EOFENV'
NODE_ENV=production
PORT=8604
DATABASE_URL=postgresql://codekit_user:codekit_password@postgres:5432/codekit_pro
ADMIN_PASSWORD=tu_password_aqui
JWT_SECRET=tu_jwt_secret_aqui
ALLOWED_ORIGINS=
API_URL=
VITE_API_URL=
EOFENV
&& echo "⚠️ EDITA .env: nano .env" && read -p "Enter después de editar..." && docker compose build --no-cache && docker compose up -d && sleep 15 && curl -f http://localhost:8604/api/health && echo "✅ OK - Logs: docker compose logs -f app"
```

---

## ✅ Conclusión

**Opción recomendada:** **Docker Compose**

**Razón principal:** Es la forma más simple, segura y consistente. Ya está configurado, incluye PostgreSQL, y requiere un solo comando para desplegar.

**Complejidad:** Baja
**Tiempo de despliegue:** ~5-10 minutos (incluye build)
**Mantenimiento:** Mínimo
**Seguridad:** Alta (aislamiento, health checks)

---

**Siguiente paso:** Completar CI/CD para automatizar este proceso.
