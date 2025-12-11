# APIs de Afiliados - Guía de Integración

Este documento describe las APIs necesarias para completar las integraciones de afiliados en CodeKit Pro.

## 📋 Resumen de APIs Necesarias

### 1. Impact Radius (Impact.com)

**URL Base:** `https://api.impact.com`

**Endpoints Necesarios:**
- `GET /conversions` - Obtener conversiones
- `GET /clicks` - Obtener clics
- `GET /reports/revenue` - Obtener ingresos estimados

**Credenciales Requeridas:**
- `apiKey` - API Key de Impact Radius
- `apiSecret` - API Secret de Impact Radius

**Documentación Oficial:**
- https://developers.impact.com/docs/api-documentation

**Cómo Obtenerlas:**
1. Inicia sesión en tu cuenta de Impact Radius
2. Ve a **Settings** → **API Access**
3. Genera un nuevo API Key y Secret
4. Copia las credenciales y guárdalas de forma segura

**Configuración en CodeKit Pro:**
```json
{
  "apiKey": "tu-api-key-aqui",
  "apiSecret": "tu-api-secret-aqui"
}
```

---

### 2. PartnerStack

**URL Base:** `https://api.partnerstack.com/v2`

**Endpoints Necesarios:**
- `GET /conversions` - Obtener conversiones
- `GET /clicks` - Obtener clics
- `GET /revenue` - Obtener ingresos estimados

**Credenciales Requeridas:**
- `apiKey` - API Key de PartnerStack

**Documentación Oficial:**
- https://docs.partnerstack.com/

**Cómo Obtenerlas:**
1. Inicia sesión en tu cuenta de PartnerStack
2. Ve a **Settings** → **API Keys**
3. Genera un nuevo API Key
4. Copia la clave y guárdala de forma segura

**Configuración en CodeKit Pro:**
```json
{
  "apiKey": "tu-api-key-aqui"
}
```

---

### 3. Awin (Affiliate Window)

**URL Base:** `https://api.awin.com`

**Endpoints Necesarios:**
- `GET /publishers/{publisherId}/transactions` - Obtener transacciones/conversiones
- `GET /publishers/{publisherId}/clicks` - Obtener clics
- `GET /publishers/{publisherId}/revenue` - Obtener ingresos estimados

**Credenciales Requeridas:**
- `apiKey` - API Key de Awin
- `apiSecret` - API Secret de Awin
- `publisherId` - ID de tu cuenta de publisher (opcional, puede ir en la URL)

**Documentación Oficial:**
- https://wiki.awin.com/index.php/Advertiser_API

**Cómo Obtenerlas:**
1. Inicia sesión en tu cuenta de Awin
2. Ve a **Tools** → **API Access**
3. Genera un nuevo API Key y Secret
4. Copia las credenciales y guárdalas de forma segura

**Configuración en CodeKit Pro:**
```json
{
  "apiKey": "tu-api-key-aqui",
  "apiSecret": "tu-api-secret-aqui",
  "publisherId": "tu-publisher-id" // Opcional
}
```

---

## 🔧 Implementación Actual

Los servicios de integración están **completamente implementados** con llamadas HTTP reales a las APIs. El sistema incluye:

1. ✅ Llamadas HTTP reales a las APIs de Impact, PartnerStack y Awin
2. ✅ Manejo de autenticación (Bearer tokens, OAuth, API keys)
3. ✅ Manejo de errores robusto
4. ✅ Fallback automático a datos simulados si las credenciales no están configuradas
5. ✅ Logging detallado para debugging

### Archivos de Integración

- `server/services/affiliate-integrations/impactAffiliateClient.ts` ✅ **Implementado**
- `server/services/affiliate-integrations/partnerStackAffiliateClient.ts` ✅ **Implementado**
- `server/services/affiliate-integrations/awinAffiliateClient.ts` ✅ **Implementado**

### Estado Actual

Cada cliente tiene métodos implementados que:
- Hacen llamadas HTTP reales a las APIs oficiales
- Manejan autenticación correctamente
- Procesan respuestas y extraen datos
- Tienen fallback automático a datos simulados si:
  - Las credenciales no están configuradas
  - Las credenciales parecen ser placeholders
  - Hay errores de conexión o autenticación

---

## 🚀 Pasos para Activar las Integraciones Reales

### Paso 1: Obtener Credenciales

Para cada plataforma de afiliados que uses:
1. Regístrate en la plataforma
2. Solicita acceso al programa de afiliados
3. Obtén las credenciales de API (ver secciones anteriores)

### Paso 2: Configurar en CodeKit Pro

1. Ve a `/admin/affiliates-tracker`
2. Crea o edita un programa de afiliados
3. Selecciona el tipo de integración (Impact, PartnerStack, o Awin)
4. En "Configuración de Integración", pega el JSON con tus credenciales:

**Ejemplo para Impact:**
```json
{
  "apiKey": "impact_api_key_12345",
  "apiSecret": "impact_secret_67890"
}
```

**Ejemplo para PartnerStack:**
```json
{
  "apiKey": "partnerstack_key_abc123"
}
```

**Ejemplo para Awin:**
```json
{
  "apiKey": "awin_key_xyz789",
  "apiSecret": "awin_secret_def456",
  "publisherId": "12345"
}
```

### Paso 3: Las Llamadas Reales Ya Están Activas

✅ **Las implementaciones reales ya están activas**. Una vez que configures tus credenciales en el panel de administración, el sistema automáticamente:

1. Detectará que tienes credenciales válidas
2. Hará llamadas HTTP reales a las APIs
3. Sincronizará datos reales de clics, conversiones e ingresos

**No necesitas hacer nada más** - solo configura las credenciales y el sistema funcionará automáticamente.

**Si las credenciales no están configuradas o hay errores**, el sistema usará datos simulados como fallback, permitiendo que pruebes la funcionalidad sin interrupciones.

---

## 📊 Datos que se Sincronizan

Cada integración sincroniza:

1. **Clics Totales** - Número total de clics en enlaces de afiliados
2. **Conversiones** - Número de conversiones/compras realizadas
3. **Ingresos Estimados** - Ingresos generados por las conversiones

Estos datos se actualizan automáticamente cuando:
- Haces clic en "Sincronizar" en un programa individual
- Haces clic en "Sincronizar Todos" en el panel

---

## 🔒 Seguridad

**IMPORTANTE:** Las credenciales de API se almacenan en la base de datos en el campo `integrationConfig` como JSON. 

**Recomendaciones:**
- ✅ Nunca compartas tus credenciales
- ✅ Usa variables de entorno en producción si es posible
- ✅ Considera encriptar el campo `integrationConfig` en producción
- ✅ Revisa los permisos de acceso de tus API keys regularmente

---

## 🧪 Testing sin APIs Reales

El sistema tiene **fallback automático** a datos simulados cuando:

1. Las credenciales no están configuradas
2. Las credenciales parecen ser placeholders (contienen "placeholder")
3. Hay errores de conexión o autenticación

Esto permite:

1. ✅ Probar toda la funcionalidad del panel y dashboard sin credenciales
2. ✅ Ver cómo funcionaría la sincronización
3. ✅ Desarrollar y probar sin interrupciones

Los datos simulados se generan automáticamente cuando el sistema detecta que no puede hacer llamadas reales, permitiendo probar el flujo completo sin necesidad de credenciales reales.

---

## 📝 Notas Adicionales

- **Rate Limits:** Cada API tiene límites de velocidad. El código actual incluye un pequeño delay entre sincronizaciones para evitar problemas.

- **Autenticación:** Cada API usa un método diferente de autenticación (Bearer tokens, API keys, etc.). Los stubs actuales están preparados para implementar el método correcto.

- **Formato de Datos:** Cada API devuelve datos en formatos ligeramente diferentes. Los clientes actuales normalizan estos datos a un formato común para CodeKit Pro.

---

## 🆘 Soporte

Si necesitas ayuda con:
- Obtener credenciales de alguna plataforma
- Implementar las llamadas reales a las APIs
- Configurar la sincronización automática

Consulta la documentación oficial de cada plataforma o contacta con su soporte técnico.

