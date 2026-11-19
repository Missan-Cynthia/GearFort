const PREFIX = 'moving-castle-';
const CACHE = PREFIX + 'v1.1.0:' + self.registration.scope;
const SHELL = [
  './','./index.html','./style.css','./main.js','./config.js','./eligibility.js',
  './damage.js','./combat.js','./ai.js','./art.js','./backgrounds.js','./models.js',
  './movement.js','./effects.js','./sound.js',
  './manifest.webmanifest','./icon-180.png','./icon-192.png','./icon-512.png'
].map(path => new URL(path,self.registration.scope).href);

self.addEventListener('install',event => {
  const requests = SHELL.map(url => new Request(url,{cache:'reload'}));
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(requests)).then(() => self.skipWaiting()));
});
self.addEventListener('activate',event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys
    .filter(key => key !== CACHE && (key === PREFIX+'v1.0.0' || key === PREFIX+'v1.0.1'
      || (key.startsWith(PREFIX) && key.endsWith(':'+self.registration.scope))))
    .map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch',event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  const shell = SHELL.includes(url.href);
  const gamePage = event.request.mode === 'navigate' && SHELL.slice(0,2).includes(url.origin+url.pathname);
  if (shell || gamePage) {
    event.respondWith(caches.match(gamePage ? SHELL[1] : event.request,{cacheName:CACHE})
      .then(response => response || fetch(event.request)));
  }
});
