const CACHE_NAME = "metacog-v2";

// arquivos essenciais do app
const FILES_TO_CACHE = [
  "./",
  "./index.html",
  "https://unpkg.com/html5-qrcode"
];

// ---------------- INSTALL ----------------
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// ---------------- ACTIVATE ----------------
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// ---------------- FETCH ----------------
self.addEventListener("fetch", (event) => {

  // estratégia: cache first
  event.respondWith(
    caches.match(event.request).then((response) => {

      if (response) {
        return response;
      }

      return fetch(event.request)
        .then((networkResponse) => {

          // salva no cache
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });

        })
        .catch(() => {
          // fallback simples offline
          return caches.match("./index.html");
        });
    })
  );

});
