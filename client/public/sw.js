const CACHE_NAME = 'neko-gallery-cache-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/vite.svg',
];
const IMAGE_CACHE_NAME = 'neko-gallery-images-v1';
const MAX_IMAGES_TO_CACHE = 50;
const INITIAL_IMAGES_TO_CACHE = 10;

let imageCounter = 0;

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Opened cache');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          return response;
        })
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
          if (imageCounter < INITIAL_IMAGES_TO_CACHE) {
            return caches.open(IMAGE_CACHE_NAME).then((cache) => {
              cache.put(request, networkResponse.clone());
              imageCounter++;
              return networkResponse;
            });
          }

          return caches.open(IMAGE_CACHE_NAME).then((cache) => {
            cache.keys().then((keys) => {
              if (keys.length > MAX_IMAGES_TO_CACHE) {
                cache.delete(keys[0]);
              }
            });
            return networkResponse;
          });
        });
      })
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request).then((networkResponse) => {
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, networkResponse.clone());
        });
        return networkResponse;
      });
      return cachedResponse || fetchPromise;
    })
  );
});
