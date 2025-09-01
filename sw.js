// SAVE AS sw.js
const CACHE_NAME = 'dnd-sheet-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon.svg'
];

self.addEventListener('install', evt => {
  evt.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', evt => {
  evt.waitUntil(clients.claim());
});

self.addEventListener('fetch', evt => {
  evt.respondWith(
    caches.match(evt.request).then(cached => {
      if (cached) return cached;
      return fetch(evt.request).then(resp => {
        // кешируем новые ресурсы
        return caches.open(CACHE_NAME).then(cache => {
          try { cache.put(evt.request, resp.clone()); } catch(e){}
          return resp;
        });
      }).catch(()=>{
        // fallback: если запрос был навигацией, отдаём index.html из кеша
        return caches.match('./index.html');
      });
    })
  );
});
