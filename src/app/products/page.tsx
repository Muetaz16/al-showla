"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import {
  CATEGORIES, CURRENCY_RATES, CURRENCY_SYMBOLS,
  formatPrice, searchProducts, filterProducts, unitLabel, displayBrand,
  type Currency, type Product,
} from "@/lib/products";
import { getProducts, getFavorites, toggleFavorite } from "@/app/actions";
import { SiteHeader } from "@/components/SiteChrome";
import { RestockAlertModal } from "@/components/RestockAlertModal";
import { logSearch, incrementProductView } from "@/app/cms-actions";
import { addToCart, getCartCount, getCart } from "@/lib/cart";
import { getSession } from "next-auth/react";

type Lang = "ar" | "en";

const T = {
  ar: {
    title: "كتالوج المنتجات",
    subtitle: "تصفح مجموعتنا الكاملة من مواد البناء عالية الجودة",
    searchPlaceholder: "ابحث عن منتج، علامة تجارية...",
    results: "نتيجة",
    noResults: "لا توجد نتائج",
    noResultsSub: "جرب البحث بكلمات أخرى أو اختر فئة مختلفة",
    inStock: "متوفر",
    outOfStock: "غير متوفر",
    newTag: "جديد",
    featured: "مميز",
    addToCart: "أضف للطلب",
    compare: "قارن",
    compareTitle: "مقارنة المنتجات",
    compareBtn: "قارن الآن",
    clearCompare: "إلغاء",
    compareMax: "يمكن مقارنة 3 منتجات كحد أقصى",
    compareSameCat: "لا يمكن المقارنة إلا بين منتجات من نفس القسم",
    compareEmpty: "اختر منتجين على الأقل للمقارنة",
    currency: "العملة",
    sortBy: "ترتيب حسب",
    sortDefault: "الافتراضي",
    sortPriceAsc: "السعر: من الأقل",
    sortPriceDesc: "السعر: من الأعلى",
    sortRating: "التقييم",
    sortNewest: "الأحدث",
    certificates: "شهادات الجودة",
    specs: "المواصفات",
    brand: "العلامة التجارية",
    price: "السعر",
    rating: "التقييم",
    stock: "التوفر",
    category: "الفئة",
    backToHome: "→ الرئيسية",
    viewDetail: "عرض التفاصيل",
    reviews: "تقييم",
    requestQuote: "اطلب عرض سعر",
    requestSample: "اطلب عينة",
    compareClose: "إغلاق المقارنة",
    certTitle: "شهادات المطابقة والجودة",
    certIssuer: "الجهة المانحة",
    certYear: "سنة الإصدار",
    downloadCert: "تحميل الشهادة",
    code: "كود المنتج",
    packageUnit: "العبوة / الوحدة",
    techConsult: "طلب استشارة فنية",
    dataNote: "البيانات المعروضة مستمدة من المصنّع، وتُعرض فقط الحقول المتوفرة رسمياً للمنتج.",
  },
  en: {
    title: "Products Catalog",
    subtitle: "Browse our complete collection of premium building materials",
    searchPlaceholder: "Search product, brand...",
    results: "results",
    noResults: "No results found",
    noResultsSub: "Try different keywords or select another category",
    inStock: "In Stock",
    outOfStock: "Out of Stock",
    newTag: "New",
    featured: "Featured",
    addToCart: "Add to Order",
    compare: "Compare",
    compareTitle: "Product Comparison",
    compareBtn: "Compare Now",
    clearCompare: "Clear",
    compareMax: "Maximum 3 products can be compared",
    compareSameCat: "You can only compare products from the same category",
    compareEmpty: "Select at least 2 products to compare",
    currency: "Currency",
    sortBy: "Sort by",
    sortDefault: "Default",
    sortPriceAsc: "Price: Low to High",
    sortPriceDesc: "Price: High to Low",
    sortRating: "Rating",
    sortNewest: "Newest",
    certificates: "Quality Certificates",
    specs: "Specifications",
    brand: "Brand",
    price: "Price",
    rating: "Rating",
    stock: "Availability",
    category: "Category",
    backToHome: "← Home",
    viewDetail: "View Details",
    reviews: "reviews",
    requestQuote: "Request Quote",
    requestSample: "Request Sample",
    compareClose: "Close Comparison",
    certTitle: "Compliance & Quality Certificates",
    certIssuer: "Issuer",
    certYear: "Year",
    downloadCert: "Download Certificate",
    code: "Product Code",
    packageUnit: "Package / Unit",
    techConsult: "Request Technical Consultation",
    dataNote: "Displayed data is sourced from the manufacturer; only fields officially available for the product are shown.",
  },
};

function StarRating({ rating, count, lang }: { rating: number; count: number; lang: Lang }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <div style={{ display: "flex", gap: 1 }}>
        {[1, 2, 3, 4, 5].map((s) => (
          <span key={s} style={{ color: s <= Math.round(rating) ? "#f59e0b" : "#e2e8f0", fontSize: 13 }}>★</span>
        ))}
      </div>
      <span style={{ fontSize: 11, color: "var(--gray)" }}>({count} {T[lang].reviews})</span>
    </div>
  );
}

function CertBadge({ cert, lang }: { cert: { nameAr: string; nameEn: string; issuer?: string; year?: number }; lang: Lang }) {
  return (
    <div style={{
      background: "linear-gradient(135deg, #e8f2fc, #d0e6f8)", border: "1px solid #0051a2",
      borderRadius: 4, padding: "4px 10px", display: "inline-flex", alignItems: "center",
      gap: 6, fontSize: 11, fontWeight: 700, color: "#003578",
    }}>
      <span>🏅</span>
      <span>{lang === "ar" ? cert.nameAr : cert.nameEn}</span>
    </div>
  );
}

// ──────────────────────────────────────────────────────
//  PRODUCT CARD
// ──────────────────────────────────────────────────────
function ProductCard({
  product, lang, currency, onCompare, inCompare, compareDisabled,
  isFavorite, onToggleFavorite, onViewDetails,
}: {
  product: Product; lang: Lang; currency: Currency;
  onCompare: (p: Product) => void; inCompare: boolean; compareDisabled: boolean;
  isFavorite?: boolean; onToggleFavorite?: (p: Product) => void;
  onViewDetails: (p: Product) => void;
}) {
  const t = T[lang];
  const [showCerts, setShowCerts] = useState(false);
  const [added, setAdded] = useState(false);
  const [showRestock, setShowRestock] = useState(false);

  // Availability is derived from real stock count when it exists; otherwise falls back
  // to the inStock flag. Keeps the displayed status tied to inventory.
  const available = product.stockCount != null ? product.stockCount > 0 : product.inStock;

  const handleAdd = () => {
    addToCart(product);
    window.dispatchEvent(new Event("storage"));
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <div className="pcard" style={{
      background: "var(--white)", border: "1.5px solid var(--gray-light)",
      display: "flex", flexDirection: "column", position: "relative",
      transition: "transform .3s, box-shadow .3s", overflow: "hidden",
    }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.transform = "translateY(-4px)";
        (e.currentTarget as HTMLElement).style.boxShadow = "0 12px 40px rgba(0,81,162,.14)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.transform = "none";
        (e.currentTarget as HTMLElement).style.boxShadow = "none";
      }}
    >
      {/* Badges */}
      <div style={{ position: "absolute", top: 10, insetInlineStart: 10, zIndex: 3, display: "flex", flexDirection: "column", gap: 4 }}>
        {product.isNew && (
          <span style={{ background: "#10b981", color: "#fff", fontSize: 9, fontWeight: 800, padding: "3px 8px", letterSpacing: ".06em" }}>{t.newTag}</span>
        )}
        {product.isFeatured && (
          <span style={{ background: "#f59e0b", color: "#fff", fontSize: 9, fontWeight: 800, padding: "3px 8px", letterSpacing: ".06em" }}>{t.featured}</span>
        )}
      </div>
      {/* Stock badge */}
      <div style={{ position: "absolute", top: 10, insetInlineEnd: 10, zIndex: 3 }}>
        <span style={{
          background: available ? "rgba(16,185,129,.12)" : "rgba(239,68,68,.12)",
          color: available ? "#059669" : "#dc2626",
          border: `1px solid ${available ? "#059669" : "#dc2626"}`,
          fontSize: 9, fontWeight: 800, padding: "3px 8px",
        }}>{available ? t.inStock : t.outOfStock}</span>
      </div>

      {/* Favorite badge */}
      {onToggleFavorite && (
        <button 
          onClick={(e) => { e.preventDefault(); onToggleFavorite(product); }}
          style={{
            position: "absolute", top: 40, insetInlineEnd: 10, zIndex: 3,
            background: "rgba(255,255,255,0.9)", border: "none",
            borderRadius: "50%", width: 32, height: 32,
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            fontSize: 18, color: isFavorite ? "#ef4444" : "#9ca3af",
            transition: "0.2s"
          }}>
          {isFavorite ? "❤️" : "🤍"}
        </button>
      )}

      {/* Image */}
      <div style={{ position: "relative", aspectRatio: "16/9", overflow: "hidden", background: "#f0f6fd" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={product.imageUrl || "/placeholder-product.svg"} alt={lang === "ar" ? product.nameAr : product.nameEn}
          loading="lazy" decoding="async"
          style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform .5s" }}
          onError={(e) => {
            const img = e.target as HTMLImageElement;
            if (img.src.indexOf("/placeholder-product.svg") === -1) img.src = "/placeholder-product.svg";
          }}
          onMouseEnter={(e) => { (e.target as HTMLElement).style.transform = "scale(1.06)"; }}
          onMouseLeave={(e) => { (e.target as HTMLElement).style.transform = "none"; }} />
        {/* Brand overlay — hidden when the real manufacturer is unknown (no "General") */}
        {displayBrand(product) && (
          <div style={{
            position: "absolute", bottom: 8, insetInlineStart: 8,
            background: "rgba(0,31,77,.85)", color: "#fff",
            fontSize: 10, fontWeight: 800, padding: "3px 10px", letterSpacing: ".04em",
          }}>{displayBrand(product)}</div>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: "16px", flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
        <div>
          <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--blue)", marginBottom: 4 }}>
            {product.categoryId.toUpperCase()}
          </div>
          <h3 style={{ fontSize: 14, fontWeight: 800, color: "var(--text)", lineHeight: 1.35, margin: 0 }}>
            {lang === "ar" ? product.nameAr : product.nameEn}
          </h3>
        </div>

        <p style={{ fontSize: 12, lineHeight: 1.7, color: "var(--text2)", margin: 0, flexGrow: 1 }}>
          {lang === "ar" ? product.descriptionAr : product.descriptionEn}
        </p>

        <StarRating rating={product.rating} count={product.reviewCount} lang={lang} />

        {/* Certificates */}
        {product.certificates.length > 0 && (
          <div>
            <button onClick={() => setShowCerts(!showCerts)}
              style={{
                background: "none", border: "none", cursor: "pointer",
                fontSize: 11, fontWeight: 700, color: "var(--blue)",
                display: "flex", alignItems: "center", gap: 5, padding: 0,
              }}>
              🏅 {t.certificates} ({product.certificates.length})
              <span style={{ transition: "transform .2s", transform: showCerts ? "rotate(180deg)" : "none", display: "inline-block" }}>▾</span>
            </button>
            {showCerts && (
              <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 6 }}>
                {product.certificates.map((c, i) => <CertBadge key={i} cert={c} lang={lang} />)}
              </div>
            )}
          </div>
        )}

        {/* Separator */}
        <div style={{ borderTop: "1px solid var(--gray-light)", paddingTop: 12 }}></div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 6 }}>
          {available ? (
            <button onClick={handleAdd}
              style={{
                flex: 1, background: added ? "#059669" : "var(--blue)",
                color: "#fff", border: "none", padding: "10px 12px",
                fontSize: 12, fontWeight: 700, cursor: "pointer",
                transition: "all .25s", fontFamily: "inherit",
              }}>
              {added ? "✓" : t.addToCart}
            </button>
          ) : (
            <button onClick={() => setShowRestock(true)}
              style={{
                flex: 1, background: "#f59e0b", color: "#fff", border: "none", padding: "10px 12px",
                fontSize: 12, fontWeight: 700, cursor: "pointer",
                transition: "all .25s", fontFamily: "inherit",
              }}>
              🔔 {lang === "ar" ? "أعلمني عند التوفر" : "Notify me"}
            </button>
          )}
          <a
            href={`https://wa.me/218948020200?text=${encodeURIComponent(`مرحباً، أود الاستفسار عن المنتج:\nالاسم: ${product.nameAr}\nالكود: ${product.id}\nالرابط: ${typeof window !== "undefined" ? window.location.origin + "/products" : ""}`)}`}
            target="_blank" rel="noopener noreferrer" title="طلب عبر واتساب" aria-label="طلب عبر واتساب"
            style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              padding: "10px 12px", background: "#25D366", color: "#fff",
              textDecoration: "none", fontSize: 14, fontWeight: 700,
            }}>
            💬
          </a>
          <button onClick={() => onViewDetails(product)}
            style={{
              padding: "10px", border: "1.5px solid var(--blue)",
              background: "transparent", color: "var(--blue)",
              fontSize: 12, fontWeight: 700, cursor: "pointer",
            }}>
            {t.viewDetail}
          </button>
          <button onClick={() => onCompare(product)} disabled={compareDisabled && !inCompare}
            style={{
              padding: "10px 12px", border: `1.5px solid ${inCompare ? "var(--accent)" : "var(--blue)"}`,
              background: inCompare ? "var(--accent)" : "transparent",
              color: inCompare ? "#fff" : "var(--blue)",
              fontSize: 12, fontWeight: 700, cursor: compareDisabled && !inCompare ? "not-allowed" : "pointer",
              transition: "all .25s", whiteSpace: "nowrap", fontFamily: "inherit",
            }}>
            {t.compare}
          </button>
        </div>
      </div>
      {showRestock && (
        <RestockAlertModal product={product} lang={lang} onClose={() => setShowRestock(false)} />
      )}
    </div>
  );
}

// ──────────────────────────────────────────────────────
//  SMART SPEC ENGINE - generates rich specs from product data
// ──────────────────────────────────────────────────────
function getDetailedSpecs(p: Product, lang: Lang): Record<string, string> {
  const n = p.nameAr.toLowerCase();
  const cat = p.categoryId;
  const isAr = lang === "ar";

  // ── Waterproofing ──
  if (cat === "waterproof" || n.includes("عازل") || n.includes("سيل") || n.includes("ماء")) {
    if (n.includes("107") || n.includes("سيكاتوب")) return {
      [isAr ? "معدل التغطية" : "Coverage Rate"]: isAr ? "~1.5 كغ/م² / 2 طبقة" : "~1.5 kg/m² / 2 coats",
      [isAr ? "سماكة الطبقة" : "Layer Thickness"]: isAr ? "1.5 – 2.0 مم" : "1.5 – 2.0 mm",
      [isAr ? "وقت الجفاف (سطحي)" : "Surface Dry Time"]: isAr ? "2 – 4 ساعات" : "2 – 4 hours",
      [isAr ? "وقت الجفاف الكامل" : "Full Cure Time"]: isAr ? "7 أيام" : "7 days",
      [isAr ? "درجة حرارة التطبيق" : "Application Temp"]: isAr ? "+5°م إلى +35°م" : "+5°C to +35°C",
      [isAr ? "مقاومة الضغط المائي" : "Water Pressure"]: isAr ? "تحمّل حتى 7 بار" : "Up to 7 bar",
      [isAr ? "الاستخدام الأمثل" : "Best Use"]: isAr ? "حمامات، خزانات، أسقف" : "Bathrooms, tanks, roofs",
      [isAr ? "طريقة التطبيق" : "Application"]: isAr ? "فرشاة، رولة، رش" : "Brush, roller, spray",
      [isAr ? "مقاومة الأشعة فوق بنفسجية" : "UV Resistance"]: isAr ? "محدودة (يحتاج حماية)" : "Limited (needs overcoat)",
      [isAr ? "الصلاحية في العبوة" : "Shelf Life"]: isAr ? "12 شهراً في مكان جاف" : "12 months in dry storage",
    };
    if (n.includes("سيكامباكت") || n.includes("150")) return {
      [isAr ? "وقت التجمد" : "Setting Time"]: isAr ? "30 – 120 ثانية (سريع)" : "30 – 120 seconds (fast)",
      [isAr ? "مقاومة الضغط" : "Pressure Resistance"]: isAr ? "تحمّل حتى 5 بار" : "Up to 5 bar",
      [isAr ? "طريقة التطبيق" : "Application"]: isAr ? "حقن يدوي / ضخ" : "Manual injection / pump",
      [isAr ? "معدل الاستهلاك" : "Consumption"]: isAr ? "~0.5 – 1 لتر/م²" : "~0.5 – 1 L/m²",
      [isAr ? "درجة حرارة التطبيق" : "App. Temp"]: isAr ? "0°م إلى +35°م" : "0°C to +35°C",
      [isAr ? "الاستخدام الأمثل" : "Best Use"]: isAr ? "إصلاح التسربات تحت ضغط" : "Fixing active leaks under pressure",
      [isAr ? "التوافق مع الخرسانة" : "Concrete Compatibility"]: isAr ? "ممتاز" : "Excellent",
      [isAr ? "مقاومة الكيماويات" : "Chemical Resistance"]: isAr ? "متوسطة" : "Moderate",
      [isAr ? "الصلاحية في العبوة" : "Shelf Life"]: isAr ? "12 شهراً" : "12 months",
    };
    return {
      [isAr ? "معدل التغطية" : "Coverage Rate"]: isAr ? "~1.2 – 2.0 كغ/م²" : "~1.2 – 2.0 kg/m²",
      [isAr ? "سماكة الطبقة" : "Layer Thickness"]: isAr ? "1.0 – 2.0 مم" : "1.0 – 2.0 mm",
      [isAr ? "وقت الجفاف" : "Drying Time"]: isAr ? "2 – 6 ساعات" : "2 – 6 hours",
      [isAr ? "درجة حرارة التطبيق" : "App. Temp"]: isAr ? "+5°م إلى +35°م" : "+5°C to +35°C",
      [isAr ? "الاستخدام الأمثل" : "Best Use"]: isAr ? "حمامات، مسابح، أسطح" : "Bathrooms, pools, roofs",
      [isAr ? "الصلاحية في العبوة" : "Shelf Life"]: isAr ? "12 شهراً" : "12 months",
    };
  }

  // ── Gypsum Board ──
  if (cat === "gypsum" || n.includes("جبس") || n.includes("لوح")) {
    const isFireRes = n.includes("حريق") || n.includes("fire");
    const isMoisture = n.includes("رطوبة") || n.includes("أخضر");
    return {
      [isAr ? "أبعاد اللوح" : "Board Size"]: isAr ? "120 سم × 300 سم" : "120 cm × 300 cm",
      [isAr ? "التغطية للوح" : "Coverage/Board"]: isAr ? "3.6 متر مربع / لوح" : "3.6 m² per board",
      [isAr ? "السماكة" : "Thickness"]: isMoisture ? (isAr ? "12.5 مم" : "12.5 mm") : isFireRes ? (isAr ? "15 مم" : "15 mm") : (isAr ? "12.5 مم" : "12.5 mm"),
      [isAr ? "الوزن" : "Weight"]: isMoisture ? (isAr ? "~11 كغ/م²" : "~11 kg/m²") : isFireRes ? (isAr ? "~13 كغ/م²" : "~13 kg/m²") : (isAr ? "~9.5 كغ/م²" : "~9.5 kg/m²"),
      [isAr ? "مقاومة الحريق" : "Fire Resistance"]: isFireRes ? (isAr ? "90 دقيقة (F90)" : "90 minutes (F90)") : (isAr ? "30 دقيقة (F30)" : "30 minutes (F30)"),
      [isAr ? "مقاومة الرطوبة" : "Moisture Resistance"]: isMoisture ? (isAr ? "✅ مقاوم (أخضر اللون)" : "✅ Resistant (Green)") : (isAr ? "❌ غير مقاوم" : "❌ Not Resistant"),
      [isAr ? "الاستخدام الأمثل" : "Best Use"]: isMoisture ? (isAr ? "حمامات، مطابخ" : "Bathrooms, Kitchens") : isFireRes ? (isAr ? "مخارج طوارئ، مباني تجارية" : "Fire escapes, Commercial") : (isAr ? "جدران وأسقف داخلية" : "Interior walls & ceilings"),
      [isAr ? "عزل صوتي" : "Sound Insulation"]: isAr ? "45 – 52 ديسيبل" : "45 – 52 dB",
      [isAr ? "طريقة التركيب" : "Installation"]: isAr ? "برغي / لصق / هيكل معدني" : "Screw / Glue / Metal frame",
      [isAr ? "شهادات الجودة" : "Certifications"]: isAr ? "ISO 9001 / CE / BSI" : "ISO 9001 / CE / BSI",
    };
  }

  // ── Sanitary Ware ──
  if (cat === "sanitary" || n.includes("خلاط") || n.includes("مرحاض") || n.includes("خزان")) {
    if (n.includes("خلاط") || n.includes("مزيج")) return {
      [isAr ? "معيار التدفق" : "Flow Rate"]: isAr ? "~5 – 8 لتر/دقيقة" : "~5 – 8 L/min",
      [isAr ? "ضغط التشغيل" : "Working Pressure"]: isAr ? "0.5 – 10 بار" : "0.5 – 10 bar",
      [isAr ? "المواد" : "Material"]: isAr ? "نحاس مطلي كروم / ستانلس ستيل" : "Brass chrome-plated / Stainless",
      [isAr ? "تقنية الخلط" : "Mixing Tech"]: isAr ? "كارتريدج سيراميك 35 مم" : "35mm ceramic cartridge",
      [isAr ? "الضمان" : "Warranty"]: isAr ? "5 – 10 سنوات" : "5 – 10 years",
      [isAr ? "توفير المياه" : "Water Saving"]: isAr ? "حتى 50% بمقارنة الصنابير التقليدية" : "Up to 50% vs. standard taps",
      [isAr ? "الاستخدام الأمثل" : "Best Use"]: isAr ? "حوض الحمام / المطبخ" : "Bathroom basin / Kitchen",
      [isAr ? "قياس التوصيل" : "Connection Size"]: isAr ? "DN15 (½ بوصة)" : "DN15 (½ inch)",
      [isAr ? "بلد المنشأ" : "Origin"]: isAr ? "ألمانيا / إسبانيا / سويسرا" : "Germany / Spain / Switzerland",
    };
    if (n.includes("مرحاض")) return {
      [isAr ? "حجم خزان الماء" : "Tank Volume"]: isAr ? "6 / 3 لتر (تدفق مزدوج)" : "6 / 3 L (dual flush)",
      [isAr ? "توفير المياه" : "Water Saving"]: isAr ? "حتى 67% مقارنة بالمراحيض التقليدية" : "Up to 67% vs. standard WC",
      [isAr ? "طريقة التركيب" : "Installation"]: isAr ? "معلق على الجدار / أرضي" : "Wall-hung / Floor mounted",
      [isAr ? "حجم البول (الإحداثيات)" : "Bowl Dimensions"]: isAr ? "36 × 54 سم تقريباً" : "Approx. 36 × 54 cm",
      [isAr ? "المواد" : "Material"]: isAr ? "خزف صحي أبيض ناصع" : "Vitreous china white",
      [isAr ? "الضمان" : "Warranty"]: isAr ? "10 سنوات ضد العيوب" : "10 years against defects",
      [isAr ? "سهولة التنظيف" : "Cleanability"]: isAr ? "طلاء ريموف® مضاد للبكتيريا" : "Rimless / antibacterial glaze",
      [isAr ? "شهادات الجودة" : "Certifications"]: isAr ? "ISO 9001 / CE / WRAS" : "ISO 9001 / CE / WRAS",
    };
    return {
      [isAr ? "ضغط التشغيل" : "Working Pressure"]: isAr ? "0.5 – 10 بار" : "0.5 – 10 bar",
      [isAr ? "المواد" : "Material"]: isAr ? "خزف صحي / نحاس / ستانلس" : "Ceramic / Brass / Stainless",
      [isAr ? "الضمان" : "Warranty"]: isAr ? "5 – 10 سنوات" : "5 – 10 years",
      [isAr ? "شهادات الجودة" : "Certifications"]: isAr ? "ISO 9001 / CE" : "ISO 9001 / CE",
    };
  }

  // ── Power Tools ──
  if (cat === "tools" || n.includes("مطرقة") || n.includes("منشار") || n.includes("اسطوانة") || n.includes("قص") || n.includes("فيديا")) {
    if (n.includes("مطرقة") || n.includes("حفر")) return {
      [isAr ? "عزم الدوران" : "Torque"]: isAr ? "60 – 90 نيوتن·متر" : "60 – 90 Nm",
      [isAr ? "عدد الضربات" : "Impact Rate"]: isAr ? "0 – 35,000 ضربة/دقيقة" : "0 – 35,000 BPM",
      [isAr ? "سرعة الدوران" : "No-load Speed"]: isAr ? "0 – 2,000 لفة/دقيقة" : "0 – 2,000 RPM",
      [isAr ? "قدرة الحفر (خرسانة)" : "Drilling (concrete)"]: isAr ? "حتى 13 مم" : "Up to 13 mm",
      [isAr ? "قدرة الحفر (خشب)" : "Drilling (wood)"]: isAr ? "حتى 38 مم" : "Up to 38 mm",
      [isAr ? "نوع البطارية" : "Battery"]: isAr ? "ليثيوم أيون 20V / 4 أمبير" : "Li-Ion 20V / 4Ah",
      [isAr ? "الوزن (بالبطارية)" : "Weight (with battery)"]: isAr ? "~2.0 كغ" : "~2.0 kg",
      [isAr ? "مستوى الضجيج" : "Noise Level"]: isAr ? "94 – 102 ديسيبل" : "94 – 102 dB",
      [isAr ? "فئة الحماية" : "Protection Class"]: isAr ? "IP54 (مقاوم للغبار والرش)" : "IP54 (dust & splash proof)",
      [isAr ? "الضمان" : "Warranty"]: isAr ? "3 سنوات" : "3 years",
    };
    if (n.includes("منشار")) return {
      [isAr ? "قوة المحرك" : "Motor Power"]: isAr ? "1,800 – 2,200 وات" : "1,800 – 2,200 W",
      [isAr ? "قطر الشفرة" : "Blade Diameter"]: isAr ? "185 مم" : "185 mm",
      [isAr ? "عمق القطع (90°)" : "Cut Depth (90°)"]: isAr ? "65 مم" : "65 mm",
      [isAr ? "عمق القطع (45°)" : "Cut Depth (45°)"]: isAr ? "48 مم" : "48 mm",
      [isAr ? "سرعة الشفرة" : "Blade Speed"]: isAr ? "5,800 – 6,500 لفة/دقيقة" : "5,800 – 6,500 RPM",
      [isAr ? "زاوية الميل" : "Bevel Angle"]: isAr ? "0° – 55°" : "0° – 55°",
      [isAr ? "الوزن" : "Weight"]: isAr ? "~4.5 كغ" : "~4.5 kg",
      [isAr ? "مستوى الضجيج" : "Noise Level"]: isAr ? "~100 ديسيبل" : "~100 dB",
      [isAr ? "مخرج الغبار" : "Dust Outlet"]: isAr ? "محول متوافق مع المكانس" : "Vacuum adapter compatible",
      [isAr ? "الضمان" : "Warranty"]: isAr ? "سنة واحدة" : "1 year",
    };
    if (n.includes("اسطوانة") && n.includes("قص")) return {
      [isAr ? "القطر (الحجم)" : "Diameter (Size)"]: n.includes("5\"") ? "125 مم" : n.includes("7\"") ? "180 مم" : "230 مم",
      [isAr ? "ثقب المركز" : "Bore Diameter"]: isAr ? "22.23 مم (معياري)" : "22.23 mm (standard)",
      [isAr ? "أقصى سرعة" : "Max Speed"]: n.includes("5\"") ? (isAr ? "12,200 لفة/دقيقة" : "12,200 RPM") : n.includes("7\"") ? (isAr ? "8,600 لفة/دقيقة" : "8,600 RPM") : (isAr ? "6,600 لفة/دقيقة" : "6,600 RPM"),
      [isAr ? "سماكة القطع" : "Cutting Thickness"]: isAr ? "2.5 مم (دقة عالية)" : "2.5 mm (high precision)",
      [isAr ? "المواد الصالحة للقطع" : "Suitable Materials"]: isAr ? "خرسانة، حجر، رخام، خزف" : "Concrete, stone, marble, ceramic",
      [isAr ? "مادة الحافة" : "Edge Material"]: isAr ? "شرائح ماسية ملبدة" : "Sintered diamond segments",
      [isAr ? "نوع القطع" : "Cut Type"]: isAr ? "قطع رطب وجاف" : "Wet & dry cutting",
      [isAr ? "الاستخدام" : "Usage"]: isAr ? "جلاخة زاوية / منشار بلاط" : "Angle grinder / Tile saw",
      [isAr ? "الضمان" : "Warranty"]: isAr ? "ضمان المصنع" : "Manufacturer warranty",
    };
    if (n.includes("اسطوانة") && n.includes("فيديا")) return {
      [isAr ? "القطر (الحجم)" : "Diameter (Size)"]: n.includes("5\"") ? "125 مم" : n.includes("7\"") ? "180 مم" : "230 مم",
      [isAr ? "ثقب المركز" : "Bore Diameter"]: isAr ? "22.23 مم (معياري)" : "22.23 mm (standard)",
      [isAr ? "أقصى سرعة" : "Max Speed"]: n.includes("5\"") ? (isAr ? "12,200 لفة/دقيقة" : "12,200 RPM") : n.includes("7\"") ? (isAr ? "8,600 لفة/دقيقة" : "8,600 RPM") : (isAr ? "6,600 لفة/دقيقة" : "6,600 RPM"),
      [isAr ? "المواد الصالحة" : "Suitable Materials"]: isAr ? "بلاط، خزف، بورسلان" : "Tile, ceramic, porcelain",
      [isAr ? "مادة الحافة" : "Edge Material"]: isAr ? "كاربيد تنجستن (فيديا)" : "Tungsten Carbide (TCT)",
      [isAr ? "نوع التشطيب" : "Finish Type"]: isAr ? "قطع نظيف بدون رقائق" : "Clean cut, chip-free",
      [isAr ? "نوع القطع" : "Cut Type"]: isAr ? "قطع جاف فقط" : "Dry cutting only",
      [isAr ? "متوافق مع" : "Compatible With"]: isAr ? "جلاخة زاوية (UNI)" : "Angle grinder (UNI)",
      [isAr ? "الضمان" : "Warranty"]: isAr ? "ضمان المصنع" : "Manufacturer warranty",
    };
    return {
      [isAr ? "معيار الجودة" : "Quality Standard"]: isAr ? "CE / ISO 9001" : "CE / ISO 9001",
      [isAr ? "المواد" : "Material"]: isAr ? "فولاذ كروم فاناديوم / ألماس" : "Chrome Vanadium / Diamond",
      [isAr ? "الاستخدام" : "Usage"]: isAr ? "مهني – بناء وتشييد" : "Professional – Construction",
      [isAr ? "الضمان" : "Warranty"]: isAr ? "ضمان المصنع" : "Manufacturer warranty",
    };
  }

  // ── Steel ──
  if (cat === "steel" || n.includes("حديد") || n.includes("فولاذ") || n.includes("عارضة")) {
    return {
      [isAr ? "الخامة" : "Material"]: isAr ? "فولاذ هيكلي S235 / S275" : "Structural steel S235 / S275",
      [isAr ? "قوة الخضوع" : "Yield Strength"]: isAr ? "235 – 420 ميجاباسكال" : "235 – 420 MPa",
      [isAr ? "قوة الشد" : "Tensile Strength"]: isAr ? "360 – 550 ميجاباسكال" : "360 – 550 MPa",
      [isAr ? "الاستطالة" : "Elongation"]: isAr ? "≥ 25%" : "≥ 25%",
      [isAr ? "المعيار" : "Standard"]: isAr ? "ASTM A615 / EN 10025" : "ASTM A615 / EN 10025",
      [isAr ? "القطر / الحجم" : "Diameter / Size"]: n.includes("12") ? (isAr ? "⌀12 مم" : "⌀12 mm") : n.includes("200") ? (isAr ? "IPE 200 (ارتفاع 200 مم)" : "IPE 200 (height 200 mm)") : isAr ? "متعدد" : "Various",
      [isAr ? "وحدة البيع" : "Sold By"]: n.includes("طن") ? (isAr ? "طن" : "Ton") : isAr ? "متر طولي" : "Linear meter",
      [isAr ? "الطلاء" : "Coating"]: isAr ? "طلاء تعشيق أولي / كروي" : "Shop primer / Galvanized",
      [isAr ? "شهادات الجودة" : "Certifications"]: isAr ? "ASTM / EN / ISO 9001" : "ASTM / EN / ISO 9001",
    };
  }

  // ── Flooring ──
  if (cat === "flooring" || n.includes("بلاط") || n.includes("أرضية") || n.includes("إيبوكسي")) {
    if (n.includes("إيبوكسي") || n.includes("epoxy")) return {
      [isAr ? "معدل التغطية" : "Coverage Rate"]: isAr ? "200 – 300 غرام/م² للطبقة" : "200 – 300 g/m² per coat",
      [isAr ? "عدد الطبقات" : "Coats Required"]: isAr ? "2 – 3 طبقات" : "2 – 3 coats",
      [isAr ? "سماكة الفيلم الجاف" : "Dry Film Thickness"]: isAr ? "0.3 – 0.5 مم / طبقة" : "0.3 – 0.5 mm / coat",
      [isAr ? "وقت التجفيف بين الطبقات" : "Recoat Time"]: isAr ? "4 – 8 ساعات" : "4 – 8 hours",
      [isAr ? "وقت الجفاف الكامل" : "Full Cure"]: isAr ? "7 أيام" : "7 days",
      [isAr ? "صلابة شور D" : "Shore D Hardness"]: isAr ? "75 – 80" : "75 – 80",
      [isAr ? "مقاومة الكيماويات" : "Chemical Resistance"]: isAr ? "ممتازة (أحماض وقواعد)" : "Excellent (acids & alkalis)",
      [isAr ? "درجة حرارة التطبيق" : "App. Temp"]: isAr ? "+10°م إلى +30°م" : "+10°C to +30°C",
      [isAr ? "الاستخدام الأمثل" : "Best Use"]: isAr ? "مستودعات، مصانع، مرائب" : "Warehouses, factories, garages",
      [isAr ? "شهادات الجودة" : "Certifications"]: isAr ? "LEED / GreenGuard Gold" : "LEED / GreenGuard Gold",
    };
    return {
      [isAr ? "الأبعاد" : "Dimensions"]: n.includes("60") ? (isAr ? "60 سم × 60 سم" : "60 cm × 60 cm") : n.includes("30") ? (isAr ? "30 سم × 30 سم" : "30 cm × 30 cm") : isAr ? "متعدد" : "Various",
      [isAr ? "السماكة" : "Thickness"]: isAr ? "8 – 10 مم" : "8 – 10 mm",
      [isAr ? "امتصاص الماء" : "Water Absorption"]: isAr ? "< 0.5% (بورسلان)" : "< 0.5% (porcelain)",
      [isAr ? "مقاومة الانزلاق" : "Slip Resistance"]: isAr ? "R11 (للأماكن المبللة)" : "R11 (wet areas)",
      [isAr ? "قوة الكسر" : "Breaking Strength"]: isAr ? "≥ 1,300 نيوتن" : "≥ 1,300 N",
      [isAr ? "مقاومة الصقيع" : "Frost Resistance"]: isAr ? "✅ مقاوم" : "✅ Resistant",
      [isAr ? "الاستخدام الأمثل" : "Best Use"]: isAr ? "أرضيات داخلية وخارجية" : "Indoor & outdoor flooring",
      [isAr ? "شهادات الجودة" : "Certifications"]: isAr ? "CE / ISO 13006" : "CE / ISO 13006",
    };
  }

  // ── Adhesives & Sealants ──
  if (cat === "adhesives" || n.includes("غراء") || n.includes("لاصق") || n.includes("ملاط") || n.includes("درزات")) {
    if (n.includes("درزات") || n.includes("فوجي") || n.includes("grout")) return {
      [isAr ? "معدل الاستهلاك" : "Consumption"]: isAr ? "~200 – 700 غرام/م² (حسب حجم الدرز)" : "~200 – 700 g/m² (joint width)",
      [isAr ? "عرض الدرز المناسب" : "Joint Width"]: isAr ? "1 – 25 مم" : "1 – 25 mm",
      [isAr ? "وقت التنظيف" : "Cleaning Time"]: isAr ? "15 – 30 دقيقة بعد الفرد" : "15 – 30 min after application",
      [isAr ? "وقت السير عليه" : "Foot Traffic"]: isAr ? "24 ساعة" : "24 hours",
      [isAr ? "وقت التصلب الكامل" : "Full Cure"]: isAr ? "7 – 28 يوم" : "7 – 28 days",
      [isAr ? "مقاومة العفن" : "Mold Resistance"]: isAr ? "✅ مضاد للفطريات" : "✅ Antifungal",
      [isAr ? "درجة حرارة التطبيق" : "App. Temp"]: isAr ? "+5°م إلى +35°م" : "+5°C to +35°C",
      [isAr ? "ثبات الألوان" : "Color Stability"]: isAr ? "ممتاز (لا يصفر)" : "Excellent (no yellowing)",
      [isAr ? "الاستخدام الأمثل" : "Best Use"]: isAr ? "بلاط حمامات ومطابخ" : "Bathroom & kitchen tiles",
      [isAr ? "الألوان المتاحة" : "Colors Available"]: isAr ? "+28 لوناً" : "+28 colors",
    };
    return {
      [isAr ? "معدل التغطية" : "Coverage Rate"]: isAr ? "~4 – 6 كغ لكل م² بسماكة 6 مم" : "~4 – 6 kg/m² at 6mm thickness",
      [isAr ? "وقت التعديل" : "Open Time"]: isAr ? "20 – 30 دقيقة" : "20 – 30 minutes",
      [isAr ? "وقت السير على البلاط" : "Foot Traffic"]: isAr ? "24 ساعة" : "24 hours",
      [isAr ? "وقت التصلب الكامل" : "Full Cure"]: isAr ? "28 يوم" : "28 days",
      [isAr ? "تصنيف EN" : "EN Classification"]: isAr ? "C2TE (مرن، تأخير في الانزلاق)" : "C2TE (Flexible, Extended)",
      [isAr ? "درجة حرارة التطبيق" : "App. Temp"]: isAr ? "+5°م إلى +35°م" : "+5°C to +35°C",
      [isAr ? "مقاومة الماء" : "Water Resistance"]: isAr ? "✅ ممتازة" : "✅ Excellent",
      [isAr ? "الاستخدام الأمثل" : "Best Use"]: isAr ? "بلاط كبير، حجر طبيعي" : "Large format tiles, natural stone",
      [isAr ? "شهادات الجودة" : "Certifications"]: isAr ? "CE / ISO 9001 / LEED" : "CE / ISO 9001 / LEED",
    };
  }

  // ── Thermal Insulation ──
  if (cat === "insulation" || n.includes("صوف") || n.includes("عزل") || n.includes("xps") || n.includes("إكسترا")) {
    if (n.includes("صوف") || n.includes("rock wool")) return {
      [isAr ? "السماكة" : "Thickness"]: isAr ? "50 – 200 مم" : "50 – 200 mm",
      [isAr ? "معامل التوصيل الحراري (λ)" : "Thermal Conductivity (λ)"]: isAr ? "0.036 – 0.040 واط/م·كلفن" : "0.036 – 0.040 W/(m·K)",
      [isAr ? "مقاومة حرارية (R) لـ100مم" : "R-value (100mm)"]: isAr ? "~2.5 م²·كلفن/واط" : "~2.5 m²·K/W",
      [isAr ? "عزل صوتي" : "Sound Insulation"]: isAr ? "45 – 52 ديسيبل (Rw)" : "45 – 52 dB (Rw)",
      [isAr ? "درجة حرارة تشغيل قصوى" : "Max Service Temp"]: isAr ? "+750°م" : "+750°C",
      [isAr ? "مقاومة الحريق" : "Fire Class"]: isAr ? "A1 – غير قابل للاشتعال" : "A1 – Non-combustible",
      [isAr ? "الكثافة" : "Density"]: isAr ? "40 – 100 كغ/م³" : "40 – 100 kg/m³",
      [isAr ? "الاستخدام الأمثل" : "Best Use"]: isAr ? "جدران، أسقف، أسطح" : "Walls, ceilings, roofs",
      [isAr ? "شهادات الجودة" : "Certifications"]: isAr ? "Euroclass A1 / CE / ISO 9001" : "Euroclass A1 / CE / ISO 9001",
    };
    if (n.includes("xps") || n.includes("إكسترافور")) return {
      [isAr ? "السماكة" : "Thickness"]: isAr ? "30 – 160 مم" : "30 – 160 mm",
      [isAr ? "معامل التوصيل الحراري (λ)" : "Thermal Conductivity (λ)"]: isAr ? "0.032 – 0.034 واط/م·كلفن" : "0.032 – 0.034 W/(m·K)",
      [isAr ? "مقاومة حرارية (R) لـ50مم" : "R-value (50mm)"]: isAr ? "~1.5 م²·كلفن/واط" : "~1.5 m²·K/W",
      [isAr ? "مقاومة الضغط" : "Compressive Strength"]: isAr ? "≥ 300 كيلوباسكال" : "≥ 300 kPa",
      [isAr ? "امتصاص الماء" : "Water Absorption"]: isAr ? "< 0.3% (منعدم عملياً)" : "< 0.3% (practically nil)",
      [isAr ? "مقاومة الحريق" : "Fire Class"]: isAr ? "E (بدون مثبطات لهب)" : "E (without flame retardant)",
      [isAr ? "الاستخدام الأمثل" : "Best Use"]: isAr ? "أرضيات، أسطح معكوسة، جدران خارجية" : "Floors, inverted roofs, external walls",
      [isAr ? "شهادات الجودة" : "Certifications"]: isAr ? "CE / EN 13164" : "CE / EN 13164",
    };
  }

  // ── Default fallback ──
  return {
    [isAr ? "الوحدة" : "Unit"]: unitLabel(p.unit, isAr ? "ar" : "en"),
    [isAr ? "العلامة التجارية" : "Brand"]: displayBrand(p) || (isAr ? "—" : "—"),
    [isAr ? "معيار الجودة" : "Quality Standard"]: isAr ? "CE / ISO 9001" : "CE / ISO 9001",
    [isAr ? "الاستخدام" : "Usage"]: isAr ? "بناء وتشييد احترافي" : "Professional construction",
    [isAr ? "الضمان" : "Warranty"]: isAr ? "ضمان المصنع" : "Manufacturer warranty",
  };
}

// ──────────────────────────────────────────────────────
//  COMPARE MODAL
// ──────────────────────────────────────────────────────
function CompareModal({ products, lang, currency, onClose, onRemove }: {
  products: Product[]; lang: Lang; currency: Currency;
  onClose: () => void; onRemove: (id: string) => void;
}) {
  const t = T[lang];
  const isAr = lang === "ar";

  // Build a unified list of all spec keys across all products
  const allSpecKeys = Array.from(new Set(
    products.flatMap(p => Object.keys(getDetailedSpecs(p, lang)))
  ));

  const ratingStars = (p: Product) => "★".repeat(Math.round(p.rating)) + "☆".repeat(5 - Math.round(p.rating));

  const sectionStyle: React.CSSProperties = {
    padding: "8px 16px", background: "#0051a2", color: "#fff",
    fontSize: 11, fontWeight: 900, letterSpacing: ".08em", textTransform: "uppercase",
    textAlign: "start",
  };

  const labelStyle: React.CSSProperties = {
    padding: "11px 16px", background: "#f8faff",
    fontWeight: 700, color: "#003578", fontSize: 12.5,
    borderBottom: "1px solid #e8eef8", whiteSpace: "nowrap",
    minWidth: 160,
  };

  const cellStyle: React.CSSProperties = {
    padding: "11px 16px", textAlign: "center", color: "#1e293b",
    fontSize: 13, borderBottom: "1px solid #e8eef8", fontWeight: 500,
  };

  const highlightCell = (values: string[]): React.CSSProperties[] => {
    // For price - lower is better green highlight
    return values.map(() => ({ ...cellStyle }));
  };

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,15,40,.8)", zIndex: 9999,
      display: "flex", alignItems: "center", justifyContent: "center", padding: "2%",
      backdropFilter: "blur(4px)",
    }} onClick={onClose}>
      <div style={{
        background: "#fff", width: "100%", maxWidth: 1100, maxHeight: "92vh",
        overflowY: "auto", borderRadius: 16,
        boxShadow: "0 32px 80px rgba(0,0,0,.5), 0 0 0 1px rgba(0,81,162,.2)",
        display: "flex", flexDirection: "column",
      }} onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div style={{
          background: "linear-gradient(135deg, #001f4d, #0051a2)", color: "#fff",
          padding: "20px 28px", display: "flex", alignItems: "center",
          justifyContent: "space-between", borderRadius: "16px 16px 0 0", flexShrink: 0,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 28 }}>⚖️</span>
            <div>
              <div style={{ fontSize: 20, fontWeight: 900 }}>
                {isAr ? "مقارنة المنتجات" : "Product Comparison"}
              </div>
              <div style={{ fontSize: 12, opacity: .7 }}>
                {isAr ? `مقارنة ${products.length} منتجات بمعلومات تقنية شاملة` : `Comparing ${products.length} products with full technical data`}
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{
            background: "rgba(255,255,255,.15)", border: "1px solid rgba(255,255,255,.3)",
            color: "#fff", width: 40, height: 40, borderRadius: 10,
            fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
          }}>✕</button>
        </div>

        <div style={{ overflowX: "auto", flex: 1 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr>
                <td style={{ ...labelStyle, background: "#001f4d", color: "transparent", border: "none" }} />
                {products.map((p) => (
                  <th key={p.id} style={{
                    padding: "16px 14px", background: "#e8f0fb", textAlign: "center",
                    fontWeight: 800, color: "#0051a2", position: "relative",
                    borderBottom: "3px solid #0051a2", minWidth: 180,
                  }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.imageUrl || "/placeholder-product.svg"} alt={p.nameAr}
                      loading="lazy" decoding="async"
                      onError={(e) => { const img = e.currentTarget; if (img.src !== window.location.origin + "/placeholder-product.svg") img.src = "/placeholder-product.svg"; }}
                      style={{
                      width: 100, height: 72, objectFit: "cover",
                      borderRadius: 8, marginBottom: 8, display: "block", margin: "0 auto 8px",
                      border: "2px solid #c7d9f5"
                    }} />
                    <div style={{ fontSize: 13, fontWeight: 800, color: "#001f4d", lineHeight: 1.3, marginBottom: 4 }}>
                      {isAr ? p.nameAr : p.nameEn}
                    </div>
                    <div style={{ fontSize: 11, color: "#3b82f6", fontWeight: 700, marginBottom: 8 }}>
                      {displayBrand(p)}
                    </div>
                    <button onClick={() => onRemove(p.id)} style={{
                      position: "absolute", top: 8, insetInlineEnd: 8,
                      background: "#ef4444", color: "#fff", border: "none",
                      borderRadius: "50%", width: 22, height: 22, fontSize: 11,
                      cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                    }}>✕</button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* ── SECTION: Basic Info ── */}
              <tr><td colSpan={products.length + 1} style={sectionStyle}>
                {isAr ? "📋 المعلومات الأساسية" : "📋 Basic Information"}
              </td></tr>

              {/* Unit */}
              <tr>
                <td style={labelStyle}>📦 {isAr ? "وحدة البيع" : "Unit of Sale"}</td>
                {products.map((p) => (
                  <td key={p.id} style={cellStyle}>{unitLabel(p.unit, isAr ? "ar" : "en")}</td>
                ))}
              </tr>

              {/* Rating */}
              <tr>
                <td style={labelStyle}>⭐ {isAr ? "التقييم" : "Rating"}</td>
                {products.map((p) => (
                  <td key={p.id} style={cellStyle}>
                    <div style={{ color: "#f59e0b", fontSize: 15 }}>{ratingStars(p)}</div>
                    <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>
                      {p.rating}/5 ({p.reviewCount} {isAr ? "تقييم" : "reviews"})
                    </div>
                  </td>
                ))}
              </tr>

              {/* Stock */}
              <tr>
                <td style={labelStyle}>🏪 {isAr ? "التوفر" : "Availability"}</td>
                {products.map((p) => {
                  const avail = p.stockCount != null ? p.stockCount > 0 : p.inStock;
                  return (
                  <td key={p.id} style={cellStyle}>
                    <span style={{
                      background: avail ? "#dcfce7" : "#fee2e2",
                      color: avail ? "#15803d" : "#dc2626",
                      padding: "4px 12px", borderRadius: 20,
                      fontSize: 12, fontWeight: 800,
                    }}>
                      {avail ? (isAr ? "✅ متوفر" : "✅ In Stock") : (isAr ? "❌ غير متوفر" : "❌ Out of Stock")}
                    </span>
                  </td>
                  );
                })}
              </tr>

              {/* Category */}
              <tr>
                <td style={labelStyle}>🏷️ {isAr ? "الفئة" : "Category"}</td>
                {products.map((p) => (
                  <td key={p.id} style={cellStyle}>
                    <span style={{
                      background: "#e8f0fb", color: "#0051a2",
                      padding: "3px 10px", borderRadius: 6, fontSize: 11, fontWeight: 700,
                    }}>
                      {p.categoryId.toUpperCase()}
                    </span>
                  </td>
                ))}
              </tr>

              {/* ── SECTION: Technical Specs ── */}
              <tr><td colSpan={products.length + 1} style={sectionStyle}>
                {isAr ? "🔬 المواصفات الفنية التفصيلية" : "🔬 Detailed Technical Specifications"}
              </td></tr>

              {allSpecKeys.map((key) => (
                <tr key={key} style={{ borderBottom: "1px solid #e8eef8" }}>
                  <td style={labelStyle}>› {key}</td>
                  {products.map((p) => {
                    const specs = getDetailedSpecs(p, lang);
                    const val = specs[key] || "—";
                    return (
                      <td key={p.id} style={cellStyle}>
                        {val}
                      </td>
                    );
                  })}
                </tr>
              ))}

              {/* ── SECTION: Specs lists ── */}
              <tr><td colSpan={products.length + 1} style={sectionStyle}>
                {isAr ? "📝 مميزات المنتج" : "📝 Product Features"}
              </td></tr>
              <tr>
                <td style={{ ...labelStyle, verticalAlign: "top", paddingTop: 14 }}>
                  {isAr ? "المميزات" : "Features"}
                </td>
                {products.map((p) => (
                  <td key={p.id} style={{ ...cellStyle, verticalAlign: "top", textAlign: "start", padding: "12px 16px" }}>
                    <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 6 }}>
                      {(isAr ? p.specAr : p.specEn).length > 0
                        ? (isAr ? p.specAr : p.specEn).map((s, i) => (
                            <li key={i} style={{ display: "flex", gap: 6, fontSize: 12.5, color: "#334155" }}>
                              <span style={{ color: "#0051a2", flexShrink: 0, fontWeight: 900 }}>✓</span>
                              {s}
                            </li>
                          ))
                        : <li style={{ color: "#94a3b8", fontSize: 12 }}>—</li>
                      }
                    </ul>
                  </td>
                ))}
              </tr>

              {/* ── SECTION: Certificates ── */}
              <tr><td colSpan={products.length + 1} style={sectionStyle}>
                {isAr ? "🏅 شهادات الجودة والمطابقة" : "🏅 Quality & Compliance Certifications"}
              </td></tr>
              <tr>
                <td style={labelStyle}>{isAr ? "الشهادات" : "Certificates"}</td>
                {products.map((p) => (
                  <td key={p.id} style={{ ...cellStyle, verticalAlign: "top" }}>
                    {p.certificates.length > 0 ? (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 4, justifyContent: "center" }}>
                        {p.certificates.map((c, i) => (
                          <span key={i} style={{
                            background: "#dbeafe", color: "#1e40af", border: "1px solid #bfdbfe",
                            borderRadius: 6, padding: "3px 8px", fontSize: 11, fontWeight: 700,
                          }}>
                            🏅 {isAr ? c.nameAr : c.nameEn}
                          </span>
                        ))}
                      </div>
                    ) : <span style={{ color: "#94a3b8", fontSize: 12 }}>—</span>}
                  </td>
                ))}
              </tr>

              {/* ── SECTION: Description ── */}
              <tr><td colSpan={products.length + 1} style={sectionStyle}>
                {isAr ? "📄 وصف المنتج" : "📄 Product Description"}
              </td></tr>
              <tr>
                <td style={{ ...labelStyle, verticalAlign: "top", paddingTop: 14 }}>
                  {isAr ? "الوصف" : "Description"}
                </td>
                {products.map((p) => (
                  <td key={p.id} style={{ ...cellStyle, verticalAlign: "top", textAlign: "start", padding: "12px 16px" }}>
                    <p style={{ margin: 0, fontSize: 12.5, color: "#475569", lineHeight: 1.7 }}>
                      {isAr ? p.descriptionAr : p.descriptionEn}
                    </p>
                  </td>
                ))}
              </tr>

              {/* ── CTA Row ── */}
              <tr>
                <td style={{ ...labelStyle, background: "#f0f7ff", border: "none" }} />
                {products.map((p) => (
                  <td key={p.id} style={{ padding: "16px 14px", textAlign: "center", background: "#f0f7ff" }}>
                    <a href="#contact" onClick={onClose} style={{
                      display: "inline-block", background: "linear-gradient(135deg, #0051a2, #003578)",
                      color: "#fff", padding: "12px 22px", fontSize: 13, fontWeight: 800,
                      textDecoration: "none", borderRadius: 10,
                      boxShadow: "0 4px 15px rgba(0,81,162,.35)",
                    }}>
                      {isAr ? "🛒 اطلب عرض سعر" : "🛒 Request Quote"}
                    </a>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────
//  MAIN CATALOG PAGE
// ──────────────────────────────────────────────────────
export default function ProductsPage() {
  const [mounted, setMounted] = useState(false);
  const [currency, setCurrency] = useState<Currency>("LYD");
  const [lang, setLang] = useState<Lang>("ar");
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeBrand, setActiveBrand] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("default");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [compareList, setCompareList] = useState<Product[]>([]);
  const [showCompare, setShowCompare] = useState(false);
  const [compareAlert, setCompareAlert] = useState("");
  const [dark, setDark] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [user, setUser] = useState<any | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const t = T[lang];
  const dir = lang === "ar" ? "rtl" : "ltr";

  useEffect(() => {
    setMounted(true);
    setCartCount(getCartCount(getCart()));
    getProducts().then(setAllProducts);
    
    const searchParams = new URLSearchParams(window.location.search);
    const cat = searchParams.get("category");
    if (cat && CATEGORIES.some(c => c.id === cat)) {
      setActiveCategory(cat);
    }
    const q = searchParams.get("q");
    if (q) setSearchQuery(q);
    
    const checkSession = async () => {
      const session = await getSession();
      if (session?.user) {
        setUser(session.user as any);
        const favs = await getFavorites((session.user as any).id || session.user.email || "guest");
        setFavorites(favs);
      } else {
        setUser(null);
        setFavorites([]);
      }
    };
    checkSession();
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
  }, [lang, dir]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  // Update cart count
  useEffect(() => {
    const update = () => setCartCount(getCartCount(getCart()));
    update();
    window.addEventListener("storage", update);
    return () => window.removeEventListener("storage", update);
  }, []);

  // Filter + Search + Sort
  const displayedProducts = useMemo(() => {
    let result = filterProducts(allProducts, activeCategory);
    if (activeBrand !== "all") result = result.filter((p) => displayBrand(p) === activeBrand);
    if (inStockOnly) result = result.filter((p) => (p.stockCount != null ? p.stockCount > 0 : p.inStock));
    if (searchQuery) result = searchProducts(result, searchQuery, lang);
    switch (sortBy) {
      case "priceAsc":   return [...result].sort((a, b) => a.priceBase - b.priceBase);
      case "priceDesc":  return [...result].sort((a, b) => b.priceBase - a.priceBase);
      case "rating":     return [...result].sort((a, b) => b.rating - a.rating);
      case "newest":     return [...result].filter(p => p.isNew).concat(result.filter(p => !p.isNew));
      default:           return result;
    }
  }, [allProducts, searchQuery, activeCategory, activeBrand, inStockOnly, sortBy, lang]);

  // Manufacturers (brands) available within the current category — powers the
  // Section → Manufacturer → Products navigation. Uses the resolved brand so the
  // "General" placeholder never appears as a selectable manufacturer.
  const brandsInCategory = useMemo(() => {
    const scoped = filterProducts(allProducts, activeCategory);
    return Array.from(new Set(scoped.map((p) => displayBrand(p)).filter(Boolean))).sort();
  }, [allProducts, activeCategory]);

  // Log searches (debounced) for the weekly report — flags no-result queries (item 20)
  useEffect(() => {
    const q = searchQuery.trim();
    if (q.length < 2 || allProducts.length === 0) return;
    const timer = setTimeout(() => {
      logSearch(q, searchProducts(allProducts, q, lang).length > 0);
    }, 1000);
    return () => clearTimeout(timer);
  }, [searchQuery, allProducts, lang]);

  const handleViewDetails = (p: Product) => {
    incrementProductView(p.id);
    setSelectedProduct(p);
  };

  const handleCompare = (product: Product) => {
    if (compareList.find(p => p.id === product.id)) {
      setCompareList(compareList.filter(p => p.id !== product.id));
    } else if (compareList.length >= 3) {
      setCompareAlert(t.compareMax);
      setTimeout(() => setCompareAlert(""), 3000);
    } else if (compareList.length > 0 && compareList[0].categoryId !== product.categoryId) {
      // Only products from the same category can be compared meaningfully.
      setCompareAlert(t.compareSameCat);
      setTimeout(() => setCompareAlert(""), 3000);
    } else {
      setCompareList([...compareList, product]);
    }
  };

  const handleToggleFavorite = async (p: Product) => {
    if (!user) {
      alert(lang === "ar" ? "يجب تسجيل الدخول لإضافة المنتجات للمفضلة" : "Please login to add favorites");
      return;
    }
    const userId = user.uid || user.phoneNumber!;
    const isFav = favorites.includes(p.id);
    
    // Optimistic UI update
    setFavorites(isFav ? favorites.filter(id => id !== p.id) : [...favorites, p.id]);
    
    // Server update
    await toggleFavorite(userId, p.id, !isFav);
  };

  const currencyOptions: Currency[] = ["LYD", "USD", "EUR"];
  const sortOptions = [
    { value: "default", label: t.sortDefault },
    { value: "priceAsc", label: t.sortPriceAsc },
    { value: "priceDesc", label: t.sortPriceDesc },
    { value: "rating", label: t.sortRating },
    { value: "newest", label: t.sortNewest },
  ];

  return (
    <>
      <style>{`
        body { font-family: 'Cairo', sans-serif; }
        .cat-btn { background: var(--white); border: 1.5px solid var(--gray-light); padding: 9px 18px; font-family: 'Cairo', sans-serif; font-size: 12px; font-weight: 700; cursor: pointer; transition: all .25s; color: var(--text2); display: flex; align-items: center; gap: 6px; white-space: nowrap; }
        .cat-btn.active { background: var(--blue); color: #fff; border-color: var(--blue); }
        .cat-btn:hover:not(.active) { background: var(--blue-light); color: var(--blue); border-color: var(--blue); }
        .brand-btn { background: var(--white); border: 1.5px solid var(--gray-light); padding: 7px 14px; border-radius: 999px; font-family: 'Cairo', sans-serif; font-size: 12px; font-weight: 700; cursor: pointer; transition: all .25s; color: var(--text2); white-space: nowrap; }
        .brand-btn.active { background: var(--accent); color: #fff; border-color: var(--accent); }
        .brand-btn:hover:not(.active) { background: #fff7ea; color: #b45309; border-color: var(--accent); }
        .pcard-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 3px; background: var(--gray-light); }
        @media(max-width:1200px) { .pcard-grid { grid-template-columns: repeat(3, 1fr); } }
        @media(max-width:860px)  { .pcard-grid { grid-template-columns: repeat(2, 1fr); } }
        @media(max-width:500px)  { .pcard-grid { grid-template-columns: 1fr; } }
        .search-box { position: relative; flex: 1; }
        .search-input { width: 100%; padding: 12px 44px 12px 16px; border: 1.5px solid var(--gray-light); background: var(--white); color: var(--text); font-family: 'Cairo', sans-serif; font-size: 14px; outline: none; transition: border-color .25s; }
        [dir=rtl] .search-input { padding: 12px 16px 12px 44px; }
        .search-input:focus { border-color: var(--blue); }
        .search-icon { position: absolute; top: 50%; transform: translateY(-50%); inset-inline-end: 14px; color: var(--gray); font-size: 17px; pointer-events: none; }
        .compare-bar { position: fixed; bottom: 0; left: 0; right: 0; background: var(--blue-deeper); color: #fff; z-index: 998; padding: 14px 5%; display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; box-shadow: 0 -4px 24px rgba(0,0,0,.3); }
        .ctrl-select { background: var(--white); border: 1.5px solid var(--gray-light); color: var(--text); padding: 10px 14px; font-family: 'Cairo', sans-serif; font-size: 13px; outline: none; cursor: pointer; }
        .top-ctrl { display: flex; align-items: center; gap: 8px; }
        .top-ctrl label { font-size: 11px; font-weight: 700; color: var(--gray); white-space: nowrap; }
        @media(max-width:600px) { .filter-bar { flex-direction: column; } }
      `}</style>

      {/* ── UNIFIED TOP NAV BAR (same SiteHeader used on every page) + shop icons ── */}
      <SiteHeader
        lang={lang}
        onToggleLang={() => setLang(lang === "ar" ? "en" : "ar")}
        rightSlot={
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
            <button onClick={() => setDark(!dark)} title="theme" style={{ background: "rgba(255,255,255,.15)", border: "none", color: "#fff", padding: "6px 10px", fontSize: 16, cursor: "pointer", borderRadius: 8 }}>
              {dark ? "☀️" : "🌙"}
            </button>
            <Link href="/profile" style={{ background: "rgba(255,255,255,.15)", color: "#fff", padding: "6px 12px", fontSize: 13, fontWeight: 800, textDecoration: "none", borderRadius: 8 }}>
              👤
            </Link>
            <a href="/cart" style={{ background: cartCount > 0 ? "#f59e0b" : "rgba(255,255,255,.15)", color: "#fff", padding: "6px 12px", fontSize: 13, fontWeight: 800, textDecoration: "none", borderRadius: 8, whiteSpace: "nowrap" }}>
              🛒 {cartCount > 0 ? cartCount : ""}
            </a>
          </div>
        }
      />

      <main style={{ background: "var(--off)", minHeight: "100vh", paddingBottom: compareList.length > 0 ? 80 : 0 }}>
        {/* ── HEADER ── */}
        <div style={{ background: "var(--blue-deeper)", padding: "48px 5% 36px" }}>
          <div style={{ maxWidth: 1360, margin: "0 auto" }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".2em", textTransform: "uppercase", color: "rgba(255,255,255,.5)", marginBottom: 8 }}>
              {lang === "ar" ? "الشعلة الرائدة" : "AL-SHOWLA AL-RAEDA"}
            </div>
            <h1 style={{ fontSize: "clamp(1.8rem,4vw,3rem)", fontWeight: 900, color: "#fff", margin: "0 0 10px" }}>
              {t.title}
            </h1>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,.65)", margin: 0 }}>{t.subtitle}</p>
          </div>
        </div>

        <div style={{ maxWidth: 1360, margin: "0 auto", padding: "32px 5%" }}>
          {/* ── FILTER BAR ── */}
          <div className="filter-bar" style={{ display: "flex", gap: 12, marginBottom: 24, alignItems: "center", flexWrap: "wrap" }}>
            {/* Search */}
            <div className="search-box" style={{ minWidth: 240 }}>
              <input ref={searchRef} type="text" className="search-input"
                placeholder={t.searchPlaceholder} value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)} />
              <span className="search-icon">🔍</span>
            </div>

            {/* Sort */}
            <div className="top-ctrl">
              <label>{t.sortBy}:</label>
              <select className="ctrl-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                {sortOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>

            {/* In-stock only filter */}
            <label className="top-ctrl" style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", userSelect: "none" }}>
              <input type="checkbox" checked={inStockOnly} onChange={(e) => setInStockOnly(e.target.checked)}
                style={{ width: 16, height: 16, cursor: "pointer", accentColor: "var(--blue)" }} />
              <span>{lang === "ar" ? "المتوفر فقط" : "In stock only"}</span>
            </label>

            {/* Results count */}
            <div style={{ marginInlineStart: "auto", fontSize: 13, fontWeight: 700, color: "var(--gray)", whiteSpace: "nowrap" }}>
              {displayedProducts.length} {t.results}
            </div>
          </div>

          {/* ── CATEGORIES ── */}
          <div style={{ display: "flex", gap: 3, marginBottom: 12, overflowX: "auto", paddingBottom: 4 }}>
            {CATEGORIES.map(cat => (
              <button key={cat.id} className={`cat-btn${activeCategory === cat.id ? " active" : ""}`}
                onClick={() => { setActiveCategory(cat.id); setActiveBrand("all"); }}>
                <span>{cat.icon}</span>
                <span>{lang === "ar" ? cat.nameAr : cat.nameEn}</span>
              </button>
            ))}
          </div>

          {/* ── MANUFACTURERS (each company as its own button, not a dropdown) ── */}
          {brandsInCategory.length > 0 && (
            <div style={{ display: "flex", gap: 8, marginBottom: 28, flexWrap: "wrap", alignItems: "center" }}>
              <span style={{ fontSize: 12, fontWeight: 800, color: "var(--gray)", marginInlineEnd: 4 }}>
                {lang === "ar" ? "الشركة المصنعة:" : "Manufacturer:"}
              </span>
              <button className={`brand-btn${activeBrand === "all" ? " active" : ""}`} onClick={() => setActiveBrand("all")}>
                {lang === "ar" ? "كل الشركات" : "All Companies"}
              </button>
              {brandsInCategory.map((b) => (
                <button key={b} className={`brand-btn${activeBrand === b ? " active" : ""}`} onClick={() => setActiveBrand(b)}>
                  {b}
                </button>
              ))}
            </div>
          )}

          {/* ── COMPARE ALERT ── */}
          {compareAlert && (
            <div style={{ background: "#fef3c7", border: "1.5px solid #f59e0b", padding: "10px 16px", marginBottom: 16, fontSize: 13, fontWeight: 700, color: "#92400e", borderRadius: 2 }}>
              ⚠️ {compareAlert}
            </div>
          )}

          {/* ── PRODUCTS GRID ── */}
          {displayedProducts.length === 0 ? (
            <div style={{ textAlign: "center", padding: "80px 20px" }}>
              <div style={{ fontSize: 56, marginBottom: 16 }}>🔍</div>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: "var(--text)", marginBottom: 8 }}>{t.noResults}</h2>
              <p style={{ color: "var(--gray)", fontSize: 14 }}>{t.noResultsSub}</p>
              <button onClick={() => { setSearchQuery(""); setActiveCategory("all"); setActiveBrand("all"); }}
                style={{ marginTop: 20, background: "var(--blue)", color: "#fff", border: "none", padding: "12px 28px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                {lang === "ar" ? "إعادة الضبط" : "Reset Filters"}
              </button>
            </div>
          ) : (
            <div className="pcard-grid">
              {displayedProducts.map((p: any) => (
              <ProductCard
                key={p.id}
                product={p}
                lang={lang}
                currency={currency}
                onCompare={handleCompare}
                inCompare={!!compareList.find(c => c.id === p.id)}
                compareDisabled={compareList.length >= 3}
                isFavorite={favorites.includes(p.id)}
                onToggleFavorite={handleToggleFavorite}
                onViewDetails={handleViewDetails}
              />
            ))}
            </div>
          )}
        </div>
      </main>

      {/* ── COMPARE FLOATING BAR ── */}
      {compareList.length > 0 && (
        <div className="compare-bar">
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <span style={{ fontSize: 13, fontWeight: 700 }}>⚖️ {t.compareTitle}:</span>
            {compareList.map(p => (
              <div key={p.id} style={{
                background: "rgba(255,255,255,.12)", border: "1px solid rgba(255,255,255,.2)",
                padding: "5px 12px", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", gap: 8,
              }}>
                {lang === "ar" ? p.nameAr : p.nameEn}
                <button onClick={() => setCompareList(compareList.filter(x => x.id !== p.id))}
                  style={{ background: "none", border: "none", color: "rgba(255,255,255,.6)", cursor: "pointer", fontSize: 13, lineHeight: 1 }}>✕</button>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {compareList.length >= 2 && (
              <button onClick={() => setShowCompare(true)} style={{
                background: "#f59e0b", color: "#fff", border: "none",
                padding: "10px 24px", fontSize: 13, fontWeight: 800, cursor: "pointer", fontFamily: "inherit",
              }}>{t.compareBtn}</button>
            )}
            <button onClick={() => setCompareList([])} style={{
              background: "rgba(255,255,255,.15)", color: "#fff", border: "1px solid rgba(255,255,255,.3)",
              padding: "10px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
            }}>{t.clearCompare}</button>
          </div>
        </div>
      )}

      {/* ── COMPARE MODAL ── */}
      {showCompare && compareList.length >= 2 && (
        <CompareModal
          products={compareList}
          lang={lang}
          currency={currency}
          onClose={() => setShowCompare(false)}
          onRemove={(id) => {
            const updated = compareList.filter(p => p.id !== id);
            setCompareList(updated);
            if (updated.length < 2) setShowCompare(false);
          }}
        />
      )}
      {/* ── PRODUCT MODAL ── */}
      {selectedProduct && (
        <ProductModal 
          product={selectedProduct} 
          lang={lang} 
          currency={currency} 
          user={user}
          onClose={() => setSelectedProduct(null)} 
        />
      )}
    </>
  );
}

// ──────────────────────────────────────────────────────
//  PRODUCT MODAL COMPONENT (Reviews & Request Sample)
// ──────────────────────────────────────────────────────
import { getProductReviews, addProductReview, Review } from "@/app/actions";

function ProductModal({ 
  product, lang, currency, user, onClose 
}: { 
  product: Product; lang: Lang; currency: Currency; user: any | null; onClose: () => void;
}) {
  const t = T[lang];
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newReview, setNewReview] = useState({ rating: 5, comment: "" });
  const [loading, setLoading] = useState(false);
  const [sampleRequested, setSampleRequested] = useState(false);

  useEffect(() => {
    getProductReviews(product.id).then(setReviews);
  }, [product.id]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return alert(lang === "ar" ? "يجب تسجيل الدخول لإضافة تقييم" : "Please login to review");
    
    setLoading(true);
    const rev: Review = {
      productId: product.id,
      userId: user.uid || user.phoneNumber!,
      userName: user.phoneNumber || "مستخدم مسجل",
      rating: newReview.rating,
      comment: newReview.comment,
      date: new Date().toISOString()
    };
    
    const ok = await addProductReview(rev);
    if (ok) {
      setReviews([rev, ...reviews]);
      setNewReview({ rating: 5, comment: "" });
    }
    setLoading(false);
  };

  const handleRequestSample = () => {
    if (!user) return alert(lang === "ar" ? "يجب تسجيل الدخول لطلب عينة" : "Please login to request sample");
    setSampleRequested(true);
    setTimeout(() => setSampleRequested(false), 3000);
  };

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      background: "rgba(0,18,46,.75)", zIndex: 9999,
      display: "flex", alignItems: "center", justifyContent: "center", padding: "5%"
    }}>
      <div style={{
        background: "#ffffff", width: "100%", maxWidth: 800, maxHeight: "90vh",
        borderRadius: 20, overflowY: "auto", position: "relative",
        boxShadow: "0 24px 60px rgba(0,0,0,.5)"
      }}>
        <button onClick={onClose} style={{
          position: "absolute", top: 15, insetInlineEnd: 15, background: "rgba(0,0,0,.1)",
          border: "none", width: 32, height: 32, borderRadius: "50%", cursor: "pointer",
          fontSize: 16, fontWeight: "bold", zIndex: 10
        }}>✕</button>

        <div style={{ display: "flex", flexWrap: "wrap" }}>
          {/* Product Image */}
          <div style={{ flex: "1 1 300px" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={product.imageUrl || "/placeholder-product.svg"} alt=""
              loading="lazy" decoding="async"
              onError={(e) => { const img = e.currentTarget; if (img.src !== window.location.origin + "/placeholder-product.svg") img.src = "/placeholder-product.svg"; }}
              style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>

          {/* Product Info */}
          <div style={{ flex: "2 1 400px", padding: 30 }}>
            <h2 style={{ fontSize: 24, color: "var(--primary)", marginBottom: 10 }}>
              {lang === "ar" ? product.nameAr : product.nameEn}
            </h2>
            <p style={{ color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: 20 }}>
              {lang === "ar" ? product.descriptionAr : product.descriptionEn}
            </p>

            {/* Item 5: official product fields — only rendered when data exists */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
              {displayBrand(product) && (
                <div style={{ display: "flex", gap: 8, fontSize: 14 }}>
                  <span style={{ fontWeight: 700, color: "var(--primary)", minWidth: 120 }}>{t.brand}:</span>
                  <span style={{ color: "var(--text-secondary)" }}>{displayBrand(product)}</span>
                </div>
              )}
              <div style={{ display: "flex", gap: 8, fontSize: 14 }}>
                <span style={{ fontWeight: 700, color: "var(--primary)", minWidth: 120 }}>{t.code}:</span>
                <span style={{ color: "var(--text-secondary)", direction: "ltr" }}>{product.id}</span>
              </div>
              {product.unit && (
                <div style={{ display: "flex", gap: 8, fontSize: 14 }}>
                  <span style={{ fontWeight: 700, color: "var(--primary)", minWidth: 120 }}>{t.packageUnit}:</span>
                  <span style={{ color: "var(--text-secondary)" }}>{unitLabel(product.unit, lang)}</span>
                </div>
              )}
            </div>

            {/* Technical specifications */}
            {(lang === "ar" ? product.specAr : product.specEn)?.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <h4 style={{ fontSize: 15, color: "var(--primary)", marginBottom: 10 }}>{t.specs}</h4>
                <ul style={{ margin: 0, paddingInlineStart: 20, color: "var(--text-secondary)", lineHeight: 1.9, fontSize: 14 }}>
                  {(lang === "ar" ? product.specAr : product.specEn).map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Linked quality certificates */}
            {product.certificates?.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <h4 style={{ fontSize: 15, color: "var(--primary)", marginBottom: 10 }}>{t.certificates}</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {product.certificates.map((c, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", fontSize: 13 }}>
                      <CertBadge cert={c} lang={lang} />
                      {c.issuer && <span style={{ color: "var(--gray)" }}>{t.certIssuer}: {c.issuer}</span>}
                      {c.fileUrl && (
                        <a href={c.fileUrl} target="_blank" rel="noopener noreferrer" style={{ color: "var(--blue)", fontWeight: 700, textDecoration: "none" }}>
                          ⬇ {t.downloadCert}
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <p style={{ fontSize: 11, color: "var(--gray)", marginBottom: 24, lineHeight: 1.6 }}>{t.dataNote}</p>

            <button
              onClick={handleRequestSample}
              disabled={sampleRequested}
              style={{
                width: "100%", padding: 15, background: sampleRequested ? "#059669" : "var(--accent)",
                color: "#fff", border: "none", borderRadius: 12, fontWeight: "bold",
                fontSize: 16, cursor: "pointer", marginBottom: 15, fontFamily: "inherit"
              }}>
              {sampleRequested ? "✓ تم إرسال طلب العينة بنجاح" : t.requestSample}
            </button>

            {/* Feature 1: Smart WhatsApp Button */}
            <a 
              href={`https://wa.me/218948020200?text=${encodeURIComponent(`مرحباً، أود الاستفسار عن المنتج:\nالاسم: ${lang === "ar" ? product.nameAr : product.nameEn}\nالكود: ${product.id}\nالرابط: ${typeof window !== "undefined" ? window.location.href : ""}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                width: "100%", padding: 15, background: "#25D366",
                color: "#fff", textDecoration: "none", borderRadius: 12, fontWeight: "bold",
                fontSize: 16, cursor: "pointer", marginBottom: 30, fontFamily: "inherit"
              }}>
              <span style={{ fontSize: 20 }}>💬</span> تواصل عبر واتساب
            </a>

            {/* Item 5 / Section 16: separate quote-request and technical-consultation paths */}
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 30 }}>
              <a
                href={`https://wa.me/218948020200?text=${encodeURIComponent(`طلب عرض سعر\nالمنتج: ${lang === "ar" ? product.nameAr : product.nameEn}\nالكود: ${product.id}\nالكمية المطلوبة: `)}`}
                target="_blank" rel="noopener noreferrer"
                style={{ flex: "1 1 160px", textAlign: "center", padding: 13, background: "var(--blue)", color: "#fff", textDecoration: "none", borderRadius: 12, fontWeight: 700, fontSize: 14 }}>
                📄 {t.requestQuote}
              </a>
              <a
                href={`/site-visit?product=${encodeURIComponent(product.id)}`}
                style={{ flex: "1 1 160px", textAlign: "center", padding: 13, background: "transparent", color: "var(--blue)", textDecoration: "none", border: "1.5px solid var(--blue)", borderRadius: 12, fontWeight: 700, fontSize: 14 }}>
                🛠️ {t.techConsult}
              </a>
            </div>

            <hr style={{ border: "none", borderTop: "1px solid var(--border)", margin: "30px 0" }} />

            <h3 style={{ marginBottom: 20 }}>التقييمات والمراجعات ({reviews.length})</h3>
            
            {/* Add Review Form */}
            {user ? (
              <form onSubmit={handleSubmitReview} style={{ marginBottom: 30, padding: 20, background: "var(--bg)", borderRadius: 12 }}>
                <div style={{ marginBottom: 10 }}>
                  <label style={{ display: "block", marginBottom: 5 }}>التقييم:</label>
                  <select value={newReview.rating} onChange={e => setNewReview({...newReview, rating: Number(e.target.value)})} style={{ padding: 8, borderRadius: 6, border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text)" }}>
                    <option value="5">⭐⭐⭐⭐⭐ ممتاز</option>
                    <option value="4">⭐⭐⭐⭐ جيد جداً</option>
                    <option value="3">⭐⭐⭐ جيد</option>
                    <option value="2">⭐⭐ مقبول</option>
                    <option value="1">⭐ ضعيف</option>
                  </select>
                </div>
                <textarea 
                  value={newReview.comment} onChange={e => setNewReview({...newReview, comment: e.target.value})}
                  placeholder="اكتب تجربتك مع هذا المنتج..."
                  style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text)", minHeight: 80, marginBottom: 10, fontFamily: "inherit" }}
                  required
                />
                <button type="submit" disabled={loading} style={{ background: "var(--blue)", color: "#fff", border: "none", padding: "8px 20px", borderRadius: 6, cursor: "pointer", fontWeight: "bold", fontFamily: "inherit" }}>
                  {loading ? "جاري الإرسال..." : "إضافة التقييم"}
                </button>
              </form>
            ) : (
              <div style={{ padding: 15, background: "var(--bg)", borderRadius: 8, marginBottom: 20, textAlign: "center", color: "var(--text-secondary)" }}>
                قم بتسجيل الدخول لتتمكن من إضافة تقييم للمنتج.
              </div>
            )}

            {/* Reviews List */}
            <div style={{ display: "flex", flexDirection: "column", gap: 15 }}>
              {reviews.map(r => (
                <div key={r.id} style={{ padding: 15, border: "1px solid var(--border)", borderRadius: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                    <strong>{r.userName}</strong>
                    <span style={{ color: "#f59e0b" }}>{"★".repeat(r.rating)}{"☆".repeat(5-r.rating)}</span>
                  </div>
                  <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: 14 }}>{r.comment}</p>
                  <div style={{ fontSize: 11, color: "var(--gray)", marginTop: 5 }}>{new Date(r.date).toLocaleDateString()}</div>
                </div>
              ))}
              {reviews.length === 0 && <div style={{ color: "var(--gray)", textAlign: "center", padding: 20 }}>لا توجد تقييمات بعد. كن أول من يقيّم!</div>}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
