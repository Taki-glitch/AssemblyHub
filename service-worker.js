const CACHE_NAME = 'assemblyhub-v2';
const APP_SHELL = [
  '/',
  '/index.html',
  '/404.html',
  '/styles.css',
  '/app.js',
  '/manifest.webmanifest',
  '/assets/icon.svg',
];
const APP_ROUTES = [
  '/reunions/',
  '/affectations/',
  '/sujets/',
  '/territoires/',
  '/documents/',
  '/annonces/',
  '/annuaire/',
  '/profil/',
  '/admin/',
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll([...APP_SHELL, ...APP_ROUTES])));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const requestUrl = new URL(event.request.url);
  const isNavigation = event.request.mode === 'navigate';

  if (isNavigation) {
    event.respondWith(fetch(event.request).catch(() => caches.match('/index.html')));
    return;
  }

  if (requestUrl.origin === self.location.origin) {
    event.respondWith(
      caches.match(event.request).then((cached) => cached || fetch(event.request).then((response) => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        return response;
      }))
    );
  }
});
