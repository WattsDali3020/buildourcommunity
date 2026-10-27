// Simple service worker: precache app shell + data; runtime-cache the CDN libs; never intercept OSM tiles.
const VERSION = 'ud-v1';
const SHELL = ['./', 'index.html', 'style.css', 'app.js', 'manifest.json', 'icons/icon.svg',
               'data/scores.json', 'data/boundaries.json'];
const CDN = ['https://unpkg.com/leaflet@1.9.4/dist/leaflet.css', 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
             'https://cdn.jsdelivr.net/npm/chart.js@4.4.7/dist/chart.umd.min.js'];
self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const c = await caches.open(VERSION);
    await c.addAll(SHELL);
    await Promise.all(CDN.map(u => fetch(u, {mode: 'cors'}).then(r => r.ok && c.put(u, r)).catch(() => {})));
    self.skipWaiting();
  })());
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== 'GET') return;
  const sameOrigin = url.origin === self.location.origin;
  if (!sameOrigin && !CDN.includes(req.url)) return;           // tiles & everything else: browser default
  if (sameOrigin && url.pathname.endsWith('/data/scores.json')) {   // data: network first, cache fallback
    e.respondWith(fetch(req).then(r => { const cp = r.clone(); caches.open(VERSION).then(c => c.put(req, cp)); return r; })
      .catch(() => caches.match(req)));
    return;
  }
  e.respondWith(caches.match(req, {ignoreSearch: true}).then(hit => hit || fetch(req).then(r => {
    if (r.ok) { const cp = r.clone(); caches.open(VERSION).then(c => c.put(req, cp)); }
    return r;
  })));
});
