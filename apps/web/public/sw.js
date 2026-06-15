const CACHE_VERSION = "breadify-v1"
const APP_SHELL_CACHE = `${CACHE_VERSION}:shell`
const ASSET_CACHE = `${CACHE_VERSION}:assets`
const OFFLINE_URL = "/offline"
const PRECACHE_URLS = [
  OFFLINE_URL,
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
  "/icons/icon-maskable-512x512.png",
]
const ASSET_DESTINATIONS = new Set([
  "font",
  "image",
  "script",
  "style",
  "worker",
])

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(APP_SHELL_CACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  )
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames
            .filter((cacheName) => !cacheName.startsWith(CACHE_VERSION))
            .map((cacheName) => caches.delete(cacheName))
        )
      )
      .then(() => self.clients.claim())
  )
})

self.addEventListener("fetch", (event) => {
  const { request } = event

  if (request.method !== "GET") {
    return
  }

  const url = new URL(request.url)

  if (url.origin !== self.location.origin) {
    return
  }

  if (request.mode === "navigate") {
    event.respondWith(handleNavigationRequest(request))
    return
  }

  if (ASSET_DESTINATIONS.has(request.destination)) {
    event.respondWith(handleAssetRequest(request))
  }
})

async function handleNavigationRequest(request) {
  try {
    const response = await fetch(request)
    const cache = await caches.open(APP_SHELL_CACHE)
    await cache.put(request, response.clone())

    return response
  } catch {
    const cachedResponse = await caches.match(request)
    const offlineResponse = await caches.match(OFFLINE_URL)

    return cachedResponse || offlineResponse || Response.error()
  }
}

async function handleAssetRequest(request) {
  const cachedResponse = await caches.match(request)

  if (cachedResponse) {
    void updateAssetCache(request)
    return cachedResponse
  }

  return updateAssetCache(request)
}

async function updateAssetCache(request) {
  try {
    const response = await fetch(request)

    if (response.ok) {
      const cache = await caches.open(ASSET_CACHE)
      await cache.put(request, response.clone())
    }

    return response
  } catch {
    return Response.error()
  }
}
