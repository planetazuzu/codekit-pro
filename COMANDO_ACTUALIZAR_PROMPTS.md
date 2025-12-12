# 🔄 Comando Completo para Actualizar Prompts

## Opción 1: Script Automático (Recomendado)

```bash
cd /var/www/codekit-pro && bash scripts/forzar-actualizacion-prompts.sh
```

## Opción 2: Manual (Paso a Paso)

### 1. Obtener ID del usuario sistema
```bash
cd /var/www/codekit-pro
SYSTEM_USER_ID=$(docker compose exec -T postgres psql -U codekit_user -d codekit_pro -t -c "SELECT id FROM users WHERE email = 'system@codekit.pro';" | tr -d ' ')
echo "System User ID: $SYSTEM_USER_ID"
```

### 2. Eliminar prompts del sistema
```bash
docker compose exec -T postgres psql -U codekit_user -d codekit_pro -c "DELETE FROM prompts WHERE \"userId\" = '$SYSTEM_USER_ID';"
```

### 3. Reiniciar contenedor para recrear prompts
```bash
docker compose restart app
sleep 15
```

### 4. Verificar
```bash
docker compose exec postgres psql -U codekit_user -d codekit_pro -c "SELECT COUNT(*) as total FROM prompts;"
docker compose exec postgres psql -U codekit_user -d codekit_pro -c "SELECT COUNT(*) as desarrollo_eficiente FROM prompts WHERE category = 'Desarrollo Eficiente';"
docker compose exec postgres psql -U codekit_user -d codekit_pro -c "SELECT title FROM prompts WHERE category = 'Desarrollo Eficiente' LIMIT 5;"
```

## Opción 3: Todo en un Comando

```bash
cd /var/www/codekit-pro && \
SYSTEM_USER_ID=$(docker compose exec -T postgres psql -U codekit_user -d codekit_pro -t -c "SELECT id FROM users WHERE email = 'system@codekit.pro';" | tr -d ' ') && \
echo "Eliminando prompts del sistema (ID: $SYSTEM_USER_ID)..." && \
docker compose exec -T postgres psql -U codekit_user -d codekit_pro -c "DELETE FROM prompts WHERE \"userId\" = '$SYSTEM_USER_ID';" && \
echo "Reiniciando contenedor..." && \
docker compose restart app && \
sleep 20 && \
echo "=== Verificando ===" && \
docker compose exec postgres psql -U codekit_user -d codekit_pro -c "SELECT COUNT(*) as total FROM prompts;" && \
docker compose exec postgres psql -U codekit_user -d codekit_pro -c "SELECT COUNT(*) as desarrollo_eficiente FROM prompts WHERE category = 'Desarrollo Eficiente';" && \
docker compose logs app | grep -i "prompts\|initialized\|added" | tail -5
```

## Si el Script No Existe Aún

Si el script `forzar-actualizacion-prompts.sh` aún no está en el servidor, usa la Opción 3 (todo en un comando).

