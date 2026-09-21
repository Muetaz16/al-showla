"use client";

import { useEffect, useState } from "react";

// Surfaces a connection-status pill and an "install app" button.
// NOTE: the service worker is intentionally DISABLED and actively unregistered.
// A cached SW was serving stale HTML after deploys, causing hydration mismatches
// and blank pages on returning devices. Self-healing beats offline caching here:
// unregistering + clearing caches recovers any stuck device on its next visit.
export default function PWAClient() {
  const [online, setOnline] = useState(true);
  const [showOffline, setShowOffline] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    // Remove any previously-installed service worker + its caches so no device
    // stays stuck on a stale cached build.
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.getRegistrations()
        .then((regs) => regs.forEach((r) => r.unregister()))
        .catch(() => {});
    }
    if (typeof caches !== "undefined") {
      caches.keys().then((keys) => keys.forEach((k) => caches.delete(k))).catch(() => {});
    }

    setOnline(navigator.onLine);
    const goOnline = () => { setOnline(true); setShowOffline(true); setTimeout(() => setShowOffline(false), 3000); };
    const goOffline = () => { setOnline(false); setShowOffline(true); };
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);

    const onBeforeInstall = (e: Event) => { e.preventDefault(); setDeferredPrompt(e); };
    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", () => { setInstalled(true); setDeferredPrompt(null); });

    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
    };
  }, []);

  const install = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
  };

  return (
    <>
      {/* Connection status pill — shows while offline, and briefly when reconnecting */}
      {showOffline && (
        <div dir="rtl" style={{
          position: "fixed", bottom: 16, insetInlineStart: 16, zIndex: 9999,
          background: online ? "#059669" : "#dc2626", color: "#fff",
          padding: "8px 16px", borderRadius: 999, fontSize: 13, fontWeight: 800,
          boxShadow: "0 6px 20px rgba(0,0,0,.3)", fontFamily: "'Cairo', sans-serif",
        }}>
          {online ? "✓ عاد الاتصال — تتم المزامنة" : "⚠ لا يوجد اتصال — وضع عدم الاتصال"}
        </div>
      )}


    </>
  );
}
