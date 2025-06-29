// Weather Safety App Service Worker
// Provides offline functionality and caching for emergency situations

const CACHE_NAME = 'weather-safety-v1';
const STATIC_CACHE_NAME = 'weather-safety-static-v1';
const DYNAMIC_CACHE_NAME = 'weather-safety-dynamic-v1';

// Critical resources to cache for offline functionality
const STATIC_ASSETS = [
  '/',
  '/dashboard',
  '/manifest.json',
  '/offline.html',
  // Add other critical static assets
];

// API endpoints to cache for offline access
const API_CACHE_PATTERNS = [
  /\/api\/weather\//,
  /\/api\/locations\//,
  /\/api\/disasters\//,
  /\/api\/safety\//
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('Service Worker: Static assets cached');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker: Failed to cache static assets', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE_NAME && cacheName !== DYNAMIC_CACHE_NAME) {
              console.log('Service Worker: Deleting old cache', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - handle requests with caching strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle API requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request));
    return;
  }

  // Handle navigation requests
  if (request.mode === 'navigate') {
    event.respondWith(handleNavigationRequest(request));
    return;
  }

  // Handle other requests (static assets)
  event.respondWith(handleStaticRequest(request));
});

// Handle API requests with network-first strategy
async function handleApiRequest(request) {
  const url = new URL(request.url);
  
  try {
    // Try network first
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache successful responses
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }
    
    throw new Error('Network response not ok');
  } catch (error) {
    console.log('Service Worker: Network failed, trying cache for', url.pathname);
    
    // Fallback to cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline fallback for critical APIs
    return createOfflineFallback(url.pathname);
  }
}

// Handle navigation requests
async function handleNavigationRequest(request) {
  try {
    // Try network first
    const networkResponse = await fetch(request);
    return networkResponse;
  } catch (error) {
    // Fallback to cached page or offline page
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline page
    return caches.match('/offline.html');
  }
}

// Handle static asset requests
async function handleStaticRequest(request) {
  // Cache first strategy for static assets
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Service Worker: Failed to fetch static asset', request.url);
    throw error;
  }
}

// Create offline fallback responses for critical APIs
function createOfflineFallback(pathname) {
  const headers = { 'Content-Type': 'application/json' };
  
  if (pathname.includes('/weather/')) {
    return new Response(JSON.stringify({
      success: false,
      error: 'Offline - Weather data unavailable',
      offline: true,
      data: {
        location: { lat: 0, lon: 0, name: 'Unknown Location' },
        current: {
          temp: 70,
          feels_like: 70,
          humidity: 50,
          pressure: 1013,
          visibility: 10,
          wind_speed: 5,
          wind_direction: 180,
          weather: {
            main: 'Offline',
            description: 'Weather data unavailable offline',
            icon: '01d'
          }
        }
      }
    }), { status: 200, headers });
  }
  
  if (pathname.includes('/disasters/')) {
    return new Response(JSON.stringify({
      success: false,
      error: 'Offline - Disaster data unavailable',
      offline: true,
      data: []
    }), { status: 200, headers });
  }
  
  if (pathname.includes('/locations/')) {
    return new Response(JSON.stringify({
      success: false,
      error: 'Offline - Location data unavailable',
      offline: true,
      data: []
    }), { status: 200, headers });
  }
  
  // Generic offline response
  return new Response(JSON.stringify({
    success: false,
    error: 'Service unavailable offline',
    offline: true
  }), { status: 503, headers });
}

// Handle background sync for emergency data
self.addEventListener('sync', (event) => {
  if (event.tag === 'emergency-sync') {
    event.waitUntil(syncEmergencyData());
  }
});

// Sync emergency data when connection is restored
async function syncEmergencyData() {
  try {
    console.log('Service Worker: Syncing emergency data...');
    
    // Get pending emergency check-ins from IndexedDB
    const pendingCheckins = await getPendingCheckins();
    
    for (const checkin of pendingCheckins) {
      try {
        await fetch('/api/safety/checkins', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(checkin)
        });
        
        // Remove from pending queue
        await removePendingCheckin(checkin.id);
      } catch (error) {
        console.error('Service Worker: Failed to sync checkin', error);
      }
    }
  } catch (error) {
    console.error('Service Worker: Emergency sync failed', error);
  }
}

// IndexedDB helpers for offline storage
async function getPendingCheckins() {
  // Implementation would use IndexedDB to store pending emergency data
  return [];
}

async function removePendingCheckin(id) {
  // Implementation would remove synced data from IndexedDB
}

// Handle push notifications for emergency alerts
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    
    const options = {
      body: data.body || 'Emergency alert received',
      icon: '/icon-192x192.png',
      badge: '/badge-72x72.png',
      tag: 'emergency-alert',
      requireInteraction: true,
      actions: [
        {
          action: 'view',
          title: 'View Details'
        },
        {
          action: 'checkin',
          title: 'I\'m Safe'
        }
      ]
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title || 'Weather Safety Alert', options)
    );
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'checkin') {
    // Handle quick safety check-in
    event.waitUntil(handleQuickCheckin());
  } else {
    // Open the app
    event.waitUntil(
      clients.openWindow('/dashboard')
    );
  }
});

async function handleQuickCheckin() {
  try {
    await fetch('/api/safety/checkins', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: 'safe',
        message: 'Quick check-in from notification',
        timestamp: new Date().toISOString()
      })
    });
  } catch (error) {
    // Store for later sync if offline
    console.log('Service Worker: Storing checkin for later sync');
  }
}
