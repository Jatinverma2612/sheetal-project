self.addEventListener("install", (event) => {
  console.log("Service Worker installed");
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  console.log("Service Worker activated");
});

self.addEventListener("fetch", (event) => {
  // event.respondWith(fetch(event.request).catch(() => {
  //     return new Response('You are offline', { status: 503, statusText: 'Offline' });
  // }));
});
