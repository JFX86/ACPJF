const CACHE_NAME = 'acp-checklists-cache-v9'; // New version

self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  // Delete all old caches to force fresh updates
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(name => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  // Pure network pass-through to avoid freezing local dev
  event.respondWith(fetch(event.request));
});