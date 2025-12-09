const CACHE_NAME = 'black-cats-book-v2';
const RUNTIME_CACHE = 'runtime-cache-v2';
const urlsToCache = [
  '/',
  '/index.html',
  '/favicon.svg',
  '/manifest.json'
];

const OFFLINE_ACTIONS_QUEUE = 'offline-actions';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method === 'GET' && (url.pathname.startsWith('/assets/') || url.pathname.endsWith('.js') || url.pathname.endsWith('.css'))) {
    event.respondWith(
      caches.open(RUNTIME_CACHE).then((cache) => {
        return cache.match(request).then((response) => {
          return response || fetch(request).then((fetchResponse) => {
            cache.put(request, fetchResponse.clone());
            return fetchResponse;
          });
        });
      })
    );
    return;
  }

  if (request.method === 'POST' || request.method === 'PUT' || request.method === 'DELETE') {
    event.respondWith(
      fetch(request).catch(() => {
        return new Promise((resolve) => {
          const queueItem = {
            url: request.url,
            method: request.method,
            headers: Array.from(request.headers.entries()),
            timestamp: Date.now()
          };

          if (request.method === 'POST' || request.method === 'PUT') {
            request.clone().text().then((body) => {
              queueItem.body = body;
              queueOfflineAction(queueItem);
            });
          } else {
            queueOfflineAction(queueItem);
          }

          resolve(new Response(JSON.stringify({
            offline: true,
            message: 'Action queued for when online'
          }), {
            status: 202,
            headers: { 'Content-Type': 'application/json' }
          }));
        });
      })
    );
    return;
  }

  event.respondWith(
    caches.match(request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(request).catch(() => {
          if (request.destination === 'document') {
            return caches.match('/index.html');
          }
        });
      })
  );
});

async function queueOfflineAction(action) {
  const db = await openDB();
  const tx = db.transaction([OFFLINE_ACTIONS_QUEUE], 'readwrite');
  const store = tx.objectStore(OFFLINE_ACTIONS_QUEUE);
  await store.add(action);
}

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('BlackCatsBookDB', 1);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(OFFLINE_ACTIONS_QUEUE)) {
        db.createObjectStore(OFFLINE_ACTIONS_QUEUE, { keyPath: 'timestamp' });
      }
    };
  });
}

self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-offline-actions') {
    event.waitUntil(syncOfflineActions());
  }
});

async function syncOfflineActions() {
  const db = await openDB();
  const tx = db.transaction([OFFLINE_ACTIONS_QUEUE], 'readonly');
  const store = tx.objectStore(OFFLINE_ACTIONS_QUEUE);
  const actions = await store.getAll();

  for (const action of actions) {
    try {
      await fetch(action.url, {
        method: action.method,
        headers: new Headers(action.headers),
        body: action.body
      });

      const deleteTx = db.transaction([OFFLINE_ACTIONS_QUEUE], 'readwrite');
      const deleteStore = deleteTx.objectStore(OFFLINE_ACTIONS_QUEUE);
      await deleteStore.delete(action.timestamp);
    } catch (error) {
      console.error('Failed to sync action:', error);
    }
  }
}

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
