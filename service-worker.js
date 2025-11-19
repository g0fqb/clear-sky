const CACHE_NAME = 'clear-sky-runtime-v1';

const urlsToCache = [
  "/clear-sky/",
  "/clear-sky/index.html",
  "/clear-sky/app.js",
  "/clear-sky/styles.css",
  "/clear-sky/manifest.json",
  "/clear-sky/icon-192.png",
  "/clear-sky/icon-512.png"
];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return Promise.all(
        urlsToCache.map((url) =>
          fetch(url).then((response) => {
            if (response.ok) {
              return cache.put(url, response);
            } else {
              console.warn("Not cached:", url);
            }
          })
        )
      );
    })
  );
});


self.addEventListener('activate', event => {
  // Clean up old caches if needed
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) return cachedResponse;

      return fetch(event.request)
        .then(response => {
          // Only cache successful responses
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });

          return response;
        })
        .catch(() => {
          // Optional: fallback logic for offline
          return new Response('Offline or failed to fetch', {
            status: 503,
            statusText: 'Service Unavailable'
          });
        });
    })
  );
});