// Service Worker para CodeKit Pro PWA - Optimizado para móvil y offline
// IMPORTANTE: La versión se actualiza automáticamente con cada build
// Esto asegura que los usuarios obtengan la versión más reciente después de un deploy
const SW_VERSION = 'v4'; // Incrementar manualmente después de cambios importantes en el SW
const CACHE_NAME = `codekit-pro-${SW_VERSION}-mobile`;
const STATIC_CACHE = `codekit-pro-static-${SW_VERSION}`;
const API_CACHE = `codekit-pro-api-${SW_VERSION}`;
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
            // Delete all caches that don't match current version
            // This ensures old chunks are removed after redeploy
            if (cacheName !== CACHE_NAME && 
                cacheName !== STATIC_CACHE && 
                cacheName !== API_CACHE &&
                cacheName.startsWith('codekit-pro')) {
              console.log('Eliminando cache antiguo:', cacheName);
              return caches.delete(cacheName);
            }
            return Promise.resolve();
          })
        );
      }),
      // Tomar control de todas las páginas inmediatamente
      // Esto asegura que el nuevo SW controle todas las pestañas
      self.clients.claim()
    ])
  );
  
  // Notificar a todas las pestañas que el nuevo SW está activo
  event.waitUntil(
    self.clients.matchAll().then((clients) => {
      clients.forEach((client) => {
        client.postMessage({
          type: 'SW_ACTIVATED',
          version: SW_VERSION
        });
      });
    })
  );
});

// Listen for skip waiting message from main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Estrategia optimizada para móvil: Cache First para assets, Network First para HTML/API
self.addEventListener('fetch', (event) => {
  const { request } = event;
  
  // No interceptar requests POST, PUT, DELETE, etc.
  if (request.method !== 'GET') {
    return; // Dejar que el navegador maneje la request normalmente
  }
  
  // Crear URL una sola vez
  let url;
  try {
    url = new URL(request.url);
  } catch (e) {
    return; // No es una URL válida, no interceptar
  }
  
  // No interceptar Google Fonts - dejar que el navegador las cargue directamente
  // Esto evita problemas con CSP
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    return; // No interceptar, dejar pasar
  }
  
  // Interceptar solo requests del mismo origen para la SPA
  if (url.origin !== self.location.origin) {
    return; // No interceptar recursos externos
  }
  
  // Determinar tipo de recurso
  const isStaticAsset = url.pathname.match(/\.(js|css|png|jpg|jpeg|svg|woff|woff2|ttf|eot|ico)$/);
  const isAPI = url.pathname.startsWith('/api/');
  
  if (isStaticAsset) {
    // Cache First para assets estáticos (más rápido en móvil)
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(request).then((response) => {
          if (response.status === 200 && response.type === 'basic') {
            const responseToCache = response.clone();
            const cacheToUse = criticalAssets.some(asset => request.url.includes(asset)) 
              ? STATIC_CACHE 
              : CACHE_NAME;
            caches.open(cacheToUse).then((cache) => {
              cache.put(request, responseToCache).catch(() => {});
            });
          }
          return response;
        });
      })
    );
  } else if (isAPI) {
    // Network First para API (siempre datos frescos)
    event.respondWith(
      fetch(request).catch(() => {
        // Si falla la red, intentar cache
        return caches.match(request).then((cachedResponse) => {
          return cachedResponse || new Response(JSON.stringify({ error: 'Offline' }), {
            status: 503,
            headers: { 'Content-Type': 'application/json' }
          });
        });
      })
    );
  } else {
    // Network First para HTML
    event.respondWith(
      fetch(request).then((response) => {
        if (response.status === 200 && response.type === 'basic') {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache).catch(() => {});
          });
        }
        return response;
      }).catch(() => {
        return caches.match(request).then((cachedResponse) => {
          return cachedResponse || caches.match('/').then((indexCache) => {
            return indexCache || new Response('Offline - Sin conexión', {
              status: 503,
              headers: { 'Content-Type': 'text/plain' }
            });
          });
        });
      })
    );
  }
});

