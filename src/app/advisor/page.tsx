"use client";

import { useState, useRef, useEffect } from "react";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";

type Lang = "ar" | "en";
type Msg = { role: "user" | "assistant"; content: string; products?: { id: string; nameAr: string; nameEn: string }[] };

const T = {
  ar: {
    title: "المستشار الفني الذكي",
    subtitle: "اسأل عن الأنظمة والمنتجات المناسبة لمشروعك — مبني على كتالوج الشعلة الرائدة.",
    disclaimer: "المعلومات إرشادية ومبنية على الكتالوج؛ للاعتماد النهائي يرجى التأكد مع فريق المبيعات أو أوراق البيانات الفنية (TDS).",
    placeholder: "اكتب سؤالك الفني هنا...",
    send: "إرسال",
    quickLinks: "منتجات مقترحة:",
    suggestions: [
      "ما المناسب لعزل الحمامات؟",
      "أحتاج مادة لإصلاح تسرب تحت ضغط الماء",
      "ما الفرق بين أنظمة الجبس بورد؟",
      "أدوات قطع مناسبة للبلاط",
      "منتج لتشطيب الأرضيات",
      "مادة لاصقة للسيراميك الخارجي",
    ],
    greeting: "مرحباً! أنا المستشار الفني للشعلة الرائدة. صف لي مشروعك أو المشكلة وسأقترح المنتج والنظام المناسب.",
  },
  en: {
    title: "AI Technical Advisor",
    subtitle: "Ask about the right systems and products for your project — grounded in the Al-Showla catalog.",
    disclaimer: "Guidance is catalog-based; for final selection confirm with the sales team or the technical datasheets (TDS).",
    placeholder: "Type your technical question here...",
    send: "Send",
    quickLinks: "Suggested products:",
    suggestions: [
      "What suits bathroom waterproofing?",
      "I need a material to fix a leak under water pressure",
      "Difference between gypsum board systems?",
      "Cutting tools suitable for tiles",
      "A product for floor finishing",
      "Adhesive for exterior ceramic",
    ],
    greeting: "Hello! I'm Al-Showla's technical advisor. Describe your project or problem and I'll suggest the right product and system.",
  },
};

export default function AdvisorPage() {
  const [lang, setLang] = useState<Lang>("ar");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const t = T[lang];
  const isAr = lang === "ar";

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const send = async (text: string) => {
    const q = text.trim();
    if (!q || loading) return;
    const next: Msg[] = [...messages, { role: "user", content: q }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next.map(({ role, content }) => ({ role, content })), lang }),
      });
      const data = await res.json();
      setMessages([...next, { role: "assistant", content: data.reply, products: data.products }]);
    } catch {
      setMessages([...next, { role: "assistant", content: isAr ? "تعذّر الاتصال. حاول مجدداً." : "Connection failed. Try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div dir={isAr ? "rtl" : "ltr"} style={{ minHeight: "100vh", background: "#f7f9fc", fontFamily: "'Cairo', sans-serif", display: "flex", flexDirection: "column" }}>
      <SiteHeader lang={lang} onToggleLang={() => setLang((l) => (l === "ar" ? "en" : "ar"))} />

      <div style={{ maxWidth: 820, width: "100%", margin: "0 auto", padding: "28px 5% 0", flex: 1, display: "flex", flexDirection: "column" }}>
        <h1 style={{ fontSize: 26, fontWeight: 900, color: "#0f1c2e", marginBottom: 6, display: "flex", alignItems: "center", gap: 8 }}>
          <span>🔧</span> {t.title}
        </h1>
        <p style={{ color: "#64748b", fontSize: 14, marginBottom: 8 }}>{t.subtitle}</p>
        <div style={{ background: "#fff7ed", border: "1px solid #fed7aa", color: "#9a3412", fontSize: 12, borderRadius: 10, padding: "10px 14px", marginBottom: 16, lineHeight: 1.7 }}>
          ⚠️ {t.disclaimer}
        </div>

        {/* Chat window */}
        <div ref={scrollRef} style={{ flex: 1, minHeight: 320, maxHeight: "52vh", overflowY: "auto", background: "#fff", borderRadius: 16, padding: 18, boxShadow: "0 2px 16px rgba(0,0,0,.05)", display: "flex", flexDirection: "column", gap: 12 }}>
          {messages.length === 0 && (
            <div style={{ color: "#475569", fontSize: 14, background: "#f1f5f9", padding: 14, borderRadius: 12 }}>{t.greeting}</div>
          )}
          {messages.map((m, i) => (
            <div key={i} style={{ alignSelf: m.role === "user" ? "flex-start" : "flex-end", maxWidth: "85%" }}>
              <div style={{
                background: m.role === "user" ? "#0051a2" : "#f1f5f9",
                color: m.role === "user" ? "#fff" : "#0f1c2e",
                padding: "10px 14px", borderRadius: 14, fontSize: 14, lineHeight: 1.8, whiteSpace: "pre-wrap",
              }}>
                {m.content}
              </div>
              {m.products && m.products.length > 0 && (
                <div style={{ marginTop: 8 }}>
                  <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 700, marginBottom: 4 }}>{t.quickLinks}</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {m.products.map((p) => (
                      <a key={p.id} href={`/products?q=${encodeURIComponent(p.id)}`}
                        style={{ background: "#e8f2fc", color: "#0051a2", border: "1px solid #b6d4f5", borderRadius: 20, padding: "5px 12px", fontSize: 12, fontWeight: 700, textDecoration: "none" }}>
                        {isAr ? p.nameAr : p.nameEn} →
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div style={{ alignSelf: "flex-end", background: "#f1f5f9", padding: "12px 16px", borderRadius: 14, display: "flex", gap: 4 }}>
              {[0, 1, 2].map((d) => (
                <span key={d} style={{ width: 7, height: 7, borderRadius: "50%", background: "#94a3b8", animation: `adv-bounce 1.2s ${d * 0.2}s infinite ease-in-out` }} />
              ))}
            </div>
          )}
        </div>

        {/* Suggestions */}
        {messages.length === 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 14 }}>
            {t.suggestions.map((s) => (
              <button key={s} onClick={() => send(s)}
                style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 20, padding: "7px 14px", fontSize: 12.5, color: "#334155", cursor: "pointer", fontFamily: "inherit" }}>
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <form onSubmit={(e) => { e.preventDefault(); send(input); }}
          style={{ display: "flex", gap: 10, margin: "16px 0 28px", position: "sticky", bottom: 0 }}>
          <input value={input} onChange={(e) => setInput(e.target.value)} placeholder={t.placeholder}
            style={{ flex: 1, padding: "13px 16px", borderRadius: 12, border: "1px solid #cbd5e1", fontSize: 14, fontFamily: "inherit", outline: "none" }} />
          <button type="submit" disabled={loading || !input.trim()}
            style={{ padding: "13px 22px", background: loading || !input.trim() ? "#94a3b8" : "#0051a2", color: "#fff", border: "none", borderRadius: 12, fontWeight: 800, cursor: loading || !input.trim() ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
            {t.send}
          </button>
        </form>
      </div>

      <SiteFooter lang={lang} />
      <style>{`@keyframes adv-bounce { 0%,80%,100%{transform:translateY(0);opacity:.5} 40%{transform:translateY(-6px);opacity:1} }`}</style>
    </div>
  );
}
