"use client";

import { useEffect, useState } from "react";

// Registers the service worker, surfaces a connection-status pill, and exposes
// an "install app" button when the browser offers the PWA install prompt (item 18, Unit 1).
export default function PWAClient() {
  const [online, setOnline] = useState(true);
  const [showOffline, setShowOffline] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
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

      {/* Install app button — only appears when the browser offers installation */}
      {deferredPrompt && !installed && (
        <button onClick={install} dir="rtl" style={{
          position: "fixed", bottom: 16, insetInlineEnd: 16, zIndex: 9999,
          background: "#0051a2", color: "#fff", border: "none",
          padding: "10px 18px", borderRadius: 999, fontSize: 13, fontWeight: 800,
          cursor: "pointer", boxShadow: "0 6px 20px rgba(0,81,162,.5)", fontFamily: "'Cairo', sans-serif",
        }}>
          📲 تثبيت التطبيق
        </button>
      )}
    </>
  );
}
