// ---------------------------------------------
// ALSHOWLA AL-RAEDA - Products Database
// ---------------------------------------------

export type Currency = "LYD" | "USD" | "EUR";

export const CURRENCY_RATES: Record<Currency, number> = {
  LYD: 1,
  USD: 0.21,
  EUR: 0.19,
};

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  LYD: "د.ل",
  USD: "$",
  EUR: "€",
};

export interface Certificate {
  nameAr: string;
  nameEn: string;
  issuer?: string;
  year?: number;
  fileUrl?: string;
}

export interface Product {
  id: string;
  categoryId: string;
  brand: string;
  imageUrl: string;
  priceBase?: number;
  wholesalePrice?: number;
  inStock: boolean;
  stockCount?: number;
  minStockCount?: number;
  isNew?: boolean;
  isFeatured?: boolean;
  rating: number;
  reviewCount: number;
  certificates: Certificate[];
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  descriptionEn: string;
  unit: string;
  specAr: string[];
  specEn: string[];
}

// §9: units are stored as "عربي / English". Show only the language-appropriate
// half so the Arabic UI never displays "Piece/Bag/Set" and vice-versa.
const UNIT_EN_FALLBACK: Record<string, string> = {
  "قطعة": "Piece",
  "طقم": "Set",
  "كيلو": "Kg",
  "طن": "Ton",
};
export function unitLabel(unit: string | undefined, lang: "ar" | "en"): string {
  if (!unit) return "";
  const parts = unit.split("/").map((s) => s.trim()).filter(Boolean);
  const arabic = parts.find((p) => /[؀-ۿ]/.test(p));
  const latin = parts.find((p) => !/[؀-ۿ]/.test(p));
  if (lang === "ar") return arabic || unit;
  return latin || UNIT_EN_FALLBACK[arabic || ""] || arabic || unit;
}

// ── Central brand resolution (review §7: stop showing real products under
//    the placeholder "General"). Many bulk-imported records were seeded with
//    brand="General"; here we recover the real manufacturer from the product's
//    name / code / spec text using an official-brand keyword map. When nothing
//    matches we return "" so the UI simply hides the brand chip instead of
//    printing "General" as if it were a real brand. Real brands pass through
//    untouched. This is the single source of truth used by the catalog card,
//    the detail modal, the compare table, and the manufacturer filter. ──
const BRAND_PATTERNS: [string, RegExp][] = [
  ["Sika", /sika|سيكا/i],
  ["Mapei", /mapei|ماباي|مابي/i],
  ["Knauf", /knauf|كناوف/i],
  ["Saint-Gobain", /saint.?gobain|gyproc|جيبروك/i],
  ["Grohe", /grohe|جروهي/i],
  ["Roca", /roca|روكا/i],
  ["Geberit", /geberit|جيبريت/i],
  ["DeWalt", /dewalt|ديوالت|\bdw[- ]?\d/i],
  ["Black+Decker", /black.?\+?.?decker|بلاك.?(اند|&).?ديكر/i],
  ["Stanley", /stanley|ستانلي/i],
  ["Deli", /\bdeli\b|ديلي|فيديا|\bdh-|\bdl\d/i],
  ["Total", /\btotal\b|توتال/i],
  ["Ingco", /ingco|إنجكو|انجكو/i],
  ["Bosch", /bosch|بوش/i],
  ["Makita", /makita|ماكيتا/i],
  ["Hilti", /hilti|هيلتي/i],
  ["Fischer", /fischer|فيشر/i],
  ["Fosroc", /fosroc|فوسروك/i],
  ["Weber", /weber|ويبر/i],
];

export function detectBrand(p: Pick<Product, "id" | "nameAr" | "nameEn" | "specAr" | "specEn">): string {
  const hay = [p.id, p.nameAr, p.nameEn, ...(p.specAr || []), ...(p.specEn || [])].join(" ");
  for (const [brand, re] of BRAND_PATTERNS) if (re.test(hay)) return brand;
  return "";
}

// Brand to actually display: keep a genuine brand, otherwise try to recover one,
// otherwise empty (so the UI shows nothing rather than the "General" placeholder).
export function displayBrand(p: Product): string {
  const real = p.brand && p.brand.trim() && p.brand.trim().toLowerCase() !== "general" ? p.brand.trim() : "";
  return real || detectBrand(p);
}

export interface Category {
  id: string;
  icon: string;
  nameAr: string;
  nameEn: string;
  count?: number;
}

export const CATEGORIES: Category[] = [
  { id: "all",        icon: "🏗️",  nameAr: "الكل",              nameEn: "All" },
  { id: "waterproof", icon: "🏗️",  nameAr: "أنظمة حلول البناء والانشاء", nameEn: "Building Solutions" },
  { id: "tools",      icon: "🔧",  nameAr: "الأدوات والمعدات الصناعية",     nameEn: "Industrial Tools" },
  { id: "gypsum",     icon: "🧱",  nameAr: "أنظمة الجبس بورد",        nameEn: "Gypsum Board" },
  { id: "sanitary",   icon: "🪟",  nameAr: "بلاط السيراميك",  nameEn: "Ceramic Tiles" },
  { id: "flooring",   icon: "🎨",  nameAr: "الديكور الداخلي والخارجي",      nameEn: "Interior & Exterior Decor" },
  { id: "adhesives",  icon: "🏠",  nameAr: "أنظمة التعرفية",  nameEn: "Roofing Systems" },
  { id: "steel",      icon: "⚙️",  nameAr: "الأسمنت والحديد",       nameEn: "Cement & Steel" },
];

// Catalog data lives in catalog-data.ts (auto-generated from supplier product images).
export { CATALOG_PRODUCTS as PRODUCTS } from "./catalog-data";

export function searchProducts(products: Product[], query: string, lang: "ar" | "en"): Product[] {
  if (!query || !query.trim()) return products;
  const lower = query.trim().toLowerCase();

  const matchesSearch = (text: string | undefined, q: string) => !!text && text.toLowerCase().includes(q);

  return products.filter((p) => {
    // Resolve the human-readable category name (AR + EN) so users can search by category text
    const cat = CATEGORIES.find((c) => c.id === p.categoryId);
    const fields: (string | undefined)[] = [
      p.nameAr,            // Arabic name
      p.nameEn,            // English name
      p.brand,             // manufacturer / brand
      p.id,                // product code / SKU
      p.categoryId,        // category id
      cat?.nameAr,         // category name (AR)
      cat?.nameEn,         // category name (EN)
      p.descriptionAr,
      p.descriptionEn,
      // spec lines carry embedded model / part numbers (e.g. "رقم القطعة: …", "Model: …")
      ...(p.specAr || []),
      ...(p.specEn || []),
    ];
    return fields.some((field) => matchesSearch(field, lower));
  });
}

export function filterProducts(products: Product[], categoryId: string): Product[] {
  if (categoryId === "all") return products;
  return products.filter((p) => p.categoryId === categoryId);
}

export function formatPrice(price: number | undefined, currency: Currency): string {
  // Catalog is quote-based (no public prices). When a price is missing we render
  // nothing so no "NaN"/"0" ever leaks into the UI.
  if (price == null || !Number.isFinite(price)) return "";
  const symbols: Record<string, string> = {
    LYD: "\u062f.\u0644",
    USD: "$",
    EUR: "\u20ac",
  };
  return price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " " + symbols[currency];
}

