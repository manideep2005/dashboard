const CACHE_NAME = "weatherai-v2";
const PRECACHE_URLS = ["/login"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle same-origin http/https GET requests
  if (request.method !== "GET") return;
  if (url.protocol !== "https:" && url.protocol !== "http:") return;
  if (url.origin !== self.location.origin) return;

  // Never intercept: API routes, auth, _next/static (dev HMR), _next/webpack, _next/data
  if (
    url.pathname.startsWith("/api/") ||
    url.pathname.startsWith("/auth/") ||
    url.pathname.startsWith("/_next/") ||
    url.pathname.includes("__nextjs") ||
    url.pathname.includes("webpack")
  ) {
    return;
  }

  // For navigation and static assets only — network-first with cache fallback
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response && response.status === 200 && response.type === "basic") {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      })
      .catch(() =>
        caches.match(request).then(
          (cached) => cached || new Response("Offline", { status: 503, headers: { "Content-Type": "text/plain" } })
        )
      )
  );
});
