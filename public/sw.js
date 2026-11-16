// Service Worker per AIutiamoci Workspace (PWA & Web Push)

self.addEventListener('install', (event) => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

self.addEventListener('push', (event) => {
  let payload = {}
  if (event.data) {
    try {
      payload = event.data.json()
    } catch {
      payload = {
        title: 'AIutiamoci',
        body: event.data.text(),
      }
    }
  }

  const title = payload.title || 'AIutiamoci Chat'
  const options = {
    body: payload.body || 'Nuovo messaggio',
    icon: '/apple-touch-icon.png',
    badge: '/favicon-32x32.png',
    tag: payload.tag || 'aiutiamoci-chat',
    data: {
      url: payload.url || '/chat',
    },
  }

  event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  const targetUrl = (event.notification.data && event.notification.data.url) || '/chat'

  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if ('focus' in client) {
            if (client.url && new URL(client.url).origin === self.location.origin) {
              if ('navigate' in client) {
                client.navigate(targetUrl)
              }
              return client.focus()
            }
          }
        }
        if (self.clients.openWindow) {
          return self.clients.openWindow(targetUrl)
        }
      })
  )
})
