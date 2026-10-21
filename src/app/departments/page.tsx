"use client";

// Organizational structure (الهيكل التنظيمي) — its own page under the "Company" menu.
// Team-card layout requested by the client: one portrait card per person (photo, name,
// department, phone, email). People without a photo yet show their initials.

import { useState } from "react";
import { useLang } from "@/lib/useLang";
import { Phone, Mail, ChevronDown } from "lucide-react";
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
  const [open, setOpen] = useState<string | null>(null);

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
          {people.map((p) => {
            const isOpen = open === p.name;
            return (
              <article key={p.name} className={`tm${p.head ? " tm-head" : ""}${isOpen ? " open" : ""}`}>
                <button type="button" className="tm-hit" onClick={() => setOpen(isOpen ? null : p.name)} aria-expanded={isOpen}>
                  <div className="tm-photo">
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
                  </div>
                </button>
                <div className="tm-info" hidden={!isOpen}>
                  <a href={`tel:${p.phone.tel}`} className="tm-c"><Phone size={15} /> <span dir="ltr">{p.phone.display}</span></a>
                  <a href={`mailto:${p.email}`} className="tm-c"><Mail size={15} /> <span>{p.email}</span></a>
                </div>
                <button type="button" className="tm-bar" onClick={() => setOpen(isOpen ? null : p.name)}
                  aria-label={isOpen ? (isAr ? "إخفاء البيانات" : "Hide details") : (isAr ? "عرض البيانات" : "Show details")}>
                  <ChevronDown size={20} />
                </button>
              </article>
            );
          })}
        </div>

        <div style={{ height: 60 }} />
      </div>

      <SiteFooter lang={lang} />

      <style>{`
        .team { display: grid; grid-template-columns: repeat(3, 1fr); gap: 26px; margin-top: 40px; align-items: start; }
        .tm { background: #fff; border-radius: 6px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 10px 28px rgba(0,31,77,.08); transition: box-shadow .25s, transform .25s; }
        .tm:hover, .tm.open { box-shadow: 0 18px 44px rgba(0,31,77,.16); transform: translateY(-3px); }
        .tm-hit { display: block; width: 100%; padding: 0; border: 0; background: none; cursor: pointer; text-align: start; font: inherit; color: inherit; }
        .tm-photo { aspect-ratio: 1 / 1; background: linear-gradient(160deg, #e9f1fb, #c9dcf3); display: flex; align-items: center; justify-content: center; overflow: hidden; }
        .tm-photo img { width: 100%; height: 100%; object-fit: cover; object-position: top center; transition: transform .5s; }
        .tm:hover .tm-photo img { transform: scale(1.03); }
        .tm-ini { display: flex; gap: 10px; font-size: 50px; font-weight: 900; color: #0051a2; opacity: .55; }
        .tm-ini b { font-weight: 900; }
        .tm-body { padding: 18px 22px 16px; }
        .tm-body h2 { font-size: 19px; font-weight: 800; color: #0a1f44; margin: 0 0 4px; }
        .tm-dept { font-size: 14px; font-weight: 800; font-style: italic; color: #0051a2; }
        .tm-head .tm-dept { color: #b45309; }
        .tm-info { padding: 4px 22px 18px; display: flex; flex-direction: column; gap: 8px; border-top: 1px dashed #e2e8f0; padding-top: 14px; }
        .tm-info[hidden] { display: none; }
        .tm-c { display: flex; align-items: center; gap: 9px; color: #334155; text-decoration: none; font-size: 14px; }
        .tm-c svg { color: #f59e0b; flex-shrink: 0; }
        .tm-c:hover { color: #0051a2; }
        .tm-bar { display: flex; width: 100%; align-items: center; justify-content: center; height: 38px; border: 0; cursor: pointer; background: #0a3a78; color: #fff; }
        .tm-head .tm-bar { background: #b45309; }
        .tm-bar svg { transition: transform .25s; }
        .tm.open .tm-bar svg { transform: rotate(180deg); }
        @media (max-width: 900px) { .team { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 560px) { .team { grid-template-columns: 1fr; max-width: 380px; margin-inline: auto; } }
      `}</style>
    </div>
  );
}
