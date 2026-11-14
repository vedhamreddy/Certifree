// Network-first service worker: works offline for public pages you've already visited.
// Personal data (API responses, account, sign-in and sync pages) is never cached.
const CACHE = "certifree-v2";
const PRIVATE = ["/api/", "/auth/", "/account", "/sync"];
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) =>
  e.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  ),
);
self.addEventListener("fetch", (e) => {
  const req = e.request;
  const url = new URL(req.url);
  if (req.method !== "GET" || url.origin !== self.location.origin) return;
  if (PRIVATE.some((p) => url.pathname.startsWith(p))) return;
  e.respondWith(
    fetch(req)
      .then((res) => {
        const cc = res.headers.get("Cache-Control") || "";
        if (res.ok && res.type === "basic" && !/no-store|private/.test(cc)) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
        }
        return res;
      })
      .catch(() => caches.match(req).then((r) => r || Response.error())),
  );
});
