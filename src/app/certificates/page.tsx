"use client";

import { useState } from "react";
import { PRODUCTS, CATEGORIES, formatPrice, type Currency, type Product } from "@/lib/products";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";

type Lang = "ar" | "en";

const T = {
  ar: {
    title: "أرشيف شهادات الجودة",
    subtitle: "جميع شهادات المطابقة والجودة الدولية لمنتجاتنا",
    back: "→ الكتالوج",
    allCerts: "كل الشهادات",
    issuer: "الجهة المانحة",
    year: "سنة الإصدار",
    product: "المنتج",
    brand: "العلامة",
    download: "تحميل PDF",
    noCerts: "لا توجد شهادات في هذه الفئة",
    searchPlaceholder: "ابحث عن شهادة أو منتج...",
    total: "إجمالي الشهادات",
    certifiedProducts: "منتج معتمد",
    internationalBodies: "جهة اعتماد دولية",
    filter: "فلترة حسب",
    filterAll: "الكل",
    typeFilter: "نوع الشهادة",
    typeSystem: "نظام إدارة الجودة (منشأة)",
    typeProduct: "مطابقة منتج",
    systemNote: "شهادة نظام إدارة جودة للمنشأة/المصنع — لا تعني تلقائياً مطابقة منتج بعينه.",
  },
  en: {
    title: "Quality Certificates Archive",
    subtitle: "All international compliance and quality certificates for our products",
    back: "← Catalog",
    allCerts: "All Certificates",
    issuer: "Issuer",
    year: "Year",
    product: "Product",
    brand: "Brand",
    download: "Download PDF",
    noCerts: "No certificates in this category",
    searchPlaceholder: "Search certificate or product...",
    total: "Total Certificates",
    certifiedProducts: "Certified Products",
    internationalBodies: "International Bodies",
    filter: "Filter by",
    filterAll: "All",
    typeFilter: "Certificate Type",
    typeSystem: "Quality Management System (Facility)",
    typeProduct: "Product Conformity",
    systemNote: "Facility/manufacturer quality-management-system certificate — does not by itself imply conformity of a specific product.",
  },
};

// A certificate is only published when it has verified data: a real granting
// authority (not empty / "Unknown") AND an explicit certificate file. This enforces
// the review requirement that no certificate is shown without complete documentation.
function isComplete(c: { issuer?: string; nameAr?: string; nameEn?: string; fileUrl?: string }) {
  const issuerOk = !!c.issuer && !/^\s*unknown\s*$/i.test(c.issuer) && !/غير معروف/.test(c.issuer);
  const fileOk = !!c.fileUrl && c.fileUrl.trim() !== "" && c.fileUrl !== "#";
  const nameOk = !!(c.nameAr || c.nameEn);
  return issuerOk && fileOk && nameOk;
}

// §8: ISO 9001 must be classified as a quality-management-system certificate for
// the facility/manufacturer — NOT automatically a product-conformity certificate.
// Heuristic: name/scope mentioning ISO 9001 (or a quality-management system) => system.
function certKind(nameAr: string, nameEn: string): "system" | "product" {
  const s = `${nameAr} ${nameEn}`.toLowerCase();
  if (/iso\s*9001|9001|إدارة الجودة|quality management/.test(s)) return "system";
  return "product";
}

function buildCertList() {
  const list: Array<{
    certNameAr: string; certNameEn: string;
    issuer: string; year: number; fileUrl?: string;
    product: Product; categoryId: string; kind: "system" | "product";
  }> = [];
  PRODUCTS.forEach((p) => {
    p.certificates.forEach((c) => {
      if (!isComplete(c)) return; // skip incomplete / unverified certificates
      list.push({
        certNameAr: c.nameAr,
        certNameEn: c.nameEn,
        issuer: c.issuer as string,
        year: c.year || 2024,
        fileUrl: c.fileUrl,
        product: p,
        categoryId: p.categoryId,
        kind: certKind(c.nameAr, c.nameEn),
      });
    });
  });
  return list;
}

const ALL_CERTS = buildCertList();
const UNIQUE_ISSUERS = [...new Set(ALL_CERTS.map(c => c.issuer))];
const CERTIFIED_PRODUCTS = [...new Set(ALL_CERTS.map(c => c.product.id))].length;

export default function CertificatesPage() {
  const [lang, setLang] = useState<Lang>("ar");
  const [search, setSearch] = useState("");
  const [filterIssuer, setFilterIssuer] = useState("all");
  const [filterCat, setFilterCat] = useState("all");
  const [filterType, setFilterType] = useState<"all" | "system" | "product">("all");

  const t = T[lang];
  const dir = lang === "ar" ? "rtl" : "ltr";

  const filtered = ALL_CERTS.filter((c) => {
    const q = search.toLowerCase();
    const nameMatch = (lang === "ar" ? c.certNameAr : c.certNameEn).toLowerCase().includes(q)
      || (lang === "ar" ? c.product.nameAr : c.product.nameEn).toLowerCase().includes(q)
      || c.issuer.toLowerCase().includes(q);
    const issuerMatch = filterIssuer === "all" || c.issuer === filterIssuer;
    const catMatch = filterCat === "all" || c.categoryId === filterCat;
    const typeMatch = filterType === "all" || c.kind === filterType;
    return nameMatch && issuerMatch && catMatch && typeMatch;
  });

  return (
    <div style={{ minHeight: "100vh", background: "var(--off)", fontFamily: "'Cairo', sans-serif" }} dir={dir} lang={lang}>
      <SiteHeader lang={lang} onToggleLang={() => setLang(l => l === "ar" ? "en" : "ar")} />
      <style>{`
        :root { --blue:#0051a2;--blue-dark:#003578;--blue-deeper:#001f4d;--blue-light:#e8f2fc;--accent:#f59e0b;--white:#fff;--off:#f7f9fc;--gray:#64748b;--gray-light:#e2e8f0;--text:#0f1c2e;--text2:#3d5473; }
        body { font-family: 'Cairo', sans-serif; }
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap');
      `}</style>

      {/* TOP NAV */}
      <div style={{ background: "var(--blue-deeper)", padding: "0 5%", display: "flex", alignItems: "center", justifyContent: "space-between", height: 60 }}>
        <a href="/products" style={{ color: "#fff", textDecoration: "none", fontSize: 13, fontWeight: 700 }}>{t.back}</a>
        <button onClick={() => setLang(l => l === "ar" ? "en" : "ar")} style={{ background: "rgba(255,255,255,.15)", border: "none", color: "#fff", padding: "6px 14px", fontSize: 12, fontWeight: 800, cursor: "pointer" }}>
          {lang === "ar" ? "EN" : "AR"}
        </button>
      </div>

      {/* HERO */}
      <div style={{ background: "linear-gradient(135deg, var(--blue-deeper), #003578)", padding: "48px 5% 36px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24 }}>
            {[
              { n: ALL_CERTS.length, l: t.total },
              { n: CERTIFIED_PRODUCTS, l: t.certifiedProducts },
              { n: UNIQUE_ISSUERS.length, l: t.internationalBodies },
            ].map((s, i) => (
              <div key={i} style={{ background: "rgba(255,255,255,.1)", border: "1px solid rgba(255,255,255,.15)", padding: "14px 24px", textAlign: "center", minWidth: 120 }}>
                <div style={{ fontSize: 28, fontWeight: 900, color: "#fff" }}>{s.n}</div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,.6)", fontWeight: 700, marginTop: 2 }}>{s.l}</div>
              </div>
            ))}
          </div>
          <h1 style={{ fontSize: "clamp(1.6rem,3.5vw,2.6rem)", fontWeight: 900, color: "#fff", margin: "0 0 8px" }}>🏅 {t.title}</h1>
          <p style={{ color: "rgba(255,255,255,.6)", fontSize: 14, margin: 0 }}>{t.subtitle}</p>
          <p style={{ color: "rgba(255,255,255,.45)", fontSize: 12, margin: "8px 0 0" }}>
            {lang === "ar"
              ? "تُعرض الشهادات فقط بعد توثيقها بالكامل (الجهة المانحة والملف الرسمي)."
              : "Certificates are shown only after full documentation (granting authority and official file)."}
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "28px 5%" }}>
        {/* FILTERS */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 24, alignItems: "center" }}>
          <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder={t.searchPlaceholder}
              style={{ width: "100%", padding: "11px 40px 11px 14px", border: "1.5px solid var(--gray-light)", background: "var(--white)", color: "var(--text)", fontFamily: "inherit", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
            <span style={{ position: "absolute", top: "50%", transform: "translateY(-50%)", insetInlineEnd: 12, color: "var(--gray)" }}>🔍</span>
          </div>
          <select value={filterIssuer} onChange={e => setFilterIssuer(e.target.value)}
            style={{ padding: "11px 14px", border: "1.5px solid var(--gray-light)", background: "var(--white)", color: "var(--text)", fontFamily: "inherit", fontSize: 13, cursor: "pointer", outline: "none" }}>
            <option value="all">{t.issuer}: {t.filterAll}</option>
            {UNIQUE_ISSUERS.map(iss => <option key={iss} value={iss}>{iss}</option>)}
          </select>
          <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
            style={{ padding: "11px 14px", border: "1.5px solid var(--gray-light)", background: "var(--white)", color: "var(--text)", fontFamily: "inherit", fontSize: 13, cursor: "pointer", outline: "none" }}>
            {CATEGORIES.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.icon} {lang === "ar" ? cat.nameAr : cat.nameEn}</option>
            ))}
          </select>
          <select value={filterType} onChange={e => setFilterType(e.target.value as "all" | "system" | "product")}
            style={{ padding: "11px 14px", border: "1.5px solid var(--gray-light)", background: "var(--white)", color: "var(--text)", fontFamily: "inherit", fontSize: 13, cursor: "pointer", outline: "none" }}>
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
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 3, background: "var(--gray-light)" }}>
            {filtered.map((c, i) => (
              <div key={i} style={{ background: "var(--white)", padding: 20, display: "flex", flexDirection: "column", gap: 12, transition: "box-shadow .25s" }}
                onMouseEnter={e => (e.currentTarget.style.boxShadow = "0 8px 32px rgba(0,81,162,.12)")}
                onMouseLeave={e => (e.currentTarget.style.boxShadow = "none")}>
                {/* Cert header */}
                <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                  <div style={{ width: 44, height: 44, background: "linear-gradient(135deg, var(--blue-light), var(--blue-soft))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>
                    🏅
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 14, color: "var(--text)", lineHeight: 1.3, marginBottom: 3 }}>
                      {lang === "ar" ? c.certNameAr : c.certNameEn}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--blue)", fontWeight: 700, display: "flex", alignItems: "center", gap: 4, marginBottom: 4 }}>
                      <span>🏢</span> {c.issuer}
                    </div>
                    <span style={{
                      display: "inline-block", fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 4,
                      background: c.kind === "system" ? "#eef2ff" : "#ecfdf5",
                      color: c.kind === "system" ? "#4338ca" : "#047857",
                    }}>
                      {c.kind === "system" ? t.typeSystem : t.typeProduct}
                    </span>
                  </div>
                  <div style={{ marginInlineStart: "auto", background: "var(--blue-light)", color: "var(--blue)", fontSize: 12, fontWeight: 800, padding: "4px 10px", flexShrink: 0 }}>
                    {c.year}
                  </div>
                </div>

                {/* Divider */}
                <div style={{ height: 1, background: "var(--gray-light)" }} />

                {/* Product info */}
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={c.product.imageUrl} alt={c.product.nameAr}
                    style={{ width: 52, height: 40, objectFit: "cover", flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: 11, color: "var(--gray)", fontWeight: 600 }}>{t.product}</div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: "var(--text2)" }}>
                      {lang === "ar" ? c.product.nameAr : c.product.nameEn}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--blue)", fontWeight: 700 }}>{c.product.brand}</div>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                  <a href={c.fileUrl} target="_blank" rel="noopener noreferrer"
                    style={{ flex: 1, background: "var(--blue)", color: "#fff", textDecoration: "none", textAlign: "center", padding: "9px 12px", fontSize: 12, fontWeight: 700 }}>
                    📄 {t.download}
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <SiteFooter lang={lang} />
    </div>
  );
}
