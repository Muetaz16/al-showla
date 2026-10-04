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

// Consumption rates (per m²) from each product's datasheet, keyed by catalog product id.
// Fill these in as the datasheets arrive; products without a rate ask the user to enter it.
const CONSUMPTION_RATES: Record<string, number> = {};

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
    rateHint: "من الداتا شيت الخاصة بالمنتج", fromSheet: "حسب الداتا شيت",
    needRate: "أدخل معدل الاستهلاك من الداتا شيت لإكمال الحساب.",
    needed: "الكمية المطلوبة", packages: "عدد العبوات", viewProduct: "عرض المنتج",
    note: "النتائج تقديرية وتعتمد على المعطيات المدخلة، ولا تغني عن مراجعة القسم الفني والاعتماد الهندسي.",
    quote: "💬 تحويل النتيجة إلى طلب عرض سعر", browse: "تصفح المنتجات",
    perM2: "لكل م²", kg: "كجم", l: "لتر" },
  en: { title: "Building Materials Calculator", subtitle: "Choose the category, then the brand, then the product, and enter the area to get the quantity and number of packages",
    category: "Category", brand: "Brand", product: "Product", choose: "-- Select --",
    area: "Area (m²)", rate: "Consumption rate", waste: "Waste %", pkg: "Package size",
    rateHint: "from the product datasheet", fromSheet: "per datasheet",
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

  const effRate = parseFloat(rate) || 0;
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
    setRate(r ? String(r) : "");
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
                <a href={`/products?q=${encodeURIComponent(product.nameEn)}`} style={{ fontSize: 13, fontWeight: 700, color: "#0051a2" }}>{t.viewProduct}</a>
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
                  <label style={{ ...lbl, fontSize: 13 }}>{t.rate} ({unit} {t.perM2})</label>
                  <input type="number" min="0" step="0.01" value={rate} placeholder={t.fromSheet} onChange={(e) => setRate(e.target.value)} style={inp} />
                  <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>{t.rateHint}</div>
                </div>
                <div>
                  <label style={{ ...lbl, fontSize: 13 }}>{t.pkg} ({unit})</label>
                  <input type="number" min="0" step="0.1" value={pkg} onChange={(e) => setPkg(e.target.value)} style={inp} />
                </div>
              </div>

              {num > 0 && effRate === 0 && (
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
