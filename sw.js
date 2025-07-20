const CACHE_NAME = 'shifalink-v17-dev'; // Removed duplicate my-assigned-cases-view, fixed navigation flow
const urlsToCache = [
  '/',
  '/index.html',
  '/app.js',           // Add app.js to cache
  '/mock-data.js',     // Add mock-data.js to cache
  '/manifest.json',
  'https://cdn.tailwindcss.com'
  // Removed Firebase URLs since we're in demo mode
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching files');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('Service Worker: Files cached successfully');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker: Error caching files:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker: Activated successfully');
      return self.clients.claim();
    })
  );
});

// Fetch event - development-friendly caching
self.addEventListener('fetch', (event) => {
  // Skip non-HTTP schemes (chrome-extension, etc)
  if (!event.request.url.startsWith('http')) {
    return;
  }
  
  // Skip Firebase SDK requests and external CDNs as they need to be fresh
  if (event.request.url.includes('firebasejs') || 
      event.request.url.includes('firebaseapp.com') ||
      event.request.url.includes('googleapis.com') ||
      event.request.url.includes('cdn.tailwindcss.com')) {
    return;
  }

  // For development: Always fetch fresh for local files
  if (event.request.url.includes(self.location.origin)) {
    const url = new URL(event.request.url);
    
    // Development mode: Network-first strategy for JS/HTML files
    if (url.pathname.endsWith('.js') || url.pathname.endsWith('.html')) {
      console.log('Service Worker: Network-first strategy for:', event.request.url);
      event.respondWith(
        fetch(event.request)
          .then((response) => {
            if (response.ok) {
              // Only cache if content has changed (check last-modified header)
              return caches.match(event.request).then((cachedResponse) => {
                const shouldUpdate = !cachedResponse || 
                  response.headers.get('last-modified') !== cachedResponse.headers.get('last-modified');
                
                if (shouldUpdate) {
                  console.log('Service Worker: Updating cache for:', event.request.url);
                  const responseToCache = response.clone();
                  caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, responseToCache);
                  });
                }
                return response;
              });
            }
            return response;
          })
          .catch(() => {
            console.log('Service Worker: Network failed, serving from cache:', event.request.url);
            return caches.match(event.request);
          })
      );
      return;
    }
  }

  // Only handle HTTP requests for caching
  if (event.request.url.startsWith('http')) {
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          // Return cached version or fetch from network
          if (response) {
            console.log('Service Worker: Serving from cache:', event.request.url);
            return response;
          }

          console.log('Service Worker: Fetching from network:', event.request.url);
          return fetch(event.request)
            .then((response) => {
              // Check if we received a valid response
              if (!response || response.status !== 200 || response.type !== 'basic') {
                return response;
              }

              // Clone the response
              const responseToCache = response.clone();

              // Cache the fetched resource
              caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(event.request, responseToCache);
                  console.log('Service Worker: Cached new resource:', event.request.url);
                });

              return response;
            })
            .catch(() => {
              // If network fails and it's a navigation request, serve the cached index.html
              if (event.request.mode === 'navigate') {
                return caches.match('/index.html');
              }
            });
        })
    );
  }
});

// Background sync for offline data
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync triggered:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Handle background sync for offline data
      console.log('Service Worker: Processing background sync...')
    );
  }
});

// Push notification handling
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push notification received');
  
  const options = {
    body: event.data ? event.data.text() : 'New medical case available',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'View Case',
        icon: '/icons/icon-96x96.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icons/icon-96x96.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('MedBridge Gaza', options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked:', event.action);
  
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/cases')
    );
  }
});

// Message handling from main thread
self.addEventListener('message', (event) => {
  console.log('Service Worker: Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
}); 