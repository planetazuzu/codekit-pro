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
  
  // No cachear requests POST, PUT, DELETE, etc.
  if (request.method !== 'GET') {
    return;
  }
  
  // No cachear Google Fonts (se cargan directamente)
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    return;
  }
  
  // No cachear requests a la API
  if (url.pathname.startsWith('/api/')) {
    return;
  }
  
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Solo cachear respuestas exitosas
        if (response.status === 200) {
          // Clonar la respuesta
          const responseToCache = response.clone();
          
          caches.open(CACHE_NAME)
            .then((cache) => {
              // Solo cachear GET requests
              if (request.method === 'GET') {
                cache.put(request, responseToCache).catch(() => {
                  // Ignorar errores de cache
                });
              }
            });
        }
        
        return response;
      })
      .catch(() => {
        // Si falla la red, intentar desde cache
        return caches.match(request);
      })
  );
});

