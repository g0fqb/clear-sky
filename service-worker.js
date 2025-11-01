self.addEventListener('install', event => {
  event.waitUntil(
    caches.open('clear-sky-v1').then(cache => {
      return cache.addAll([
        '/index.html',        // Main page
        '/app.js',            // Your script
        '/styles.css',        // Your stylesheet
        '/manifest.json',     // Web app manifest
        '/icon-192.png',      // Icon (must exist)
        '/icon-512.png',     // Icon (must exist)
        '/favicon.ico'      // Icon (must exist)
        
        // Do NOT include favicon.ico unless it's present
      ]);
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});