"use client";

import { useLang } from "@/lib/useLang";

export default function OfflinePage() {
  const [lang] = useLang();
  const isAr = lang === "ar";
  return (
    <div dir={isAr ? "rtl" : "ltr"} style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#001f4d", color: "#fff", fontFamily: "'Cairo', sans-serif", padding: 24, textAlign: "center" }}>
      <div style={{ maxWidth: 420 }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>📡</div>
        <h1 style={{ fontSize: 24, fontWeight: 900, marginBottom: 10 }}>{isAr ? "أنت غير متصل بالإنترنت" : "You're offline"}</h1>
        <p style={{ color: "rgba(255,255,255,.7)", lineHeight: 1.9, marginBottom: 24 }}>
          {isAr
            ? "يمكنك تصفّح الصفحات والمنتجات التي زرتها سابقاً أثناء اتصالك. ستُستأنف الخدمة الكاملة فور عودة الاتصال."
            : "You can still browse pages and products you visited while online. Full service resumes as soon as you're back online."}
        </p>
        <a href="/" style={{ display: "inline-block", background: "#0051a2", color: "#fff", padding: "12px 28px", borderRadius: 8, textDecoration: "none", fontWeight: 800 }}>
          {isAr ? "إعادة المحاولة" : "Try again"}
        </a>
      </div>
    </div>
  );
}
