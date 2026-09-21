"use client";

import { useState } from "react";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";

type Lang = "ar" | "en";

// Preset systems with default consumption rates (editable by the user). Real per-product
// rates come from the company's TDS; these presets are clearly marked as approximate.
const SYSTEMS = [
  { id: "gypsum", ar: "ألواح جبس", en: "Gypsum boards", rate: 1 / (1.2 * 2.4), rateLabelAr: "لوح لكل م²", rateLabelEn: "board / m²", unitAr: "لوح", unitEn: "board", pkg: 1 },
  { id: "paint", ar: "دهان", en: "Paint", rate: 0.1, rateLabelAr: "لتر لكل م²", rateLabelEn: "L / m²", unitAr: "لتر", unitEn: "L", pkg: 20 },
  { id: "waterproof", ar: "عزل مائي", en: "Waterproofing", rate: 1.5, rateLabelAr: "كجم لكل م²", rateLabelEn: "kg / m²", unitAr: "كجم", unitEn: "kg", pkg: 25 },
  { id: "tiles", ar: "بلاط / سيراميك", en: "Tiles / Ceramic", rate: 1, rateLabelAr: "م² لكل م²", rateLabelEn: "m² / m²", unitAr: "م²", unitEn: "m²", pkg: 1.5 },
  { id: "adhesive", ar: "مادة لاصقة", en: "Tile adhesive", rate: 4, rateLabelAr: "كجم لكل م²", rateLabelEn: "kg / m²", unitAr: "كجم", unitEn: "kg", pkg: 25 },
];

const T = {
  ar: { title: "حاسبة كميات مواد البناء", subtitle: "قدّر الكمية اللازمة حسب المساحة ومعدل الاستهلاك ونسبة الهالك", back: "→ الرئيسية",
    system: "النظام / المادة", area: "المساحة (م²)", rate: "معدل الاستهلاك", waste: "نسبة الهالك %", pkg: "حجم العبوة",
    result: "النتيجة التقديرية", needed: "الكمية المطلوبة", packages: "عدد العبوات", calc: "احسب",
    note: "النتائج تقديرية وتعتمد على المعطيات المدخلة، ولا تغني عن مراجعة القسم الفني والاعتماد الهندسي.",
    quote: "💬 تحويل النتيجة إلى طلب عرض سعر", browse: "تصفح المنتجات" },
  en: { title: "Building Materials Calculator", subtitle: "Estimate quantities by area, consumption rate and waste percentage", back: "← Home",
    system: "System / material", area: "Area (m²)", rate: "Consumption rate", waste: "Waste %", pkg: "Package size",
    result: "Estimated result", needed: "Required quantity", packages: "Packages", calc: "Calculate",
    note: "Results are approximate, based on the entered data, and do not replace technical-department review and engineering approval.",
    quote: "💬 Convert result to a quote request", browse: "Browse Products" },
};

export default function CalculatorPage() {
  const [lang, setLang] = useState<Lang>("ar");
  const [systemId, setSystemId] = useState("gypsum");
  const [area, setArea] = useState("");
  const [waste, setWaste] = useState("10");
  const t = T[lang];
  const dir = lang === "ar" ? "rtl" : "ltr";

  const sys = SYSTEMS.find((s) => s.id === systemId)!;
  const [rate, setRate] = useState<string>("");
  const [pkg, setPkg] = useState<string>("");

  const effRate = parseFloat(rate) || sys.rate;
  const effPkg = parseFloat(pkg) || sys.pkg;
  const num = parseFloat(area) || 0;
  const wastePct = parseFloat(waste) || 0;

  const required = num > 0 ? num * effRate * (1 + wastePct / 100) : 0;
  const packages = required > 0 && effPkg > 0 ? Math.ceil(required / effPkg) : 0;
  const unit = lang === "ar" ? sys.unitAr : sys.unitEn;

  const quoteHref = `https://wa.me/218948020200?text=${encodeURIComponent(
    `طلب عرض سعر — حاسبة الكميات:\nالنظام: ${sys.ar}\nالمساحة: ${num} م²\nالكمية التقديرية: ${required.toFixed(1)} ${sys.unitAr} (شامل هالك ${wastePct}%)\nعدد العبوات: ${packages}`,
  )}`;

  return (
    <div style={{ minHeight: "100vh", background: "var(--off)", fontFamily: "'Cairo', sans-serif" }} dir={dir}>
      <style>{`:root{--blue:#0051a2;--off:#f7f9fc;--text:#0f1c2e;} @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;800;900&display=swap');`}</style>
      <SiteHeader lang={lang} onToggleLang={() => setLang((l) => (l === "ar" ? "en" : "ar"))} />
      <div style={{ maxWidth: 600, margin: "40px auto", padding: "0 5%" }}>
        <h1 style={{ fontSize: 28, fontWeight: 900, color: "var(--text)", marginBottom: 8 }}>{t.title}</h1>
        <p style={{ color: "#64748b", marginBottom: 28 }}>{t.subtitle}</p>

        <div style={{ background: "#fff", borderRadius: 16, padding: 28, boxShadow: "0 4px 24px rgba(0,0,0,.06)" }}>
          <label style={{ display: "block", fontWeight: 700, marginBottom: 8 }}>{t.system}</label>
          <select value={systemId} onChange={(e) => { setSystemId(e.target.value); setRate(""); setPkg(""); }}
            style={{ width: "100%", padding: 12, borderRadius: 10, border: "1px solid #e2e8f0", marginBottom: 20, fontSize: 15 }}>
            {SYSTEMS.map((s) => <option key={s.id} value={s.id}>{lang === "ar" ? s.ar : s.en}</option>)}
          </select>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <label style={{ display: "block", fontWeight: 700, marginBottom: 8 }}>{t.area}</label>
              <input type="number" min="0" value={area} onChange={(e) => setArea(e.target.value)} style={inp} />
            </div>
            <div>
              <label style={{ display: "block", fontWeight: 700, marginBottom: 8 }}>{t.waste}</label>
              <input type="number" min="0" value={waste} onChange={(e) => setWaste(e.target.value)} style={inp} />
            </div>
            <div>
              <label style={{ display: "block", fontWeight: 700, marginBottom: 8, fontSize: 13 }}>{t.rate} ({lang === "ar" ? sys.rateLabelAr : sys.rateLabelEn})</label>
              <input type="number" min="0" step="0.01" value={rate} placeholder={String(sys.rate.toFixed(2))} onChange={(e) => setRate(e.target.value)} style={inp} />
            </div>
            <div>
              <label style={{ display: "block", fontWeight: 700, marginBottom: 8, fontSize: 13 }}>{t.pkg} ({unit})</label>
              <input type="number" min="0" step="0.1" value={pkg} placeholder={String(sys.pkg)} onChange={(e) => setPkg(e.target.value)} style={inp} />
            </div>
          </div>

          {required > 0 && (
            <div style={{ background: "#e8f2fc", borderRadius: 12, padding: 20, textAlign: "center", marginTop: 20 }}>
              <div style={{ fontSize: 13, color: "#64748b", marginBottom: 6 }}>{t.needed}</div>
              <div style={{ fontSize: 34, fontWeight: 900, color: "#0051a2" }}>{required.toFixed(1)} {unit}</div>
              <div style={{ fontSize: 14, color: "#64748b", marginTop: 8 }}>{t.packages}: <strong>{packages}</strong></div>
            </div>
          )}

          <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 18, lineHeight: 1.7 }}>ℹ️ {t.note}</p>

          {required > 0 && (
            <a href={quoteHref} target="_blank" rel="noopener noreferrer"
              style={{ display: "block", textAlign: "center", marginTop: 16, padding: 14, background: "#25D366", color: "#fff", borderRadius: 10, textDecoration: "none", fontWeight: 800 }}>
              {t.quote}
            </a>
          )}
          <a href="/products" style={{ display: "block", textAlign: "center", marginTop: 12, padding: 14, background: "#0051a2", color: "#fff", borderRadius: 10, textDecoration: "none", fontWeight: 800 }}>{t.browse}</a>
        </div>
      </div>
      <SiteFooter lang={lang} />
    </div>
  );
}

const inp = { width: "100%", padding: 12, borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 15, boxSizing: "border-box" as const };
