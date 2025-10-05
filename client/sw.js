const CACHE_NAME = 'drazzan-invasion-v2.0.0';
const CACHE_URLS = [
  '/',
  '/index.html',
  '/css/styles.css',
  // JavaScript files
  '/js/asteroids.js',
  '/js/bossLaser.js',
  '/js/canvas.js',
  '/js/collisions.js',
  '/js/config.js',
  '/js/enemy.js',
  '/js/enemyLaser.js', 
  '/js/explosions.js',
  '/js/gameloop.js',
  '/js/gameloop-extended.js',
  '/js/input.js',
  '/js/intro.js',
  '/js/lasers.js',
  '/js/main.js',
  '/js/player.js',
  '/js/powerup.js',
  '/js/scoreboard.js',
  '/js/utils.js',
  // PWA specific files
  '/js/pwa/service-worker-bridge.js',
  '/js/pwa/network-manager.js',
  '/js/pwa/peer-server.js',
  '/wasm/game-server.wasm',
  // Assets
  '/assets/8bit_retro.mp3',
  '/assets/asteroid.png',
  '/assets/days_work.MP3',
  '/assets/drazzan_mothership.png',
  '/assets/enemy.png',
  '/assets/explosion.gif',
  '/assets/explosion_noise.mp3',
  '/assets/game_thumbnail.jpg',
  '/assets/laser1.MP3',
  '/assets/norinavio.png',
  '/assets/powerup.png',
  '/assets/spaceship.png',
  '/assets/wyatt001.MP3',
  '/assets/wyatt_01.MP3',
  '/assets/wyatt_02.MP3',
  '/assets/wyatt_10.MP3'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching app shell and content');
        return cache.addAll(CACHE_URLS);
      })
      .then(() => {
        console.log('[SW] Skip waiting and activate immediately');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[SW] Failed to cache resources:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[SW] Taking control of all pages');
      return self.clients.claim();
    })
  );
});

// Fetch event - serve from cache with network fallback
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip WebRTC signaling and peer connections
  if (event.request.url.includes('webrtc') || 
      event.request.url.includes('signaling') ||
      event.request.url.includes('.well-known')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // Return cached version if available
        if (cachedResponse) {
          // Update cache in background for next time
          updateCacheInBackground(event.request);
          return cachedResponse;
        }

        // Fetch from network
        return fetch(event.request)
          .then((networkResponse) => {
            // Don't cache non-successful responses
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse;
            }

            // Clone the response before caching
            const responseToCache = networkResponse.clone();
            
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return networkResponse;
          })
          .catch(() => {
            // Network failed, try to serve offline fallback
            if (event.request.destination === 'document') {
              return caches.match('/offline.html') || 
                     caches.match('/index.html');
            }
            
            // For other requests, just fail
            return new Response('Offline', { 
              status: 503, 
              statusText: 'Service Unavailable' 
            });
          });
      })
  );
});

// Background cache update
function updateCacheInBackground(request) {
  fetch(request)
    .then((response) => {
      if (response && response.status === 200 && response.type === 'basic') {
        const responseToCache = response.clone();
        caches.open(CACHE_NAME)
          .then((cache) => {
            cache.put(request, responseToCache);
          });
      }
    })
    .catch(() => {
      // Ignore background update failures
    });
}

// Handle messages from main thread
self.addEventListener('message', (event) => {
  console.log('[SW] Received message:', event.data);
  
  switch (event.data.type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
      
    case 'GET_VERSION':
      event.ports[0].postMessage({ version: CACHE_NAME });
      break;
      
    case 'CACHE_URLS':
      // Cache additional URLs on demand
      if (event.data.urls && Array.isArray(event.data.urls)) {
        caches.open(CACHE_NAME)
          .then((cache) => {
            return cache.addAll(event.data.urls);
          })
          .then(() => {
            event.ports[0].postMessage({ success: true });
          })
          .catch((error) => {
            event.ports[0].postMessage({ success: false, error: error.message });
          });
      }
      break;
      
    case 'CLEAR_CACHE':
      // Clear specific cache entries
      caches.delete(CACHE_NAME)
        .then(() => {
          event.ports[0].postMessage({ success: true });
        })
        .catch((error) => {
          event.ports[0].postMessage({ success: false, error: error.message });
        });
      break;
  }
});

// Background sync for game state
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);
  
  switch (event.tag) {
    case 'sync-game-state':
      event.waitUntil(syncGameState());
      break;
      
    case 'sync-peer-discovery':
      event.waitUntil(syncPeerDiscovery());
      break;
  }
});

// Push notifications for multiplayer invites
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');
  
  const options = {
    body: 'You have been invited to a multiplayer game!',
    icon: '/assets/icons/icon-192x192.png',
    badge: '/assets/icons/badge-72x72.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: '1'
    },
    actions: [
      {
        action: 'join',
        title: 'Join Game',
        icon: '/assets/icons/join-96x96.png'
      },
      {
        action: 'decline',
        title: 'Decline',
        icon: '/assets/icons/decline-96x96.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Drazzan Invasion', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.action);
  
  event.notification.close();
  
  switch (event.action) {
    case 'join':
      event.waitUntil(
        clients.openWindow('/?mode=join&invite=' + event.notification.data.primaryKey)
      );
      break;
      
    case 'decline':
      // Just close notification
      break;
      
    default:
      // Open app
      event.waitUntil(
        clients.openWindow('/')
      );
      break;
  }
});

// Helper functions
async function syncGameState() {
  // Sync game state with peers when back online
  try {
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({ type: 'SYNC_GAME_STATE' });
    });
  } catch (error) {
    console.error('[SW] Failed to sync game state:', error);
  }
}

async function syncPeerDiscovery() {
  // Refresh peer discovery when back online  
  try {
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({ type: 'SYNC_PEER_DISCOVERY' });
    });
  } catch (error) {
    console.error('[SW] Failed to sync peer discovery:', error);
  }
}