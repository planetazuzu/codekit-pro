// Service Worker para CodeKit Pro PWA - Optimizado para móvil y offline
const CACHE_NAME = 'codekit-pro-v3-mobile';
const STATIC_CACHE = 'codekit-pro-static-v3';
const API_CACHE = 'codekit-pro-api-v3';
const urlsToCache = [
  '/',
  '/prompts',
  '/snippets',
  '/tools',
  '/guides',
  '/links',
  '/resources',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/favicon.svg'
];

// Assets críticos para carga rápida en móvil
const criticalAssets = [
  '/',
  '/manifest.json',
];

// Instalación del Service Worker - Optimizado para móvil
self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      // Cache crítico primero
      caches.open(STATIC_CACHE).then((cache) => {
        return cache.addAll(criticalAssets);
      }),
      // Cache completo en background
      caches.open(CACHE_NAME).then((cache) => {
        return cache.addAll(urlsToCache).catch((err) => {
          console.log('Algunos recursos no se pudieron cachear:', err);
        });
      })
    ])
  );
  // Activar inmediatamente sin esperar
  self.skipWaiting();
});

// Activación del Service Worker - Limpiar caches antiguos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      // Limpiar caches antiguos
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && cacheName !== STATIC_CACHE) {
              console.log('Eliminando cache antiguo:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Tomar control de todas las páginas
      self.clients.claim()
    ])
  );
});

// Estrategia: Network First, luego Cache
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // No interceptar requests POST, PUT, DELETE, etc.
  if (request.method !== 'GET') {
    return; // Dejar que el navegador maneje la request normalmente
  }
  
  // No interceptar Google Fonts - dejar que el navegador las cargue directamente
  // Esto evita problemas con CSP
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    return; // No interceptar, dejar pasar
  }
  
  // No interceptar requests a la API
  if (url.pathname.startsWith('/api/')) {
    return; // No interceptar, dejar pasar
  }
  
  // No interceptar archivos estáticos con extensiones específicas que pueden tener CSP estricto
  const staticExtensions = ['.css', '.js', '.mjs', '.json', '.png', '.jpg', '.jpeg', '.svg', '.woff', '.woff2', '.ttf', '.eot'];
  const hasStaticExtension = staticExtensions.some(ext => url.pathname.endsWith(ext));
  if (hasStaticExtension && url.origin !== self.location.origin) {
    return; // No interceptar recursos externos con extensiones estáticas
  }
  
  // Interceptar solo requests del mismo origen para la SPA
  if (url.origin !== self.location.origin) {
    return; // No interceptar recursos externos
  }
  
  // Estrategia: Network First con fallback a Cache (mejor para móvil)
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      // Intentar red primero
      return fetch(request)
        .then((response) => {
          // Solo cachear respuestas exitosas del mismo origen
          if (response.status === 200 && response.type === 'basic') {
            const responseToCache = response.clone();
            const cacheToUse = criticalAssets.some(url => request.url.includes(url)) 
              ? STATIC_CACHE 
              : CACHE_NAME;
            
            caches.open(cacheToUse)
              .then((cache) => {
                cache.put(request, responseToCache).catch(() => {
                  // Ignorar errores de cache silenciosamente
                });
              });
          }
          return response;
        })
        .catch(() => {
          // Si falla la red, usar cache si existe
          if (cachedResponse) {
            return cachedResponse;
          }
          // Si es una página HTML y no hay cache, devolver página offline
          if (request.headers.get('accept')?.includes('text/html')) {
            return caches.match('/').then((indexCache) => {
              return indexCache || new Response('Offline - Sin conexión', {
                status: 503,
                headers: { 'Content-Type': 'text/plain' }
              });
            });
          }
          // Para otros recursos, devolver error
          return new Response('Recurso no disponible offline', {
            status: 503,
            headers: { 'Content-Type': 'text/plain' }
          });
        });
    })
  );
});

