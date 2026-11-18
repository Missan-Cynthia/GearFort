const CACHE = 'moving-castle-v1.0.1';
const SHELL = [
  './','./index.html','./style.css','./main.js','./config.js','./eligibility.js',
  './damage.js','./combat.js','./ai.js','./art.js','./effects.js','./sound.js',
  './manifest.webmanifest','./icon-180.png','./icon-192.png','./icon-512.png'
].map(path => new URL(path,self.registration.scope).href);

self.addEventListener('install',event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate',event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys
    .filter(key => key.startsWith('moving-castle-') && key !== CACHE)
    .map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch',event => {
  if (event.request.method !== 'GET') return;
  if (event.request.mode === 'navigate' && event.request.url.startsWith(self.registration.scope)) {
    event.respondWith(fetch(event.request).catch(() => caches.match(SHELL[1],{cacheName:CACHE})));
  } else if (SHELL.includes(event.request.url)) {
    event.respondWith(caches.match(event.request,{cacheName:CACHE}).then(response => response || fetch(event.request)));
  }
});
