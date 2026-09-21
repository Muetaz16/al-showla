// Service worker intentionally DISABLED.
// A caching SW was serving stale HTML after deploys (hydration mismatches / blank
// pages). This self-destructing stub replaces it: any browser that still has the old
// worker registered will fetch this on its update check, activate it, unregister
// itself, and clear all caches — restoring normal network loading.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      try {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      } catch {}
      await self.registration.unregister();
      const clients = await self.clients.matchAll();
      clients.forEach((c) => c.navigate(c.url));
    })()
  );
});
