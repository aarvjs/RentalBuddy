// Service Worker placeholder to resolve /sw.js requests cleanly
self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", () => {
  self.clients.claim();
});
