const CACHE_NAME = 'clear-sky-v1';
const BASE_PATH = '/clear-sky'; // adjust for GitHub Pages subdirectory

const ASSETS_TO_CACHE = [
  `${BASE_PATH}/`,
  `${BASE_PATH}/index.html`,
  `${BASE_PATH}/app.js`,
  `${BASE_PATH}/styles.css`,
  `${BASE_PATH}/manifest.json`,
  `${BASE_PATH}/favicon.ico`,
  `${BASE_PATH}/icon-192.png`,
  `${BASE_PATH}/icon-512.png`
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


self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
});