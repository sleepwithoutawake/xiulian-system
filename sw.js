const CACHE_NAME = "cultivation-system-v3";
const APP_SHELL = [
  "./index.html",
  "./修炼系统_每日操作卡.html",
  "./manifest.json",
  "./app-icon.svg"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  if(event.request.method !== "GET") return;

  const requestUrl = new URL(event.request.url);
  const scopeUrl = new URL(self.registration.scope);
  if(requestUrl.origin !== scopeUrl.origin) return;

  if(event.request.mode === "navigate"){
    event.respondWith(
      fetch(event.request, {cache:"reload"})
        .then(response => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put("./修炼系统_每日操作卡.html", copy));
          return response;
        })
        .catch(() => caches.match("./修炼系统_每日操作卡.html"))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cached => {
      if(cached) return cached;
      return fetch(event.request).then(response => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
        return response;
      });
    })
  );
});
