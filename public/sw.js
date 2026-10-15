// Installability only. Nothing is cached: the app shell's hashed assets are
// re-fetched each load, and API calls (financial data, other origin) are never touched.
self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()))
self.addEventListener('fetch', (e) => {
  if (e.request.mode === 'navigate') e.respondWith(fetch(e.request))
})
