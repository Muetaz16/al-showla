"use client";

import { useState, useEffect } from "react";
import { getApplicators } from "@/app/cms-actions";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";

type Applicator = { id: string; name: string; systemSpecialty: string; contactInfo: any; certifications: string[] };

export default function ApplicatorsPage() {
  const [items, setItems] = useState<Applicator[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  useEffect(() => {
    getApplicators().then((d) => { setItems(d as Applicator[]); setLoading(false); });
  }, []);

  const filtered = items.filter((a) =>
    a.name.toLowerCase().includes(q.toLowerCase()) || (a.systemSpecialty || "").toLowerCase().includes(q.toLowerCase()),
  );

  return (
      <>
      <SiteHeader />
    <div style={{ maxWidth: 1000, margin: "40px auto", padding: 20, fontFamily: "'Cairo', sans-serif" }} dir="rtl">
      <div style={{ textAlign: "center", marginBottom: 30 }}>
        <h1 style={{ color: "var(--primary)" }}>👷 دليل المطبّقين المعتمدين</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 16 }}>
          شركات التطبيق المعتمدة والأنظمة التي تتخصص فيها وبيانات التواصل معها.
        </p>
      </div>

      <input placeholder="ابحث بالاسم أو نوع النظام..." value={q} onChange={(e) => setQ(e.target.value)}
        style={{ width: "100%", padding: 12, borderRadius: 8, border: "1px solid var(--border)", fontFamily: "inherit", marginBottom: 24 }} />

      {loading ? (
        <div style={{ textAlign: "center", padding: 50, color: "var(--gray)" }}>جارٍ التحميل...</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: 50, color: "var(--gray)" }}>
          {items.length === 0 ? "لم تُضف شركات تطبيق بعد. يُدار الدليل من لوحة الإدارة." : "لا نتائج مطابقة."}
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
          {filtered.map((a) => (
            <div key={a.id} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 20 }}>
              {a.contactInfo?.logo && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={a.contactInfo.logo} alt={a.name} loading="lazy" style={{ height: 90, maxWidth: "100%", objectFit: "contain", display: "block", marginBottom: 14 }} />
              )}
              <h3 style={{ margin: "0 0 6px" }}>{a.name}</h3>
              <div style={{ fontSize: 13, color: "var(--blue)", fontWeight: 700, marginBottom: 10 }}>{a.systemSpecialty}</div>
              {a.contactInfo?.description && (
                <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.9, margin: "0 0 12px" }}>{a.contactInfo.description}</p>
              )}
              {a.certifications?.length > 0 && (
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
                  {a.certifications.map((c, i) => (
                    <span key={i} style={{ fontSize: 11, background: "#fef3c7", color: "#b45309", padding: "3px 8px", borderRadius: 4, fontWeight: 700 }}>{c}</span>
                  ))}
                </div>
              )}
              <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.9 }}>
                {a.contactInfo?.phone && <div>📞 <a href={`tel:${a.contactInfo.phone.replace(/\D/g, "").replace(/^0/, "+218")}`} dir="ltr" style={{ color: "inherit" }}>{a.contactInfo.phone}</a></div>}
                {a.contactInfo?.city && <div>📍 {a.contactInfo.city}</div>}
                {a.contactInfo?.email && <div>✉️ {a.contactInfo.email}</div>}
              </div>
              {(a.contactInfo?.facebook || a.contactInfo?.linkedin) && (
                <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
                  {a.contactInfo.facebook && <a href={a.contactInfo.facebook} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, fontWeight: 700, color: "#1877f2", textDecoration: "none" }}>Facebook</a>}
                  {a.contactInfo.linkedin && <a href={a.contactInfo.linkedin} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, fontWeight: 700, color: "#0a66c2", textDecoration: "none" }}>LinkedIn</a>}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
      <SiteFooter />
      </>
  );
}
