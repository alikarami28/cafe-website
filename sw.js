// =============================================
// Service Worker - کافه آرا ARA Cafe
// =============================================

const CACHE_NAME = 'ara-cafe-v2';
const urlsToCache = [
  '/',
  '/index.html',
  '/admin.html',
  '/order.html',
  '/css/style.css',
  '/js/main.js',
  '/js/admin.js',
  '/js/order.js',
  '/data/menu.json',
  '/images/logo.png',
  '/images/favicon.ico',
  '/images/banner.jpg',
  '/manifest.json'
];

// نصب Service Worker
self.addEventListener('install', function(event) {
  console.log('🟢 Service Worker: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      console.log('📦 Caching files...');
      return cache.addAll(urlsToCache);
    })
  );
});

// فعال‌سازی
self.addEventListener('activate', function(event) {
  console.log('🟢 Service Worker: Activated');
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// دریافت فایل‌ها (آفلاین)
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request).then(function(response) {
      // از cache نشون بده
      if (response) {
        return response;
      }
      // اگه نبود، از اینترنت بگیر
      return fetch(event.request).then(function(response) {
        // صفحات HTML رو cache نکن
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        // فایل‌های استاتیک رو cache کن
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then(function(cache) {
          cache.put(event.request, responseToCache);
        });
        return response;
      });
    })
  );
});