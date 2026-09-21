"use client";

import { useState, useEffect } from "react";
import { getCaseStudies } from "@/app/cms-actions";

type CaseStudy = { id: string; title: string; description: string; status: string; owner: string; imageUrls: string[]; productIds: string[] };

export default function CaseStudiesPage() {
  const [items, setItems] = useState<CaseStudy[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<CaseStudy | null>(null);

  useEffect(() => {
    getCaseStudies().then((d) => { setItems(d as CaseStudy[]); setLoading(false); });
  }, []);

  return (
    <div style={{ maxWidth: 1100, margin: "40px auto", padding: 20, fontFamily: "'Cairo', sans-serif" }} dir="rtl">
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <h1 style={{ color: "var(--primary)" }}>🏗️ معرض المشاريع</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 16 }}>
          مشاريع منفّذة بمواد وأنظمة الشعلة الرائدة — الحالة، الأنظمة المستخدمة، والجهة المالكة.
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 50, color: "var(--gray)" }}>جارٍ التحميل...</div>
      ) : items.length === 0 ? (
        <div style={{ textAlign: "center", padding: 50, color: "var(--gray)" }}>
          لم تُضف مشاريع بعد. تُدار من لوحة الإدارة.
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 24 }}>
          {items.map((c) => (
            <div key={c.id} onClick={() => setActive(c)}
              style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden", cursor: "pointer" }}>
              <div style={{ height: 180, background: "#e2e8f0", backgroundImage: c.imageUrls[0] ? `url(${c.imageUrls[0]})` : undefined, backgroundSize: "cover", backgroundPosition: "center" }} />
              <div style={{ padding: 18 }}>
                <span style={{ fontSize: 11, fontWeight: 800, color: "#059669", background: "#d1fae5", padding: "3px 8px", borderRadius: 4 }}>{c.status}</span>
                <h3 style={{ margin: "10px 0 6px", fontSize: 17 }}>{c.title}</h3>
                {c.owner && <div style={{ fontSize: 12, color: "var(--gray)" }}>الجهة المالكة: {c.owner}</div>}
              </div>
            </div>
          ))}
        </div>
      )}

      {active && (
        <div onClick={() => setActive(null)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.6)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, zIndex: 100 }}>
          <div onClick={(e) => e.stopPropagation()}
            style={{ background: "#fff", borderRadius: 14, maxWidth: 700, width: "100%", maxHeight: "90vh", overflowY: "auto", padding: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
              <h2 style={{ margin: 0 }}>{active.title}</h2>
              <button onClick={() => setActive(null)} style={{ border: "none", background: "none", fontSize: 22, cursor: "pointer" }}>×</button>
            </div>
            <div style={{ fontSize: 13, color: "var(--gray)", margin: "6px 0 16px" }}>{active.status} {active.owner && `· ${active.owner}`}</div>
            {active.imageUrls.length > 0 && (
              <div style={{ display: "flex", gap: 8, overflowX: "auto", marginBottom: 16 }}>
                {active.imageUrls.map((src, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={i} src={src} alt="" style={{ height: 200, borderRadius: 8, objectFit: "cover" }} />
                ))}
              </div>
            )}
            <p style={{ lineHeight: 1.9, whiteSpace: "pre-wrap" }}>{active.description}</p>
            {active.productIds.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <h4>الأنظمة والمنتجات المستخدمة:</h4>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {active.productIds.map((pid) => (
                    <a key={pid} href={`/products?q=${encodeURIComponent(pid)}`}
                      style={{ background: "var(--blue-light, #e8f2fc)", color: "var(--blue-deeper, #001f4d)", padding: "6px 12px", borderRadius: 20, fontSize: 13, textDecoration: "none", fontWeight: 700 }}>
                      {pid} ↗
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
