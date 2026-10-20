"use client";

// Organizational structure (الهيكل التنظيمي) — its own page under the "Company" menu
// (client request: move it out of the bottom of the profile onto a dedicated page).

import { useLang } from "@/lib/useLang";
import { Phone, Mail, User, Crown } from "lucide-react";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import { DEPARTMENTS, deptPeople, libyanPhone } from "@/lib/company-data";

export default function DepartmentsPage() {
  const [lang, setLang] = useLang();
  const isAr = lang === "ar";

  const head = DEPARTMENTS[0];          // Chairman of the Board
  const depts = DEPARTMENTS.slice(1);   // reporting departments

  const Card = ({ d, isHead = false }: { d: typeof DEPARTMENTS[number]; isHead?: boolean }) => {
    const ph = libyanPhone(d.phone);
    return (
      <div className={`org-card${isHead ? " org-card-head" : ""}`}>
        <div className="org-ic">{isHead ? <Crown size={18} color="#0051a2" /> : <User size={16} color="#f59e0b" />}</div>
        <h2>{isAr ? d.nameAr : d.nameEn}</h2>
        <div className="org-people">
          {deptPeople(d, isAr).map((n) => <span key={n}>{n}</span>)}
        </div>
        <a href={`tel:${ph.tel}`} className="org-contact"><Phone size={14} color="#0051a2" /> <span dir="ltr">{ph.display}</span></a>
        <a href={`mailto:${d.email}`} className="org-contact"><Mail size={14} color="#0051a2" /> {d.email}</a>
      </div>
    );
  };

  return (
    <div dir={isAr ? "rtl" : "ltr"} style={{ minHeight: "100vh", background: "#f7f9fc", fontFamily: "'Cairo', sans-serif" }}>
      <SiteHeader lang={lang} onToggleLang={() => setLang((l) => (l === "ar" ? "en" : "ar"))} />

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 5%" }}>
        {/* header band */}
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
              ? "الإدارات المسؤولة في الشعلة الرائدة وبيانات التواصل المباشر مع كل إدارة."
              : "The departments that run Al-Showla Al-Raeda and how to reach each one directly."}
          </p>
        </div>

        {/* org chart */}
        <div className="org" dir={isAr ? "rtl" : "ltr"}>
          <Card d={head} isHead />
          <div className="org-conn" />
          <div className="org-row">
            {depts.map((d) => (
              <div className="org-node" key={d.email}><Card d={d} /></div>
            ))}
          </div>
        </div>

        <div style={{ height: 56 }} />
      </div>

      <SiteFooter lang={lang} />

      <style>{`
        .org { display: flex; flex-direction: column; align-items: center; margin-top: 30px; }
        .org-card {
          background: #fff; border: 1px solid #e2e8f0; border-top: 4px solid #0051a2;
          border-radius: 16px; padding: 22px 20px; width: 240px; text-align: center;
          box-shadow: 0 6px 22px rgba(0,31,77,.06); position: relative;
        }
        .org-card-head { border-top-color: #f59e0b; width: 280px; box-shadow: 0 10px 30px rgba(245,158,11,.14); }
        .org-ic { width: 42px; height: 42px; border-radius: 12px; background: #f0f6fd; display: flex; align-items: center; justify-content: center; margin: 0 auto 10px; }
        .org-card-head .org-ic { background: #fff6e6; }
        .org-card h2 { font-size: 16px; font-weight: 900; color: #0a1f44; margin: 0 0 8px; }
        .org-card-head h2 { color: #0051a2; font-size: 18px; }
        .org-people { display: flex; flex-direction: column; gap: 3px; margin-bottom: 12px; }
        .org-people span { font-weight: 800; color: #0f1c2e; font-size: 13.5px; }
        .org-contact { display: inline-flex; align-items: center; gap: 7px; justify-content: center; color: #475569; text-decoration: none; font-size: 12.5px; margin-top: 5px; }
        .org-conn { width: 2px; height: 30px; background: #cbd5e1; }
        .org-row { display: flex; gap: 18px; flex-wrap: wrap; justify-content: center; position: relative; padding-top: 30px; }
        .org-row::before { content: ''; position: absolute; top: 0; left: 12%; right: 12%; height: 2px; background: #cbd5e1; }
        .org-node { position: relative; }
        .org-node::before { content: ''; position: absolute; top: -30px; left: 50%; transform: translateX(-50%); width: 2px; height: 30px; background: #cbd5e1; }
        @media (max-width: 760px) {
          .org-conn, .org-row::before, .org-node::before { display: none; }
          .org-row { padding-top: 0; gap: 14px; }
          .org-card, .org-card-head { width: 100%; max-width: 340px; }
        }
      `}</style>
    </div>
  );
}
