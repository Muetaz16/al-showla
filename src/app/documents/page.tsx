"use client";

import { useState, useEffect, useMemo } from "react";
import { getTechnicalDocuments } from "@/app/cms-actions";

type Doc = { id: string; title: string; docType: string; fileUrl: string; brandId?: string | null; productId?: string | null };

export default function TechnicalDocumentsPage() {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterBrand, setFilterBrand] = useState("all");

  useEffect(() => {
    getTechnicalDocuments().then((data) => {
      setDocs(data as Doc[]);
      setLoading(false);
    });
  }, []);

  const brands = useMemo(
    () => Array.from(new Set(docs.map((d) => d.brandId).filter(Boolean))) as string[],
    [docs],
  );

  const filteredDocs = docs.filter((d) => {
    const q = search.toLowerCase();
    const matchQ = d.title.toLowerCase().includes(q) || (d.brandId || "").toLowerCase().includes(q) || (d.productId || "").toLowerCase().includes(q);
    const matchType = filterType === "all" || d.docType === filterType;
    const matchBrand = filterBrand === "all" || d.brandId === filterBrand;
    return matchQ && matchType && matchBrand;
  });

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "TDS": return "ملف فني (TDS)";
      case "SDS": return "بيانات السلامة (SDS)";
      case "Catalog": return "كتالوج";
      default: return type;
    }
  };
  const getTypeColor = (type: string) => {
    switch (type) {
      case "TDS": return "#3b82f6";
      case "SDS": return "#ef4444";
      case "Catalog": return "#8b5cf6";
      default: return "#64748b";
    }
  };

  return (
    <div style={{ maxWidth: 1000, margin: "40px auto", padding: 20, fontFamily: "'Cairo', sans-serif" }} dir="rtl">
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <h1 style={{ color: "var(--primary)" }}>📚 المكتبة الفنية</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 16 }}>
          تصفح وحمل الملفات الفنية (TDS)، بيانات السلامة (SDS)، والكتالوجات. تُدار من إدارة الشركة.
        </p>
      </div>

      {/* Toolbar */}
      <div style={{ display: "flex", gap: 15, marginBottom: 30, flexWrap: "wrap" }}>
        <input
          placeholder="ابحث باسم الملف أو العلامة أو المنتج..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: "1 1 260px", padding: 12, borderRadius: 8, border: "1px solid var(--border)", fontFamily: "inherit" }}
        />
        <select value={filterType} onChange={(e) => setFilterType(e.target.value)}
          style={{ padding: 12, borderRadius: 8, border: "1px solid var(--border)", fontFamily: "inherit" }}>
          <option value="all">جميع الأنواع</option>
          <option value="TDS">ملفات فنية (TDS)</option>
          <option value="SDS">بيانات السلامة (SDS)</option>
          <option value="Catalog">كتالوجات</option>
        </select>
        {brands.length > 0 && (
          <select value={filterBrand} onChange={(e) => setFilterBrand(e.target.value)}
            style={{ padding: 12, borderRadius: 8, border: "1px solid var(--border)", fontFamily: "inherit" }}>
            <option value="all">جميع العلامات</option>
            {brands.map((b) => <option key={b} value={b}>{b}</option>)}
          </select>
        )}
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 50, color: "var(--gray)" }}>جارٍ التحميل...</div>
      ) : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
            {filteredDocs.map((doc) => (
              <div key={doc.id} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 20, display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 15 }}>
                  <span style={{ fontSize: 32 }}>📄</span>
                  <span style={{ background: `${getTypeColor(doc.docType)}22`, color: getTypeColor(doc.docType), padding: "4px 8px", borderRadius: 4, fontSize: 11, fontWeight: "bold" }}>
                    {getTypeLabel(doc.docType)}
                  </span>
                </div>
                <h3 style={{ fontSize: 16, margin: "0 0 10px 0", lineHeight: 1.4 }}>{doc.title}</h3>
                {(doc.brandId || doc.productId) && (
                  <p style={{ fontSize: 12, color: "var(--gray)", margin: "0 0 20px 0" }}>{doc.brandId || doc.productId}</p>
                )}
                <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer"
                  style={{ marginTop: "auto", display: "block", textAlign: "center", background: "var(--blue-light, #e8f2fc)", color: "var(--blue-deeper, #001f4d)", padding: "10px", borderRadius: 8, textDecoration: "none", fontWeight: "bold" }}>
                  📥 تحميل الملف
                </a>
              </div>
            ))}
          </div>

          {filteredDocs.length === 0 && (
            <div style={{ textAlign: "center", padding: 50, color: "var(--gray)" }}>
              {docs.length === 0 ? "لم تُضف وثائق بعد. تُدار المكتبة من لوحة الإدارة." : "لم يتم العثور على ملفات تطابق بحثك."}
            </div>
          )}
        </>
      )}
    </div>
  );
}
