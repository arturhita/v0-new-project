// Service Worker per Push Notifications
const CACHE_NAME = "unveilly-v1"
const urlsToCache = ["/", "/images/unveilly-logo.png", "/sounds/notification.mp3"]

// Installazione Service Worker
self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache)))
})

// Attivazione Service Worker
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName)
          }
        }),
      )
    }),
  )
})

// Gestione richieste fetch
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response
      }
      return fetch(event.request)
    }),
  )
})

// Gestione Push Notifications
self.addEventListener("push", (event) => {
  const options = {
    body: "Hai una nuova notifica da Unveilly",
    icon: "/images/unveilly-logo.png",
    badge: "/images/unveilly-logo.png",
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
    },
    actions: [
      {
        action: "explore",
        title: "Vai alla Dashboard",
        icon: "/images/unveilly-logo.png",
      },
      {
        action: "close",
        title: "Chiudi",
        icon: "/images/unveilly-logo.png",
      },
    ],
  }

  if (event.data) {
    const data = event.data.json()
    options.body = data.body || options.body
    options.icon = data.icon || options.icon
    options.data = data.data || options.data
  }

  event.waitUntil(self.registration.showNotification("Unveilly", options))
})

// Gestione click su notifiche
self.addEventListener("notificationclick", (event) => {
  event.notification.close()

  if (event.action === "explore") {
    event.waitUntil(clients.openWindow("/dashboard"))
  } else if (event.action === "close") {
    // Chiudi semplicemente la notifica
  } else {
    // Click sulla notifica principale
    event.waitUntil(clients.openWindow("/"))
  }
})

// Gestione chiusura notifiche
self.addEventListener("notificationclose", (event) => {
  console.log("Notifica chiusa:", event.notification.tag)
})
