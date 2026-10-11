"use client";

import { useState, useEffect } from "react";
import { getApplicators } from "@/app/cms-actions";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";

type Applicator = { id: string; name: string; systemSpecialty: string; contactInfo: any; certifications: string[] };

export default function ApplicatorsPage() {
  const [items, setItems] = useState<Applicator[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getApplicators().then((d) => { setItems(d as Applicator[]); setLoading(false); });
  }, []);


  return (
    <>
      <SiteHeader />
      <main className="ap" dir="rtl">
        {/* ── Header banner ── */}
        <section className="ap-hero">
          <div className="ap-wrap">
            <h1>دليل المطبّقين المعتمدين</h1>
            <p>شركات التطبيق المعتمدة والأنظمة التي تتخصص فيها وبيانات التواصل معها.</p>
          </div>
        </section>

        <div className="ap-wrap ap-list">
          {loading ? (
            <div className="ap-empty">جارٍ التحميل...</div>
          ) : items.length === 0 ? (
            <div className="ap-empty">
              لم تُضف شركات تطبيق بعد. يُدار الدليل من لوحة الإدارة.
            </div>
          ) : (
            items.map((a) => {
              const c = a.contactInfo || {};
              const phones: string[] = [c.phone, c.phone2].filter(Boolean);
              return (
                <article key={a.id} className="ap-card">
                  {/* Logo + contact panel */}
                  <aside className="ap-side">
                    {c.logo && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={c.logo} alt={a.name} className="ap-logo" />
                    )}
                    <div className="ap-contact">
                      {phones.map((ph) => (
                        <a key={ph} href={`tel:${ph.replace(/\D/g, "").replace(/^0/, "+218")}`} dir="ltr">📞 {ph}</a>
                      ))}
                      {c.email && <a href={`mailto:${c.email}`}>✉️ {c.email}</a>}
                      {c.city && <span>📍 {c.city}</span>}
                    </div>
                    {(c.website || c.facebook || c.linkedin) && (
                      <div className="ap-links">
                        {c.website && <a href={c.website} target="_blank" rel="noopener noreferrer">الموقع ↗</a>}
                        {c.facebook && <a href={c.facebook} target="_blank" rel="noopener noreferrer" className="fb">Facebook</a>}
                        {c.linkedin && <a href={c.linkedin} target="_blank" rel="noopener noreferrer" className="li">LinkedIn</a>}
                      </div>
                    )}
                  </aside>

                  {/* Details */}
                  <div className="ap-body">
                    <h2>{a.name}</h2>
                    {a.systemSpecialty && <div className="ap-spec">{a.systemSpecialty}</div>}
                    {c.description && <p className="ap-desc">{c.description}</p>}

                    {c.services?.length > 0 && (
                      <div className="ap-block">
                        <h3>الخدمات</h3>
                        <div className="ap-chips">
                          {c.services.map((s: string, i: number) => <span key={i}>{s}</span>)}
                        </div>
                      </div>
                    )}

                    {c.projects?.length > 0 && (
                      <div className="ap-block">
                        <h3>من مشاريعها</h3>
                        <ul className="ap-projects">
                          {c.projects.map((p: string, i: number) => <li key={i}>{p}</li>)}
                        </ul>
                      </div>
                    )}

                    {a.certifications?.length > 0 && (
                      <div className="ap-block">
                        <h3>الاعتمادات</h3>
                        <div className="ap-chips gold">
                          {a.certifications.map((x, i) => <span key={i}>{x}</span>)}
                        </div>
                      </div>
                    )}
                  </div>
                </article>
              );
            })
          )}
        </div>
      </main>
      <SiteFooter />
      <style>{CSS}</style>
    </>
  );
}

const CSS = `
.ap { font-family: 'Cairo', sans-serif; background: var(--off, #f4f7fb); padding-bottom: 50px; }
.ap-wrap { max-width: 1140px; margin: 0 auto; padding: 0 20px; }
.ap-hero { background: linear-gradient(120deg, #001f4d, #0051a2); color: #fff; padding: 40px 0 70px; text-align: center; }
.ap-hero h1 { margin: 0 0 8px; font-size: clamp(1.6rem, 3vw, 2.2rem); font-weight: 900; }
.ap-hero p { margin: 0 auto; opacity: .85; font-size: 15px; max-width: 620px; }
.ap-list { margin-top: -40px; display: flex; flex-direction: column; gap: 22px; }
.ap-empty { background: #fff; border-radius: 16px; padding: 50px; text-align: center; color: var(--gray, #64748b); }

.ap-card { display: grid; grid-template-columns: 300px 1fr; background: #fff; border-radius: 20px; overflow: hidden; box-shadow: 0 14px 40px rgba(0,31,77,.10); border: 1px solid #e2e8f0; }
.ap-side { background: linear-gradient(180deg, #f8fafc, #eef4fb); border-inline-end: 1px solid #e2e8f0; padding: 30px 24px; display: flex; flex-direction: column; align-items: center; gap: 18px; text-align: center; }
.ap-logo { width: 100%; max-width: 220px; height: 220px; object-fit: contain; background: #fff; border-radius: 18px; padding: 18px; box-shadow: 0 8px 24px rgba(0,31,77,.08); }
.ap-contact { display: flex; flex-direction: column; gap: 6px; font-size: 14px; }
.ap-contact a, .ap-contact span { color: var(--blue-deeper, #001f4d); text-decoration: none; font-weight: 700; }
.ap-links { display: flex; gap: 8px; flex-wrap: wrap; justify-content: center; }
.ap-links a { font-size: 13px; font-weight: 800; text-decoration: none; padding: 7px 14px; border-radius: 999px; background: #0051a2; color: #fff; }
.ap-links a.fb { background: #1877f2; }
.ap-links a.li { background: #0a66c2; }

.ap-body { padding: 30px 34px; }
.ap-body h2 { margin: 0 0 6px; font-size: 1.5rem; font-weight: 900; color: var(--blue-deeper, #001f4d); }
.ap-spec { display: inline-block; font-size: 14px; font-weight: 800; color: #0051a2; background: #e8f2fc; padding: 5px 12px; border-radius: 8px; margin-bottom: 14px; }
.ap-desc { font-size: 15px; line-height: 2; color: #475569; margin: 0 0 18px; }
.ap-block { margin-top: 16px; }
.ap-block h3 { font-size: 14px; font-weight: 900; color: var(--blue-deeper, #001f4d); margin: 0 0 10px; display: flex; align-items: center; gap: 8px; }
.ap-block h3::before { content: ""; width: 22px; height: 3px; border-radius: 2px; background: var(--accent, #f59e0b); }
.ap-chips { display: flex; flex-wrap: wrap; gap: 8px; }
.ap-chips span { font-size: 13px; font-weight: 700; background: #e8f2fc; color: #0051a2; padding: 6px 12px; border-radius: 8px; }
.ap-chips.gold span { background: #fef3c7; color: #b45309; }
.ap-projects { margin: 0; padding-inline-start: 18px; columns: 2; column-gap: 28px; font-size: 14px; line-height: 2; color: #475569; }

@media (max-width: 820px) {
  .ap-card { grid-template-columns: 1fr; }
  .ap-side { border-inline-end: none; border-bottom: 1px solid #e2e8f0; }
  .ap-logo { height: 180px; }
  .ap-body { padding: 24px 20px; }
  .ap-projects { columns: 1; }
}
`;
