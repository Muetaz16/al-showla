"use client";

// Department contacts (client request: its own page under the "Company" menu).

import { useState } from "react";
import { Phone, Mail, User } from "lucide-react";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import { DEPARTMENTS, deptPeople, libyanPhone } from "@/lib/company-data";

type Lang = "ar" | "en";

export default function DepartmentsPage() {
  const [lang, setLang] = useState<Lang>("ar");
  const isAr = lang === "ar";

  return (
    <div dir={isAr ? "rtl" : "ltr"} style={{ minHeight: "100vh", background: "#f7f9fc", fontFamily: "'Cairo', sans-serif" }}>
      <SiteHeader lang={lang} onToggleLang={() => setLang((l) => (l === "ar" ? "en" : "ar"))} />
      <div style={{ maxWidth: 1000, margin: "40px auto", padding: "0 5%" }}>
        <h1 style={{ fontSize: 30, fontWeight: 900, color: "#0f1c2e", marginBottom: 8 }}>
          {isAr ? "إدارات الشركة والتواصل" : "Departments & Contacts"}
        </h1>
        <p style={{ color: "#64748b", marginBottom: 32 }}>
          {isAr ? "تواصل مباشرة مع الإدارة المختصة في الشعلة الرائدة." : "Reach the right department at Al-Showla Al-Raeda directly."}
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 18 }}>
          {DEPARTMENTS.map((d) => {
            const ph = libyanPhone(d.phone);
            return (
              <div key={d.email} style={{ background: "#fff", borderRadius: 16, padding: 24, border: "1px solid #e2e8f0", boxShadow: "0 4px 20px rgba(0,31,77,.05)", borderTop: "4px solid #0051a2" }}>
                <h2 style={{ fontSize: 18, fontWeight: 900, color: "#0051a2", margin: "0 0 12px" }}>{isAr ? d.nameAr : d.nameEn}</h2>
                <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 14 }}>
                  {deptPeople(d, isAr).map((n) => (
                    <div key={n} style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 800, color: "#0f1c2e" }}>
                      <User size={16} color="#f59e0b" /> {n}
                    </div>
                  ))}
                </div>
                <a href={`tel:${ph.tel}`} style={{ display: "flex", alignItems: "center", gap: 8, color: "#334155", textDecoration: "none", marginBottom: 6 }}>
                  <Phone size={16} color="#0051a2" /> <span dir="ltr">{ph.display}</span>
                </a>
                <a href={`mailto:${d.email}`} style={{ display: "flex", alignItems: "center", gap: 8, color: "#334155", textDecoration: "none" }}>
                  <Mail size={16} color="#0051a2" /> {d.email}
                </a>
              </div>
            );
          })}
        </div>
      </div>
      <SiteFooter lang={lang} />
    </div>
  );
}
