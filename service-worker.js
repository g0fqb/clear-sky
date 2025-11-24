// service-worker.js

const CACHE_NAME = "clear-sky-cache-v1";
const ASSETS = [
  "/",               // root
  "/index.html",
  "/styles.css",
  "/app.js",
  "/manifest.json",
  "/favicon.ico"
];

// Install event: cache core assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

// Activate event: clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    )
  );
});

// Fetch event: serve from cache, fall back to network
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => {
      return (
        cached ||
        fetch(event.request).catch(() =>
          // Optional offline fallback
          event.request.destination === "document"
            ? caches.match("/index.html")
            : undefined
        )
      );
    })
  );
});
