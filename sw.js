/* GearRound service worker: precaches the app shell so it opens offline.
   VERSION and the ?v= hashes are set by `node tools/stamp.mjs`; run it after
   changing any file below (add new files to SHELL first) so users get the update. */
const VERSION = 'gearround-7d80961c5d';
const SHELL = [
  './',
  './index.html',
  './styles.css?v=501158b3',
  './app.js?v=592525a0',
  './manifest.webmanifest',
  './icons/icon.svg',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/maskable-512.png',
  './icons/apple-touch-icon.png',
  './icons/favicon-32.png',
  './images/listings/baseball-glove.jpg',
  './images/listings/soccer-cleats.jpg',
  './images/listings/shin-guards.jpg',
  './images/listings/lacrosse-stick.jpg',
  './images/listings/hockey-helmet.jpg'
];
const FONT_CACHE = 'gearround-fonts';

self.addEventListener('install', (event) => {
  // Don't take over right away: the page shows an "Update available" banner
  // and tells this worker to activate when the person taps Refresh.
  event.waitUntil(caches.open(VERSION).then((cache) => cache.addAll(SHELL)));
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== VERSION && k !== FONT_CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Google Fonts: serve cached copy, refresh in the background
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    event.respondWith(
      caches.open(FONT_CACHE).then((cache) =>
        cache.match(req).then((hit) => {
          const fresh = fetch(req).then((res) => {
            if (res.ok || res.type === 'opaque') cache.put(req, res.clone());
            return res;
          }).catch(() => hit);
          return hit || fresh;
        })
      )
    );
    return;
  }

  if (url.origin !== self.location.origin) return;

  // Page loads: network first so updates show, fall back to the cached shell offline
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(VERSION).then((cache) => cache.put('./index.html', copy));
        return res;
      }).catch(() => caches.match('./index.html'))
    );
    return;
  }

  // Everything else from this site: cache first, then network
  event.respondWith(
    caches.match(req).then((hit) => hit || fetch(req).then((res) => {
      if (res.ok) {
        const copy = res.clone();
        caches.open(VERSION).then((cache) => cache.put(req, copy));
      }
      return res;
    }))
  );
});
