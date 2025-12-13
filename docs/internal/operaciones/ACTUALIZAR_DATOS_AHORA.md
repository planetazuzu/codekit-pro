# 🔄 Actualizar Datos - Solución Inmediata

El script aún no está desplegado. Usa una de estas opciones:

## Opción 1: Usar curl directamente (Más rápido)

```bash
curl -X POST http://localhost:8604/api/admin/reinitialize-data
```

## Opción 2: Reiniciar el contenedor (Si el endpoint no existe aún)

```bash
cd /var/www/codekit-pro
docker compose restart app
```

Esto ejecutará `initializeData()` automáticamente al iniciar.

## Opción 3: Ejecutar desde dentro del contenedor

```bash
cd /var/www/codekit-pro
docker compose exec app node -e "
const { initializeData } = require('./dist/init-data');
initializeData().then(() => {
  console.log('✅ Datos actualizados');
  process.exit(0);
}).catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
"
```

## Verificar que funcionó

```bash
# Contar prompts
docker compose exec postgres psql -U codekit_user -d codekit_pro -c "SELECT COUNT(*) FROM prompts;"

# Ver prompts de "Desarrollo Eficiente"
docker compose exec postgres psql -U codekit_user -d codekit_pro -c "SELECT title FROM prompts WHERE category = 'Desarrollo Eficiente' LIMIT 5;"
```

