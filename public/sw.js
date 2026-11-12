// Service worker mínimo: no guarda nada en caché.
// Existe para que el navegador ofrezca la instalación de la app.
self.addEventListener('install', () => self.skipWaiting())

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

self.addEventListener('fetch', (event) => {
  // Solo las cargas de página pasan por acá; el resto (API, imágenes,
  // fuentes) lo maneja el navegador como siempre
  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request))
  }
})
