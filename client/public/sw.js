// Service Worker para CodeKit Pro PWA
const CACHE_NAME = 'codekit-pro-v1';
const urlsToCache = [
  '/',
  '/prompts',
  '/snippets',
  '/tools',
  '/guides',
  '/links',
  '/resources'
];

// Instalación del Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cache abierto');
        return cache.addAll(urlsToCache);
      })
  );
});

// Activación del Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Eliminando cache antiguo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
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
  
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Solo cachear respuestas exitosas del mismo origen
        if (response.status === 200 && response.type === 'basic') {
          // Clonar la respuesta
          const responseToCache = response.clone();
          
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(request, responseToCache).catch(() => {
                // Ignorar errores de cache silenciosamente
              });
            });
        }
        
        return response;
      })
      .catch(() => {
        // Si falla la red, intentar desde cache solo para recursos del mismo origen
        return caches.match(request).then(cachedResponse => {
          return cachedResponse || fetch(request); // Si no hay cache, intentar fetch normal
        });
      })
  );
});

