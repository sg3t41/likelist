// Service Worker for すきなものリスト
const CACHE_NAME = 'sukilist-v1';
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// キャッシュ戦略の定義
const CACHE_STRATEGIES = {
  // 静的アセット: Cache First
  STATIC: /\.(js|css|woff2|png|jpg|jpeg|gif|ico|svg)$/,
  // API: Network First with fallback
  API: /^\/api\//,
  // ページ: Stale While Revalidate
  PAGES: /^\/(?!api)/
};

// インストール時: 静的アセットをキャッシュ
self.addEventListener('install', (event) => {
  console.log('[SW] Installing Service Worker');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[SW] Installation complete');
        return self.skipWaiting();
      })
  );
});

// アクティベート時: 古いキャッシュを削除
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Service Worker');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[SW] Activation complete');
        return self.clients.claim();
      })
  );
});

// フェッチイベント: リクエストに応じたキャッシュ戦略
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const { url, method } = request;

  // GET リクエストのみ処理
  if (method !== 'GET') return;

  // 静的アセット: Cache First
  if (CACHE_STRATEGIES.STATIC.test(url)) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // API: Network First
  if (CACHE_STRATEGIES.API.test(url)) {
    event.respondWith(networkFirst(request));
    return;
  }

  // ページ: Stale While Revalidate
  if (CACHE_STRATEGIES.PAGES.test(url)) {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }
});

// Cache First 戦略
async function cacheFirst(request) {
  try {
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('[SW] Cache First failed:', error);
    return new Response('Offline', { status: 503 });
  }
}

// Network First 戦略
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed, trying cache:', error);
    
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    return new Response(JSON.stringify({ 
      error: 'オフラインです', 
      cached: false 
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Stale While Revalidate 戦略
async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);
  
  // バックグラウンドで更新
  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  });
  
  // キャッシュがあればすぐ返す、なければネットワークを待つ
  return cachedResponse || fetchPromise;
}

// プッシュ通知（将来の機能拡張用）
self.addEventListener('push', (event) => {
  if (!event.data) return;
  
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    data: data.url
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// 通知クリック
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.notification.data) {
    event.waitUntil(
      clients.openWindow(event.notification.data)
    );
  }
});