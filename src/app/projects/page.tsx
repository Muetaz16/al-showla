"use client";

import { useState, useEffect } from "react";
import { useLang } from "@/lib/useLang";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import { getCaseStudies } from "@/app/cms-actions";
import { PROJECTS } from "@/lib/company-data";
import { Building2, Truck, MapPin } from "lucide-react";

type Lang = "ar" | "en" | "tr";

const T = {
  ar: {
    title: "مشاريعنا المنفذة",
    subtitle: "مشاريع نفخر بالمساهمة في إنجازها عبر توريد مواد البناء والحلول الإنشائية",
    gallery: "معرض المشاريع",
    featured: "مشاريع ساهمنا فيها",
    supply: "توريدات عامة",
    owner: "الجهة المالكة",
    status: "الحالة",
    empty: "سيتم عرض المشاريع هنا قريبًا.",
    parties: "الجهات المنفذة",
  },
  en: {
    title: "Our Completed Projects",
    subtitle: "Projects we are proud to have contributed to by supplying building materials and construction solutions",
    gallery: "Project Gallery",
    featured: "Projects We Contributed To",
    supply: "General Supplies",
    owner: "Owner",
    status: "Status",
    empty: "Projects will be shown here soon.",
    parties: "Executing Parties",
  },
  tr: {
    title: "Tamamlanan Projelerimiz",
    subtitle: "Yapı malzemeleri ve inşaat çözümleri tedarik ederek katkıda bulunmaktan gurur duyduğumuz projeler",
    gallery: "Proje Galerisi",
    featured: "Katkıda Bulunduğumuz Projeler",
    supply: "Genel Tedarik",
    owner: "İşveren",
    status: "Durum",
    empty: "Projeler yakında burada gösterilecek.",
    parties: "Yüklenici Firmalar",
  },
};

type CaseStudy = {
  id: string;
  title: string;
  description: string;
  status: string;
  owner: string;
  imageUrls: string[];
  productIds: string[];
};

export default function ProjectsPage() {
  const [lang, setLang] = useLang();
  const isAr = lang === "ar";
  const t = T[lang as "ar" | "en"] ?? T.en;
  const [cases, setCases] = useState<CaseStudy[]>([]);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState<string | null>(null);

  useEffect(() => {
    getCaseStudies().then((data) => {
      setCases((data as CaseStudy[]).filter((c) => c && c.title));
      setLoading(false);
    });
  }, []);

  const major = PROJECTS.filter((p) => p.group === "major");
  const supply = PROJECTS.filter((p) => p.group === "supply");

  return (
    <>
      <SiteHeader lang={lang} onToggleLang={() => setLang((l) => (l === "ar" ? "en" : "ar"))} />

      <div dir={isAr ? "rtl" : "ltr"} style={{ fontFamily: "'Cairo', sans-serif", color: "var(--text, #0a1a33)" }}>
        {/* Hero */}
        <div style={{ background: "linear-gradient(135deg, var(--primary, #0051a2), #001f4d)", color: "#fff", padding: "64px 20px 56px", textAlign: "center" }}>
          <div style={{ maxWidth: 820, margin: "0 auto" }}>
            <h1 style={{ fontSize: "clamp(28px, 5vw, 44px)", fontWeight: 900, margin: "0 0 14px" }}>{t.title}</h1>
            <p style={{ fontSize: "clamp(15px, 2.3vw, 18px)", opacity: 0.9, lineHeight: 1.7, margin: 0 }}>{t.subtitle}</p>
          </div>
        </div>

        <div style={{ maxWidth: 1120, margin: "0 auto", padding: "48px 20px 72px" }}>
          {/* Admin-managed case studies with images */}
          {!loading && cases.length > 0 && (
            <section style={{ marginBottom: 56 }}>
              <SectionTitle>{t.gallery}</SectionTitle>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 24 }}>
                {cases.map((c) => (
                  <article key={c.id} style={{ background: "var(--surface, #fff)", border: "1px solid var(--border, #e6ebf2)", borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 14px rgba(0,31,77,.06)", display: "flex", flexDirection: "column" }}>
                    {c.imageUrls && c.imageUrls.length > 0 ? (
                      <div style={{ position: "relative", aspectRatio: "16 / 10", background: "#eef2f7", cursor: "pointer" }} onClick={() => setLightbox(c.imageUrls[0])}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={c.imageUrls[0]} alt={c.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        {c.imageUrls.length > 1 && (
                          <span style={{ position: "absolute", bottom: 10, insetInlineEnd: 10, background: "rgba(0,0,0,.6)", color: "#fff", fontSize: 12, padding: "3px 9px", borderRadius: 20 }}>+{c.imageUrls.length - 1}</span>
                        )}
                      </div>
                    ) : (
                      <div style={{ aspectRatio: "16 / 10", background: "linear-gradient(135deg,#eef3fa,#dbe6f5)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--primary,#0051a2)" }}>
                        <Building2 size={46} strokeWidth={1.4} />
                      </div>
                    )}
                    <div style={{ padding: 18, display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {c.status && <span style={{ background: "#e8f5e9", color: "#1b7a3d", fontSize: 12, fontWeight: 700, padding: "3px 10px", borderRadius: 20 }}>{c.status}</span>}
                      </div>
                      <h3 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>{c.title}</h3>
                      {c.owner && <div style={{ fontSize: 13, color: "var(--text-secondary, #5a6b82)" }}><strong>{t.owner}:</strong> {c.owner}</div>}
                      {c.description && <p style={{ fontSize: 14, lineHeight: 1.7, color: "var(--text-secondary, #5a6b82)", margin: "2px 0 0" }}>{c.description}</p>}
                      {/* thumbnails */}
                      {c.imageUrls && c.imageUrls.length > 1 && (
                        <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
                          {c.imageUrls.slice(1, 5).map((u, i) => (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img key={i} src={u} alt="" onClick={() => setLightbox(u)} style={{ width: 54, height: 54, objectFit: "cover", borderRadius: 8, cursor: "pointer", border: "1px solid var(--border,#e6ebf2)" }} />
                          ))}
                        </div>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}

          {/* Featured project list (static, client-supplied) */}
          <section>
            <SectionTitle>{t.featured}</SectionTitle>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 18 }}>
              {major.map((p, i) => (
                <div key={i} style={{ background: "var(--surface, #fff)", border: "1px solid var(--border, #e6ebf2)", borderRadius: 14, padding: 20, boxShadow: "0 2px 10px rgba(0,31,77,.05)" }}>
                  <div style={{ width: 42, height: 42, borderRadius: 10, background: "var(--primary,#0051a2)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
                    <Building2 size={20} />
                  </div>
                  <h3 style={{ fontSize: 16, fontWeight: 800, margin: "0 0 8px" }}>{isAr ? p.titleAr : p.titleEn}</h3>
                  {p.parties.length > 0 && (
                    <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 4 }}>
                      {p.parties.map(([ar, en], j) => (
                        <li key={j} style={{ fontSize: 13, color: "var(--text-secondary, #5a6b82)", display: "flex", gap: 6 }}>
                          <MapPin size={13} style={{ marginTop: 3, flexShrink: 0, color: "var(--primary,#0051a2)" }} /> {isAr ? ar : en}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>

            {/* Supply */}
            {supply.length > 0 && (
              <div style={{ marginTop: 28, background: "var(--off, #f4f8fd)", border: "1px solid var(--border,#e6ebf2)", borderRadius: 14, padding: 22 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 800, marginBottom: 12, color: "var(--primary,#0051a2)" }}>
                  <Truck size={18} /> {t.supply}
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                  {supply.map((p, i) => (
                    <span key={i} style={{ background: "var(--surface,#fff)", border: "1px solid var(--border,#e6ebf2)", borderRadius: 20, padding: "6px 14px", fontSize: 13 }}>
                      {isAr ? p.titleAr : p.titleEn}{p.parties[0] ? ` — ${isAr ? p.parties[0][0] : p.parties[0][1]}` : ""}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </section>
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div onClick={() => setLightbox(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.85)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={lightbox} alt="" style={{ maxWidth: "95%", maxHeight: "95%", objectFit: "contain", borderRadius: 8 }} />
        </div>
      )}

      <SiteFooter lang={lang} />
    </>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{ fontSize: "clamp(20px, 3.4vw, 28px)", fontWeight: 900, margin: "0 0 22px", color: "var(--primary, #0051a2)", display: "flex", alignItems: "center", gap: 10 }}>
      <span style={{ width: 5, height: 26, background: "var(--gold, #c9a227)", borderRadius: 4, display: "inline-block" }} />
      {children}
    </h2>
  );
}
