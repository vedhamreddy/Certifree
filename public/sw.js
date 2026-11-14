// CertiFree service worker.
// Pages: network first, falling back to the last copy, then to /offline.
// Built assets (/_next/static, icons): cache first, they never change.
// Personal data (API responses, account, sign-in and sync pages) is never cached.
const VERSION = "v3";
const PAGES = `certifree-pages-${VERSION}`;
const ASSETS = `certifree-assets-${VERSION}`;
const PRIVATE = ["/api/", "/auth/", "/account", "/sync"];
const PRECACHE = ["/", "/offline", "/saved", "/learning", "/certificates", "/courses", "/icon-192.png", "/icon.svg"];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches
      .open(PAGES)
      .then((c) => Promise.all(PRECACHE.map((u) => c.add(new Request(u, { cache: "reload" })).catch(() => {}))))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (e) =>
  e.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== PAGES && k !== ASSETS).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  ),
);

const cacheable = (res) => res.ok && res.type === "basic" && !/no-store|private/.test(res.headers.get("Cache-Control") || "");

self.addEventListener("fetch", (e) => {
  const req = e.request;
  const url = new URL(req.url);
  if (req.method !== "GET" || url.origin !== self.location.origin) return;
  if (PRIVATE.some((p) => url.pathname.startsWith(p))) return;

  if (url.pathname.startsWith("/_next/static/") || /\.(png|svg|ico|woff2?)$/.test(url.pathname)) {
    e.respondWith(
      caches.match(req).then(
        (hit) =>
          hit ||
          fetch(req).then((res) => {
            if (cacheable(res)) {
              const copy = res.clone();
              caches.open(ASSETS).then((c) => c.put(req, copy));
            }
            return res;
          }),
      ),
    );
    return;
  }

  e.respondWith(
    fetch(req)
      .then((res) => {
        if (cacheable(res)) {
          const copy = res.clone();
          caches.open(PAGES).then((c) => c.put(req, copy));
        }
        return res;
      })
      .catch(async () => {
        const hit = (await caches.match(req)) || (await caches.match(req, { ignoreSearch: true }));
        if (hit) return hit;
        if (req.mode === "navigate") return (await caches.match("/offline")) || Response.error();
        return Response.error();
      }),
  );
});
