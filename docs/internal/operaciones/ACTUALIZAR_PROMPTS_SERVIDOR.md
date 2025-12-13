# 🔄 Actualizar Prompts desde el Servidor

## Opción 1: Usar el Endpoint API (Recomendado)

```bash
cd /var/www/codekit-pro
curl -X POST http://localhost:8604/api/admin/reinitialize-data
```

## Opción 2: Reiniciar el Contenedor

```bash
cd /var/www/codekit-pro
docker compose restart app
```

Espera 10-15 segundos y verifica:

```bash
docker compose logs app | grep -i "prompts\|initialized" | tail -10
```

## Opción 3: Actualizar Código y Reiniciar

```bash
cd /var/www/codekit-pro
git pull origin main
docker compose restart app
```

## Verificar que se Actualizaron

```bash
# Contar total de prompts
docker compose exec postgres psql -U codekit_user -d codekit_pro -c "SELECT COUNT(*) FROM prompts;"

# Ver prompts de "Desarrollo Eficiente" (los nuevos)
docker compose exec postgres psql -U codekit_user -d codekit_pro -c "SELECT COUNT(*) FROM prompts WHERE category = 'Desarrollo Eficiente';"

# Ver últimos prompts añadidos
docker compose exec postgres psql -U codekit_user -d codekit_pro -c "SELECT title, category FROM prompts ORDER BY created_at DESC LIMIT 10;"
```

## Comando Completo (Todo en Uno)

```bash
cd /var/www/codekit-pro && \
git pull origin main && \
docker compose restart app && \
sleep 15 && \
echo "=== Verificando prompts ===" && \
docker compose exec postgres psql -U codekit_user -d codekit_pro -c "SELECT COUNT(*) as total_prompts FROM prompts;" && \
docker compose exec postgres psql -U codekit_user -d codekit_pro -c "SELECT COUNT(*) as desarrollo_eficiente FROM prompts WHERE category = 'Desarrollo Eficiente';" && \
docker compose logs app | grep -i "prompts\|initialized" | tail -5
```

