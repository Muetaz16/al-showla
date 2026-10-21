"use client";

// Organizational structure (الهيكل التنظيمي) — its own page under the "Company" menu.
// Team-card layout requested by the client: one portrait card per person (photo, name,
// department, phone, email). People without a photo yet show their initials.

import { useLang } from "@/lib/useLang";
import { Phone, Mail } from "lucide-react";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import { DEPARTMENTS, deptPeople, libyanPhone } from "@/lib/company-data";

// Chairman's official photo (already on the site); others are added via Department.photos.
const CHAIRMAN_PHOTO = "/chairman.jpg";

function initials(name: string) {
  // First letter of the first name as written (so "الزبير" -> "ا"), and of the family
  // name without its "ال"/"Al-" article (so "البركي" -> "ب").
  const words = name.replace(/^(م\.|Eng\.)\s*/, "").trim().split(/\s+/).filter(Boolean);
  const first = words[0] ?? "";
  const last = words.length > 1 ? words[words.length - 1].replace(/^ال/, "").replace(/^Al-/i, "") : "";
  // Letters are returned separately and rendered in their own boxes, so Arabic
  // letters never join into an (unintended) word.
  return [first, last].filter(Boolean).map((p) => p.charAt(0).toUpperCase());
}

export default function DepartmentsPage() {
  const [lang, setLang] = useLang();
  const isAr = lang === "ar";

  // One card per person, chairman first.
  const people = DEPARTMENTS.flatMap((d, di) =>
    deptPeople(d, isAr).map((name, pi) => ({
      name,
      dept: isAr ? d.nameAr : d.nameEn,
      photo: d.photos?.[pi] ?? (di === 0 && pi === 0 ? CHAIRMAN_PHOTO : undefined),
      head: di === 0,
      phone: libyanPhone(d.phone),
      email: d.email,
    })),
  );

  return (
    <div dir={isAr ? "rtl" : "ltr"} style={{ minHeight: "100vh", background: "#f7f9fc", fontFamily: "'Cairo', sans-serif" }}>
      <SiteHeader lang={lang} onToggleLang={() => setLang((l) => (l === "ar" ? "en" : "ar"))} />

      <div style={{ maxWidth: 1140, margin: "0 auto", padding: "0 5%" }}>
        <div style={{ textAlign: "center", padding: "48px 0 8px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "#f59e0b", fontWeight: 800, fontSize: 13, letterSpacing: ".06em", marginBottom: 8 }}>
            <span style={{ width: 28, height: 3, background: "#f59e0b", borderRadius: 2 }} />
            {isAr ? "الشعلة الرائدة" : "AL-SHOWLA AL-RAEDA"}
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 900, color: "#0a1f44", margin: "0 0 10px" }}>
            {isAr ? "الهيكل التنظيمي" : "Organizational Structure"}
          </h1>
          <p style={{ color: "#64748b", maxWidth: 640, margin: "0 auto", lineHeight: 1.9 }}>
            {isAr
              ? "فريق الإدارة في الشعلة الرائدة وبيانات التواصل المباشر مع كل إدارة."
              : "The management team of Al-Showla Al-Raeda and how to reach each department directly."}
          </p>
        </div>

        <div className="team">
          {people.map((p) => (
            <article key={p.name} className={`tm${p.head ? " tm-head" : ""}`}>
              <div className="tm-band" />
              <div className="tm-avatar">
                {p.photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.photo} alt={p.name} />
                ) : (
                  <span className="tm-ini">{initials(p.name).map((ch, i) => <b key={i}>{ch}</b>)}</span>
                )}
              </div>
              <div className="tm-body">
                <h2>{p.name}</h2>
                <div className="tm-dept">{p.dept}</div>
                <div className="tm-contacts">
                  <a href={`tel:${p.phone.tel}`} className="tm-c"><Phone size={14} /> <span dir="ltr">{p.phone.display}</span></a>
                  <a href={`mailto:${p.email}`} className="tm-c"><Mail size={14} /> <span>{p.email}</span></a>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div style={{ height: 60 }} />
      </div>

      <SiteFooter lang={lang} />

      <style>{`
        .team { display: grid; grid-template-columns: repeat(3, 1fr); gap: 26px; margin-top: 40px; }
        .tm { position: relative; background: #fff; border-radius: 20px; overflow: hidden; border: 1px solid #e6edf6; box-shadow: 0 8px 26px rgba(0,31,77,.07); text-align: center; transition: transform .25s, box-shadow .25s; }
        .tm:hover { transform: translateY(-5px); box-shadow: 0 18px 42px rgba(0,31,77,.14); }
        .tm-band { height: 92px; background: linear-gradient(120deg, #0a1f44 0%, #0051a2 70%, #1d6fd1 100%); }
        .tm-head .tm-band { background: linear-gradient(120deg, #0a1f44 0%, #0051a2 55%, #f59e0b 140%); }
        .tm-avatar { width: 116px; height: 116px; margin: -58px auto 0; border-radius: 50%; border: 5px solid #fff; box-shadow: 0 8px 22px rgba(0,31,77,.18); overflow: hidden; background: linear-gradient(145deg, #e8f1fc, #cfe1f6); display: flex; align-items: center; justify-content: center; position: relative; }
        .tm-head .tm-avatar { border-color: #f59e0b; }
        .tm-avatar img { width: 100%; height: 100%; object-fit: cover; object-position: top; }
        .tm-ini { display: flex; gap: 6px; font-size: 34px; font-weight: 900; color: #0051a2; }
        .tm-ini b { font-weight: 900; }
        .tm-body { padding: 14px 22px 22px; }
        .tm-body h2 { font-size: 18px; font-weight: 900; color: #0a1f44; margin: 6px 0 6px; }
        .tm-dept { display: inline-block; font-size: 12.5px; font-weight: 800; color: #0051a2; background: #eef5fd; padding: 4px 14px; border-radius: 999px; }
        .tm-head .tm-dept { color: #b45309; background: #fff4e0; }
        .tm-contacts { margin-top: 16px; padding-top: 14px; border-top: 1px dashed #e2e8f0; display: flex; flex-direction: column; gap: 6px; }
        .tm-c { display: flex; align-items: center; justify-content: center; gap: 8px; color: #475569; text-decoration: none; font-size: 13px; }
        .tm-c svg { color: #f59e0b; flex-shrink: 0; }
        .tm-c:hover { color: #0051a2; }
        @media (max-width: 900px) { .team { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 560px) { .team { grid-template-columns: 1fr; max-width: 380px; margin-inline: auto; } }
      `}</style>
    </div>
  );
}
