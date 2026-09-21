"use client";

import { useEffect, useState } from "react";
import { getFaqItems } from "@/app/cms-actions";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";

type Lang = "ar" | "en";

export default function FaqPage() {
  const [lang, setLang] = useState<Lang>("ar");
  const [items, setItems] = useState<any[]>([]);
  const [open, setOpen] = useState<string | null>(null);

  useEffect(() => { getFaqItems().then(setItems); }, []);

  const dir = lang === "ar" ? "rtl" : "ltr";

  return (
    <div dir={dir} style={{ minHeight: "100vh", background: "#f7f9fc", fontFamily: "'Cairo', sans-serif" }}>
      <SiteHeader lang={lang} onToggleLang={() => setLang(l => l === "ar" ? "en" : "ar")} />
      <div style={{ maxWidth: 720, margin: "40px auto", padding: "0 5%" }}>
        <h1 style={{ fontSize: 28, fontWeight: 900, color: "#0f1c2e", marginBottom: 8 }}>{lang === "ar" ? "الأسئلة الشائعة" : "FAQ"}</h1>
        <p style={{ color: "#64748b", marginBottom: 32 }}>{lang === "ar" ? "إجابات على أكثر الأسئلة شيوعاً" : "Answers to common questions"}</p>
        {items.map(item => (
          <div key={item.id} style={{ background: "#fff", borderRadius: 12, marginBottom: 12, overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,.04)" }}>
            <button onClick={() => setOpen(open === item.id ? null : item.id)} style={{ width: "100%", padding: "16px 20px", background: "none", border: "none", textAlign: "start", fontWeight: 800, fontSize: 15, cursor: "pointer", color: "#0f1c2e", fontFamily: "inherit" }}>
              {open === item.id ? "▼" : "◀"} {lang === "ar" ? item.questionAr : item.questionEn}
            </button>
            {open === item.id && (
              <div style={{ padding: "0 20px 16px", color: "#3d5473", lineHeight: 1.7, fontSize: 14 }}>
                {lang === "ar" ? item.answerAr : item.answerEn}
              </div>
            )}
          </div>
        ))}
      </div>
      <SiteFooter lang={lang} />
    </div>
  );
}
