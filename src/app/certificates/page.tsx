"use client";

import { useState } from "react";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";

type Lang = "ar" | "en";
type Kind = "system" | "product";

const T = {
  ar: {
    title: "أرشيف شهادات الجودة",
    subtitle: "شهادات المطابقة وأنظمة إدارة الجودة الدولية لعلاماتنا التجارية",
    allCerts: "كل الشهادات",
    issuer: "الجهة المانحة",
    brand: "العلامة",
    standard: "المواصفة",
    certNo: "رقم الشهادة",
    scope: "نطاق الاعتماد",
    validity: "الصلاحية",
    from: "من",
    to: "حتى",
    download: "تحميل الشهادة (PDF)",
    verify: "التحقق",
    noCerts: "لا توجد شهادات مطابقة لبحثك",
    searchPlaceholder: "ابحث باسم الشهادة أو العلامة أو الجهة المانحة...",
    total: "إجمالي الشهادات",
    brandsN: "علامة تجارية",
    internationalBodies: "جهة اعتماد دولية",
    filterAll: "الكل",
    typeFilter: "نوع الشهادة",
    typeSystem: "نظام إدارة (منشأة)",
    typeProduct: "مطابقة منتج",
    systemNote: "شهادات أنظمة الإدارة تخص المصنّع/المنشأة، بينما شهادات مطابقة المنتج تخص المنتج ذاته.",
  },
  en: {
    title: "Quality Certificates Archive",
    subtitle: "International conformity and management-system certificates for our brands",
    allCerts: "All Certificates",
    issuer: "Issuer",
    brand: "Brand",
    standard: "Standard",
    certNo: "Certificate No.",
    scope: "Scope",
    validity: "Validity",
    from: "From",
    to: "To",
    download: "Download Certificate (PDF)",
    verify: "Verify",
    noCerts: "No certificates match your search",
    searchPlaceholder: "Search by certificate, brand, or issuer...",
    total: "Total Certificates",
    brandsN: "Brands",
    internationalBodies: "Accreditation Bodies",
    filterAll: "All",
    typeFilter: "Certificate Type",
    typeSystem: "Management System (Facility)",
    typeProduct: "Product Conformity",
    systemNote: "Management-system certificates cover the manufacturer/facility, while product-conformity certificates cover the product itself.",
  },
};

type Cert = {
  id: string;
  nameAr: string; nameEn: string;
  brand: string;
  issuer: string;
  certNumber: string;
  standard: string;
  kind: Kind;
  scopeAr: string; scopeEn: string;
  from: string; to?: string; year: number;
  fileUrl: string;
  verifyUrl?: string;
};

// ── Verified brand certificates (each backed by an official PDF in /public/certificates) ──
const CERTS: Cert[] = [
  {
    id: "sika-9001",
    nameAr: "نظام إدارة الجودة — ISO 9001:2015",
    nameEn: "Quality Management System — ISO 9001:2015",
    brand: "Sika",
    issuer: "SGS",
    certNumber: "CH15/1206.00",
    standard: "ISO 9001:2015",
    kind: "system",
    scopeAr: "تطوير وإنتاج وتوزيع الأنظمة والمنتجات في قطاع البناء والصناعة.",
    scopeEn: "Development, production and distribution of systems and products in the building sector and industry.",
    from: "2023-12-13", to: "2026-12-02", year: 2023,
    fileUrl: "/certificates/sika-iso9001.pdf",
  },
  {
    id: "sika-14001",
    nameAr: "نظام الإدارة البيئية — ISO 14001:2015",
    nameEn: "Environmental Management System — ISO 14001:2015",
    brand: "Sika",
    issuer: "SGS",
    certNumber: "CH15/1207.00",
    standard: "ISO 14001:2015",
    kind: "system",
    scopeAr: "تطوير وإنتاج وتوزيع الأنظمة والمنتجات في قطاع البناء والصناعة.",
    scopeEn: "Development, production and distribution of systems and products in the building sector and industry.",
    from: "2023-12-13", to: "2026-12-02", year: 2023,
    fileUrl: "/certificates/sika-iso14001.pdf",
  },
  {
    id: "sika-45001",
    nameAr: "نظام السلامة والصحة المهنية — ISO 45001:2018",
    nameEn: "Occupational Health & Safety — ISO 45001:2018",
    brand: "Sika",
    issuer: "SGS",
    certNumber: "CH20/1034.00",
    standard: "ISO 45001:2018",
    kind: "system",
    scopeAr: "تطوير وإنتاج وتوزيع الأنظمة والمنتجات في قطاع البناء والصناعة.",
    scopeEn: "Development, production and distribution of systems and products in the building sector and industry.",
    from: "2023-12-13", to: "2026-12-02", year: 2023,
    fileUrl: "/certificates/sika-iso45001.pdf",
  },
  {
    id: "weber-9001",
    nameAr: "نظام إدارة الجودة — ISO 9001:2015",
    nameEn: "Quality Management System — ISO 9001:2015",
    brand: "Weber (Saint-Gobain)",
    issuer: "BSI",
    certNumber: "FM 641234",
    standard: "ISO 9001:2015",
    kind: "system",
    scopeAr: "تصميم وتصنيع وتوريد اللياسات والمواد اللاصقة والطبقات ومونة البناء ومركّبات الأرضيات وأنظمة العزل، مع التدريب والدعم الفني.",
    scopeEn: "Design, manufacture and supply of renders, adhesives, coatings, mortars, flooring compounds and insulation systems (incl. training and technical support).",
    from: "2024-06-30", to: "2027-06-29", year: 2024,
    fileUrl: "/certificates/weber-iso9001.pdf",
    verifyUrl: "https://www.bsigroup.com/en-GB/products-and-services/accreditation-and-certification/directory/",
  },
  {
    id: "bg-45001",
    nameAr: "نظام السلامة والصحة المهنية — ISO 45001:2018",
    nameEn: "Occupational Health & Safety — ISO 45001:2018",
    brand: "British Gypsum (Saint-Gobain)",
    issuer: "BSI",
    certNumber: "OHS 550586",
    standard: "ISO 45001:2018",
    kind: "system",
    scopeAr: "عمليات التعدين وتصنيع وتوريد لياسات الجبس وأنظمة التجصيص الجاف والخدمات المرتبطة بها.",
    scopeEn: "Mining operations and the manufacture and supply of gypsum plasters, dry-lining systems and associated services.",
    from: "2025-12-31", to: "2028-12-30", year: 2025,
    fileUrl: "/certificates/british-gypsum-iso45001.pdf",
    verifyUrl: "https://www.bsigroup.com/en-GB/products-and-services/accreditation-and-certification/directory/",
  },
  {
    id: "gyproc-dop",
    nameAr: "إعلان الأداء — جيبروك وول بورد (EN 520)",
    nameEn: "Declaration of Performance — Gyproc WallBoard (EN 520)",
    brand: "British Gypsum (Saint-Gobain)",
    issuer: "British Gypsum",
    certNumber: "DoP BOARD118 UK",
    standard: "EN 520:2004+A1:2009",
    kind: "product",
    scopeAr: "ألواح جبسية للتكسية (جيبروك وول بورد) بسماكات 9.5 و12.5 و15 مم — إعلان أداء وفق المواصفة الأوروبية EN 520.",
    scopeEn: "Gyproc WallBoard plasterboard lining (9.5, 12.5, 15 mm) — declared performance to EN 520.",
    from: "2022-09-02", year: 2022,
    fileUrl: "/certificates/gyproc-wallboard-dop.pdf",
  },
];

const UNIQUE_ISSUERS = [...new Set(CERTS.map((c) => c.issuer))];
const UNIQUE_BRANDS = [...new Set(CERTS.map((c) => c.brand))];

function fmtDate(d: string, lang: Lang) {
  try {
    return new Date(d).toLocaleDateString(lang === "ar" ? "ar-LY" : "en-GB", { year: "numeric", month: "short", day: "numeric" });
  } catch { return d; }
}

export default function CertificatesPage() {
  const [lang, setLang] = useState<Lang>("ar");
  const [search, setSearch] = useState("");
  const [filterIssuer, setFilterIssuer] = useState("all");
  const [filterBrand, setFilterBrand] = useState("all");
  const [filterType, setFilterType] = useState<"all" | Kind>("all");

  const t = T[lang];
  const dir = lang === "ar" ? "rtl" : "ltr";

  const filtered = CERTS.filter((c) => {
    const q = search.toLowerCase();
    const nameMatch =
      (lang === "ar" ? c.nameAr : c.nameEn).toLowerCase().includes(q) ||
      c.brand.toLowerCase().includes(q) ||
      c.issuer.toLowerCase().includes(q) ||
      c.standard.toLowerCase().includes(q) ||
      c.certNumber.toLowerCase().includes(q);
    const issuerMatch = filterIssuer === "all" || c.issuer === filterIssuer;
    const brandMatch = filterBrand === "all" || c.brand === filterBrand;
    const typeMatch = filterType === "all" || c.kind === filterType;
    return nameMatch && issuerMatch && brandMatch && typeMatch;
  });

  const inp: React.CSSProperties = { padding: "11px 14px", border: "1.5px solid var(--gray-light)", background: "var(--white)", color: "var(--text)", fontFamily: "inherit", fontSize: 13, cursor: "pointer", outline: "none", borderRadius: 8 };

  return (
    <>
      <SiteHeader lang={lang} onToggleLang={() => setLang((l) => (l === "ar" ? "en" : "ar"))} />
      <div style={{ minHeight: "100vh", background: "var(--off)", fontFamily: "'Cairo', sans-serif" }} dir={dir} lang={lang}>
        <style>{`
          :root { --blue:#0051a2;--blue-dark:#003578;--blue-deeper:#001f4d;--blue-light:#e8f2fc;--blue-soft:#d0e6f8;--accent:#f59e0b;--white:#fff;--off:#f7f9fc;--gray:#64748b;--gray-light:#e2e8f0;--text:#0f1c2e;--text2:#3d5473; }
          body { font-family: 'Cairo', sans-serif; }
        `}</style>

        {/* HERO */}
        <div style={{ background: "linear-gradient(135deg, var(--blue-deeper), #003578)", padding: "44px 5% 34px" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 22 }}>
              {[
                { n: CERTS.length, l: t.total },
                { n: UNIQUE_BRANDS.length, l: t.brandsN },
                { n: UNIQUE_ISSUERS.length, l: t.internationalBodies },
              ].map((s, i) => (
                <div key={i} style={{ background: "rgba(255,255,255,.1)", border: "1px solid rgba(255,255,255,.15)", padding: "14px 24px", textAlign: "center", minWidth: 120, borderRadius: 10 }}>
                  <div style={{ fontSize: 28, fontWeight: 900, color: "#fff" }}>{s.n}</div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,.6)", fontWeight: 700, marginTop: 2 }}>{s.l}</div>
                </div>
              ))}
            </div>
            <h1 style={{ fontSize: "clamp(1.6rem,3.5vw,2.6rem)", fontWeight: 900, color: "#fff", margin: "0 0 8px" }}>🏅 {t.title}</h1>
            <p style={{ color: "rgba(255,255,255,.65)", fontSize: 14, margin: 0 }}>{t.subtitle}</p>
            <p style={{ color: "rgba(255,255,255,.45)", fontSize: 12, margin: "8px 0 0", maxWidth: 720, lineHeight: 1.7 }}>{t.systemNote}</p>
          </div>
        </div>

        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "28px 5%" }}>
          {/* FILTERS */}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 24, alignItems: "center" }}>
            <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t.searchPlaceholder}
                style={{ ...inp, width: "100%", padding: "11px 40px 11px 14px", cursor: "text", boxSizing: "border-box" }} />
              <span style={{ position: "absolute", top: "50%", transform: "translateY(-50%)", insetInlineEnd: 12, color: "var(--gray)" }}>🔍</span>
            </div>
            <select value={filterBrand} onChange={(e) => setFilterBrand(e.target.value)} style={inp}>
              <option value="all">{t.brand}: {t.filterAll}</option>
              {UNIQUE_BRANDS.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
            <select value={filterIssuer} onChange={(e) => setFilterIssuer(e.target.value)} style={inp}>
              <option value="all">{t.issuer}: {t.filterAll}</option>
              {UNIQUE_ISSUERS.map((iss) => <option key={iss} value={iss}>{iss}</option>)}
            </select>
            <select value={filterType} onChange={(e) => setFilterType(e.target.value as "all" | Kind)} style={inp}>
              <option value="all">{t.typeFilter}: {t.filterAll}</option>
              <option value="system">{t.typeSystem}</option>
              <option value="product">{t.typeProduct}</option>
            </select>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--gray)", whiteSpace: "nowrap" }}>
              {filtered.length} {lang === "ar" ? "شهادة" : "certificates"}
            </div>
          </div>

          {/* CERTIFICATES GRID */}
          {filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: 60, color: "var(--gray)", fontSize: 14 }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🏅</div>
              {t.noCerts}
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 16 }}>
              {filtered.map((c) => (
                <div key={c.id} style={{ background: "var(--white)", border: "1px solid var(--gray-light)", borderRadius: 14, padding: 20, display: "flex", flexDirection: "column", gap: 14, transition: "box-shadow .25s, transform .25s" }}
                  onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 10px 36px rgba(0,81,162,.14)"; e.currentTarget.style.transform = "translateY(-3px)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "none"; }}>
                  {/* Header */}
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                    <div style={{ width: 46, height: 46, background: "linear-gradient(135deg, var(--blue-light), var(--blue-soft))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0, borderRadius: 10 }}>🏅</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 800, fontSize: 14.5, color: "var(--text)", lineHeight: 1.35, marginBottom: 5 }}>
                        {lang === "ar" ? c.nameAr : c.nameEn}
                      </div>
                      <div style={{ fontSize: 12, color: "var(--blue)", fontWeight: 800 }}>{c.brand}</div>
                    </div>
                    <span style={{ background: "var(--blue-light)", color: "var(--blue)", fontSize: 12, fontWeight: 800, padding: "4px 10px", borderRadius: 6, flexShrink: 0 }}>{c.year}</span>
                  </div>

                  <span style={{ alignSelf: "flex-start", fontSize: 10.5, fontWeight: 800, padding: "3px 10px", borderRadius: 6, background: c.kind === "system" ? "#eef2ff" : "#ecfdf5", color: c.kind === "system" ? "#4338ca" : "#047857" }}>
                    {c.kind === "system" ? t.typeSystem : t.typeProduct}
                  </span>

                  <div style={{ height: 1, background: "var(--gray-light)" }} />

                  {/* Meta rows */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 7, fontSize: 12.5 }}>
                    {[
                      [t.standard, c.standard],
                      [t.issuer, c.issuer],
                      [t.certNo, c.certNumber],
                      [t.validity, c.to ? `${fmtDate(c.from, lang)} — ${fmtDate(c.to, lang)}` : fmtDate(c.from, lang)],
                    ].map(([k, v]) => (
                      <div key={k} style={{ display: "flex", gap: 8 }}>
                        <span style={{ color: "var(--gray)", fontWeight: 700, minWidth: 92, flexShrink: 0 }}>{k}</span>
                        <span style={{ color: "var(--text2)", fontWeight: 700 }} dir={/[0-9A-Za-z]/.test(String(v)[0]) ? "ltr" : undefined}>{v}</span>
                      </div>
                    ))}
                    <div style={{ marginTop: 2 }}>
                      <div style={{ color: "var(--gray)", fontWeight: 700, marginBottom: 3 }}>{t.scope}</div>
                      <div style={{ color: "var(--text2)", fontSize: 12, lineHeight: 1.75 }}>{lang === "ar" ? c.scopeAr : c.scopeEn}</div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: "flex", gap: 8, marginTop: "auto" }}>
                    <a href={c.fileUrl} target="_blank" rel="noopener noreferrer"
                      style={{ flex: 1, background: "var(--blue)", color: "#fff", textDecoration: "none", textAlign: "center", padding: "10px 12px", fontSize: 12.5, fontWeight: 800, borderRadius: 8 }}>
                      📄 {t.download}
                    </a>
                    {c.verifyUrl && (
                      <a href={c.verifyUrl} target="_blank" rel="noopener noreferrer"
                        style={{ background: "var(--blue-light)", color: "var(--blue)", textDecoration: "none", textAlign: "center", padding: "10px 14px", fontSize: 12.5, fontWeight: 800, borderRadius: 8, whiteSpace: "nowrap" }}>
                        ✓ {t.verify}
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <SiteFooter lang={lang} />
      </div>
    </>
  );
}
