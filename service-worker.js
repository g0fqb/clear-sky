const CACHE_NAME = 'clear-sky-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/app.js',
  '/styles.css',
  '/manifest.json',
  '/favicon.ico',
  '/icon-192.png',
  '/icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return Promise.allSettled(
        ASSETS_TO_CACHE.map(url =>
          fetch(url)
            .then(response => {
              if (response.ok) {
                return cache.put(url, response.clone());
              } else {
                console.warn(`Skipping ${url}: ${response.status}`);
              }
            })
            .catch(err => {
              console.warn(`Skipping ${url}: ${err.message}`);
            })
        )
      );
    })
  );
});