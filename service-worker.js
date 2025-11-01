self.addEventListener('install', event => {
  event.waitUntil(
    caches.open('clear-sky-v1').then(async cache => {
      try {
        await cache.addAll([
          'index.html',
          'app.js',
          'styles.css',
          'manifest.json',
          'icon-192.png',
          'icon-512.png',
          'favicon.ico'
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