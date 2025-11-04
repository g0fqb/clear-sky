const CACHE_NAME = 'clear-sky-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/app.js',
  '/styles.css',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return Promise.all(
        ASSETS_TO_CACHE.map(url =>
          fetch(url)
            .then(response => {
              if (!response.ok) throw new Error(`Request for ${url} failed with status ${response.status}`);
              return cache.put(url, response.clone());
            })
            .catch(err => {
              console.warn(`Skipping ${url}: ${err.message}`);
            })
        )
      );
    })
  );
});