self.addEventListener('install', event => {
  event.waitUntil(
    caches.open('clear-sky-v1').then(async cache => {
      try {
        await cache.addAll([
          'index.html',       // Main page
          'app.js',           // Your JavaScript
          'styles.css',       // Your stylesheet
          'manifest.json',    // Web app manifest
          'icon-192.png',     // PWA icon
          'icon-512.png',     // PWA icon
          'favicon.ico'       // Site icon (must exist)
        ]);
        console.log('Service worker: Assets cached successfully');
      } catch (err) {
        console.error('Service worker: Cache addAll failed', err);
      }
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    }).catch(err => {
      console.error('Service worker: Fetch failed', err);
      return fetch(event.request);
    })
  );
});