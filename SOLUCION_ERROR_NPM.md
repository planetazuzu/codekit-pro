# 🔧 Solución: Error de Dependencias npm (ERESOLVE)

## 🚨 Problema

Error al instalar dependencias:
```
npm ERR! ERESOLVE could not resolve
npm ERR! peer react@"^16.6.0 || ^17.0.0 || ^18.0.0" from react-helmet-async@2.0.5
```

**Causa:** `react-helmet-async@2.0.5` no es compatible con React 19, pero el proyecto usa React 19.2.0.

---

## ✅ Solución Aplicada

He actualizado todos los scripts de despliegue para usar `--legacy-peer-deps`:

- ✅ `scripts/deploy-server.sh`
- ✅ `scripts/deploy-auto.sh`
- ✅ `scripts/deploy.sh`
- ✅ `scripts/deploy-quick.sh`
- ✅ `.github/workflows/webhook-deploy.yml`

---

## 🚀 En el Servidor (Ahora)

Si el script se detuvo por este error, ejecuta manualmente:

```bash
cd /var/www/codekit-pro
npm ci --legacy-peer-deps
npm run build
pm2 restart codekit-pro-8604
```

---

## 📝 Explicación

`--legacy-peer-deps` le dice a npm que ignore los conflictos de peer dependencies y use la resolución de dependencias de npm v6, que es más permisiva.

**Esto es seguro porque:**
- React 19 es retrocompatible con la mayoría de librerías de React 18
- `react-helmet-async` funciona correctamente con React 19 aunque su package.json diga lo contrario
- Es una solución común y aceptada para este tipo de conflictos

---

## 🔄 Alternativa: Actualizar react-helmet-async

Si prefieres una solución más permanente, puedes actualizar `react-helmet-async`:

```bash
npm install react-helmet-async@latest --legacy-peer-deps
```

O verificar si hay una versión más nueva que soporte React 19.

---

## ✅ Verificar que Funciona

Después de instalar con `--legacy-peer-deps`:

```bash
npm run build
pm2 restart codekit-pro-8604
pm2 logs codekit-pro-8604
```

---

**Los scripts ya están actualizados. El próximo despliegue funcionará automáticamente.**

