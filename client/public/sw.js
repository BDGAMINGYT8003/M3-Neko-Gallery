const CACHE_NAME = 'neko-gallery-cache-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/vite.svg',
];
const IMAGE_CACHE_NAME = 'neko-gallery-images-v1';
const MAX_IMAGES_TO_CACHE = 50;

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Opened cache');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

self.addEventListener('message', event => {
  if (event.data && event.data.type === 'CACHE_URLS') {
    const { payload } = event.data;
    caches.open(IMAGE_CACHE_NAME).then(cache => {
      cache.addAll(payload.urls);
    });
  }
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .catch(() => {
          return caches.match('/index.html');
        })
    );
    return;
  }

  if (request.destination === 'image') {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(request).then((networkResponse) => {
          return caches.open(IMAGE_CACHE_NAME).then((cache) => {
            cache.keys().then((keys) => {
              if (keys.length > MAX_IMAGES_TO_CACHE) {
                cache.delete(keys[0]);
              }
            });
            cache.put(request, networkResponse.clone());
            return networkResponse;
          });
        });
      })
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      return cachedResponse || fetch(request).then((networkResponse) => {
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, networkResponse.clone());
        });
        return networkResponse;
      });
    })
  );
});
