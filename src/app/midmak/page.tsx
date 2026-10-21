"use client";

// "ميدماك" (Midmak) — the client's consulting section. Intentionally an empty page
// with just the name for now; content will be added later.

import { useLang } from "@/lib/useLang";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";

export default function MidmakPage() {
  const [lang, setLang] = useLang();
  const isAr = lang === "ar";

  return (
    <div dir={isAr ? "rtl" : "ltr"} style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#f7f9fc", fontFamily: "'Cairo', sans-serif" }}>
      <SiteHeader lang={lang} onToggleLang={() => setLang((l) => (l === "ar" ? "en" : "ar"))} />

      <section style={{ background: "linear-gradient(120deg, #001f4d, #0051a2)", color: "#fff", padding: "70px 5%", textAlign: "center" }}>
        <h1 style={{ fontSize: "clamp(2.4rem, 6vw, 3.6rem)", fontWeight: 900, margin: 0 }}>{isAr ? "ميدماك" : "Midmak"}</h1>
      </section>

      <main style={{ flex: 1, minHeight: 320 }} />

      <SiteFooter lang={lang} />
    </div>
  );
}
