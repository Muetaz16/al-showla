"use client";

import { useMemo, useState } from "react";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import { PRODUCTS } from "@/lib/products";

type Lang = "ar" | "en";

// Calculator flow requested by the client: category → brand → product.
// Each calculator category maps to one or more catalog categoryIds.
const CALC_CATEGORIES = [
  { id: "chemicals", ar: "كيماويات البناء", en: "Construction Chemicals", catalogIds: ["waterproof"] },
  { id: "gypsum", ar: "حلول الجبسبورد", en: "Gypsum Board Solutions", catalogIds: ["gypsum"] },
];

// Consumption rates from each product's official datasheet, keyed by catalog product id.
// rate = kg per m² (or per m² per mm of thickness when perMm). min/max = datasheet range.
// Products not listed here ask the user to enter the rate from the datasheet.
type Rate = { rate: number; min?: number; max?: number; perMm?: boolean };
const CONSUMPTION_RATES: Record<string, Rate> = {
  "weber-003": { rate: 5, min: 3, max: 7 },        // webercol fix 401: 3–7 kg/m²
  "weber-006": { rate: 0.15 },                     // weberfloor eposil plus: 0.15 kg/m²
  "weber-009": { rate: 3, min: 2, max: 4 },        // weberdry 110 FX: 2–4 kg/m²
  "weber-010": { rate: 2, perMm: true },           // weberep 331 TX: 25 kg → 12.5 L
  "weber-011": { rate: 1.95, perMm: true },        // webertec 301: 25 kg → 12.5–13 L
  "weber-013": { rate: 1.3, perMm: true },         // weberep 360 FFR: 1.3 kg/m²/mm
  "weber-014": { rate: 5, min: 3, max: 7 },        // webercol plus: 3–7 kg/m²
  "weber-gyp-002": { rate: 0.28, min: 0.25, max: 0.31 }, // Gyproc Almomtaz 120: 3.2–4 m²/kg per coat
  "master-001": { rate: 0.43, min: 0.37, max: 0.5 },     // MasterBrace ADH 1414: 2–2.7 m²/kg
  "master-004": { rate: 1.85, perMm: true },       // MasterEmaco S 488: 1,850 kg/m³
  "master-005": { rate: 0.275 },                   // MasterEmaco 8100 AP: 0.275 kg/m² @ 40 µm
  "master-006": { rate: 1.95, perMm: true },       // MasterFlow 980: 30 kg → 15.2–15.6 L
  "master-007": { rate: 1.8, perMm: true },        // MasterSeal 550: 1.8 kg/m² per mm
  "master-008": { rate: 1.8, perMm: true },
};

// Default waste % per calculator category (client to confirm the insulation figure).
const DEFAULT_WASTE: Record<string, number> = { chemicals: 10, gypsum: 10 };

// Package size + unit parsed from names like "30كيلو", "12kg", "25لتر", "(400 ml)".
function parsePackage(name: string): { size: number; liquid: boolean } | null {
  const m = name.match(/(\d+(?:\.\d+)?)\s*(كيلو|كجم|kg|لتر|ltr|l\b|ml)/i);
  if (!m) return null;
  const n = parseFloat(m[1]);
  const u = m[2].toLowerCase();
  if (u === "ml") return { size: n / 1000, liquid: true };
  return { size: n, liquid: u === "لتر" || u === "ltr" || u === "l" };
}

const T = {
  ar: { title: "حاسبة كميات مواد البناء", subtitle: "اختر القسم ثم الشركة ثم المنتج، وأدخل المساحة لمعرفة الكمية وعدد العبوات",
    category: "القسم", brand: "الشركة", product: "المنتج", choose: "-- اختر --",
    area: "المساحة (م²)", rate: "معدل الاستهلاك", waste: "نسبة الهالك %", pkg: "حجم العبوة",
    rateHint: "من الداتا شيت الخاصة بالمنتج", fromSheet: "حسب الداتا شيت", sheetRange: "حسب الداتا شيت:",
    thickness: "السماكة (ملم)", perMm: "لكل م² لكل 1 ملم", datasheet: "📄 الداتا شيت",
    needRate: "أدخل معدل الاستهلاك من الداتا شيت لإكمال الحساب.",
    needed: "الكمية المطلوبة", packages: "عدد العبوات", viewProduct: "عرض المنتج",
    note: "النتائج تقديرية وتعتمد على المعطيات المدخلة، ولا تغني عن مراجعة القسم الفني والاعتماد الهندسي.",
    quote: "💬 تحويل النتيجة إلى طلب عرض سعر", browse: "تصفح المنتجات",
    perM2: "لكل م²", kg: "كجم", l: "لتر" },
  en: { title: "Building Materials Calculator", subtitle: "Choose the category, then the brand, then the product, and enter the area to get the quantity and number of packages",
    category: "Category", brand: "Brand", product: "Product", choose: "-- Select --",
    area: "Area (m²)", rate: "Consumption rate", waste: "Waste %", pkg: "Package size",
    rateHint: "from the product datasheet", fromSheet: "per datasheet", sheetRange: "Datasheet:",
    thickness: "Thickness (mm)", perMm: "per m² per 1 mm", datasheet: "📄 Datasheet",
    needRate: "Enter the consumption rate from the datasheet to complete the calculation.",
    needed: "Required quantity", packages: "Packages", viewProduct: "View product",
    note: "Results are approximate, based on the entered data, and do not replace technical-department review and engineering approval.",
    quote: "💬 Convert result to a quote request", browse: "Browse Products",
    perM2: "per m²", kg: "kg", l: "L" },
};

export default function CalculatorPage() {
  const [lang, setLang] = useState<Lang>("ar");
  const [catId, setCatId] = useState("");
  const [brand, setBrand] = useState("");
  const [productId, setProductId] = useState("");
  const [area, setArea] = useState("");
  const [waste, setWaste] = useState("10");
  const [rate, setRate] = useState("");
  const [pkg, setPkg] = useState("");
  const [thickness, setThickness] = useState("");
  const t = T[lang];
  const isAr = lang === "ar";

  const cat = CALC_CATEGORIES.find((c) => c.id === catId);
  const catProducts = useMemo(() => (cat ? PRODUCTS.filter((p) => cat.catalogIds.includes(p.categoryId)) : []), [cat]);
  const brands = useMemo(() => [...new Set(catProducts.map((p) => p.brand))].sort(), [catProducts]);
  const brandProducts = useMemo(() => catProducts.filter((p) => p.brand === brand), [catProducts, brand]);
  const product = brandProducts.find((p) => p.id === productId);
  const parsed = product ? parsePackage(product.nameEn) || parsePackage(product.nameAr) : null;
  const unit = parsed?.liquid ? t.l : t.kg;
  const pName = product ? (isAr ? product.nameAr : product.nameEn) : "";

  const rateInfo = product ? CONSUMPTION_RATES[product.id] : undefined;
  const perMm = !!rateInfo?.perMm;
  const thick = parseFloat(thickness) || 0;
  const effRate = (parseFloat(rate) || 0) * (perMm ? thick : 1);
  const effPkg = parseFloat(pkg) || 0;
  const num = parseFloat(area) || 0;
  const wastePct = parseFloat(waste) || 0;
  const required = product && num > 0 && effRate > 0 ? num * effRate * (1 + wastePct / 100) : 0;
  const packages = required > 0 && effPkg > 0 ? Math.ceil(required / effPkg) : 0;

  const pickCategory = (id: string) => {
    setCatId(id); setBrand(""); setProductId(""); setRate(""); setPkg("");
    setWaste(String(DEFAULT_WASTE[id] ?? 10));
  };
  const pickBrand = (b: string) => { setBrand(b); setProductId(""); setRate(""); setPkg(""); };
  const pickProduct = (id: string) => {
    setProductId(id);
    const p = PRODUCTS.find((x) => x.id === id);
    const r = CONSUMPTION_RATES[id];
    setRate(r ? String(r.rate) : "");
    setThickness(r?.perMm ? "1" : "");
    const pk = p ? parsePackage(p.nameEn) || parsePackage(p.nameAr) : null;
    setPkg(pk ? String(pk.size) : "");
  };

  const quoteHref = `https://wa.me/218948020200?text=${encodeURIComponent(
    `طلب عرض سعر — حاسبة الكميات:\nالقسم: ${cat?.ar ?? ""}\nالشركة: ${brand}\nالمنتج: ${product?.nameAr ?? ""}\nالمساحة: ${num} م²\nالكمية التقديرية: ${required.toFixed(1)} ${parsed?.liquid ? "لتر" : "كجم"} (شامل هالك ${wastePct}%)` +
      (packages ? `\nعدد العبوات: ${packages}` : ""),
  )}`;

  return (
    <div style={{ minHeight: "100vh", background: "var(--off)", fontFamily: "'Cairo', sans-serif" }} dir={isAr ? "rtl" : "ltr"}>
      <style>{`:root{--blue:#0051a2;--off:#f7f9fc;--text:#0f1c2e;} @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;800;900&display=swap');`}</style>
      <SiteHeader lang={lang} onToggleLang={() => setLang((l) => (l === "ar" ? "en" : "ar"))} />
      <div style={{ maxWidth: 640, margin: "40px auto", padding: "0 5%" }}>
        <h1 style={{ fontSize: 28, fontWeight: 900, color: "var(--text)", marginBottom: 8 }}>{t.title}</h1>
        <p style={{ color: "#64748b", marginBottom: 28 }}>{t.subtitle}</p>

        <div style={{ background: "#fff", borderRadius: 16, padding: 28, boxShadow: "0 4px 24px rgba(0,0,0,.06)" }}>
          {/* Step 1 — category */}
          <Step n={1} label={t.category} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
            {CALC_CATEGORIES.map((c) => (
              <button key={c.id} onClick={() => pickCategory(c.id)}
                style={{ padding: "14px 10px", borderRadius: 10, cursor: "pointer", fontFamily: "inherit", fontSize: 15, fontWeight: 800,
                  border: catId === c.id ? "2px solid #0051a2" : "1px solid #e2e8f0",
                  background: catId === c.id ? "#e8f2fc" : "#fff", color: catId === c.id ? "#0051a2" : "var(--text)" }}>
                {isAr ? c.ar : c.en}
              </button>
            ))}
          </div>

          {/* Step 2 — brand */}
          <Step n={2} label={t.brand} />
          <select value={brand} disabled={!cat} onChange={(e) => pickBrand(e.target.value)} style={{ ...inp, marginBottom: 20 }}>
            <option value="">{t.choose}</option>
            {brands.map((b) => <option key={b} value={b}>{b}</option>)}
          </select>

          {/* Step 3 — product */}
          <Step n={3} label={t.product} />
          <select value={productId} disabled={!brand} onChange={(e) => pickProduct(e.target.value)} style={{ ...inp, marginBottom: 20 }}>
            <option value="">{t.choose}</option>
            {brandProducts.map((p) => <option key={p.id} value={p.id}>{isAr ? p.nameAr : p.nameEn}</option>)}
          </select>

          {product && (
            <>
              <div style={{ display: "flex", gap: 14, alignItems: "center", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 12, padding: 12, marginBottom: 20 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={product.imageUrl} alt="" style={{ width: 64, height: 64, objectFit: "contain", background: "#fff", borderRadius: 8 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800 }}>{pName}</div>
                  <div style={{ fontSize: 13, color: "#64748b" }}>{product.brand}</div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-end" }}>
                  <a href={`/products?q=${encodeURIComponent(product.nameEn)}`} style={{ fontSize: 13, fontWeight: 700, color: "#0051a2" }}>{t.viewProduct}</a>
                  {product.datasheetUrl && <a href={product.datasheetUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, fontWeight: 700, color: "#0051a2" }}>{t.datasheet} ↗</a>}
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label style={lbl}>{t.area}</label>
                  <input type="number" min="0" value={area} onChange={(e) => setArea(e.target.value)} style={inp} />
                </div>
                <div>
                  <label style={lbl}>{t.waste}</label>
                  <input type="number" min="0" value={waste} onChange={(e) => setWaste(e.target.value)} style={inp} />
                </div>
                <div>
                  <label style={{ ...lbl, fontSize: 13 }}>{t.rate} ({unit} {perMm ? t.perMm : t.perM2})</label>
                  <input type="number" min="0" step="0.01" value={rate} placeholder={t.fromSheet} onChange={(e) => setRate(e.target.value)} style={inp} />
                  <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>
                    {rateInfo?.min != null && rateInfo?.max != null ? `${t.sheetRange} ${rateInfo.min}–${rateInfo.max}` : t.rateHint}
                  </div>
                </div>
                {perMm && (
                  <div>
                    <label style={{ ...lbl, fontSize: 13 }}>{t.thickness}</label>
                    <input type="number" min="0" step="0.5" value={thickness} onChange={(e) => setThickness(e.target.value)} style={inp} />
                  </div>
                )}
                <div>
                  <label style={{ ...lbl, fontSize: 13 }}>{t.pkg} ({unit})</label>
                  <input type="number" min="0" step="0.1" value={pkg} onChange={(e) => setPkg(e.target.value)} style={inp} />
                </div>
              </div>

              {num > 0 && effRate === 0 && !(perMm && !thick) && (
                <div style={{ background: "#fef3c7", color: "#b45309", borderRadius: 10, padding: 12, marginTop: 16, fontSize: 14, fontWeight: 700 }}>{t.needRate}</div>
              )}

              {required > 0 && (
                <div style={{ background: "#e8f2fc", borderRadius: 12, padding: 20, textAlign: "center", marginTop: 20 }}>
                  <div style={{ fontSize: 13, color: "#64748b", marginBottom: 6 }}>{t.needed}</div>
                  <div style={{ fontSize: 34, fontWeight: 900, color: "#0051a2" }}>{required.toFixed(1)} {unit}</div>
                  {packages > 0 && <div style={{ fontSize: 14, color: "#64748b", marginTop: 8 }}>{t.packages}: <strong>{packages}</strong></div>}
                </div>
              )}
            </>
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

function Step({ n, label }: { n: number; label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
      <span style={{ width: 24, height: 24, borderRadius: "50%", background: "#0051a2", color: "#fff", fontSize: 13, fontWeight: 800, display: "grid", placeItems: "center" }}>{n}</span>
      <span style={{ fontWeight: 700 }}>{label}</span>
    </div>
  );
}

const inp = { width: "100%", padding: 12, borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 15, boxSizing: "border-box" as const, fontFamily: "inherit" };
const lbl = { display: "block", fontWeight: 700, marginBottom: 8 } as const;
