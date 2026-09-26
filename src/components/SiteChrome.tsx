"use client";

// §25: shared Header/Footer so EVERY page presents the exact same chrome.
// Self-contained (scoped <style> + inline) so it never depends on page CSS.

import { useState, type ReactNode } from "react";

type Lang = "ar" | "en";

// Single source of truth for the full site menu — shown identically on every page.
export const NAV: { href: string; ar: string; en: string }[] = [
  { href: "/", ar: "الرئيسية", en: "Home" },
  { href: "/products", ar: "المنتجات", en: "Products" },
  { href: "/advisor", ar: "المستشار الذكي", en: "AI Advisor" },
  { href: "/certificates", ar: "شهادات الجودة", en: "Certificates" },
  { href: "/documents", ar: "مكتبة الوثائق", en: "Documents" },
  { href: "/calculator", ar: "الحاسبة", en: "Calculator" },
  { href: "/case-studies", ar: "المشاريع", en: "Projects" },
  { href: "/applicators", ar: "المطبّقون", en: "Applicators" },
  { href: "/delivery", ar: "التوصيل", en: "Delivery" },
  { href: "/training", ar: "التدريب", en: "Training" },
  { href: "/blog", ar: "المدونة", en: "Blog" },
  { href: "/careers", ar: "الوظائف", en: "Careers" },
  { href: "/faq", ar: "الأسئلة الشائعة", en: "FAQ" },
  { href: "/#contact", ar: "تواصل معنا", en: "Contact" },
];

const NAVY = "#001f4d";
const GOLD = "#c9a227";

export function SiteHeader({ lang = "ar", onToggleLang, rightSlot }: { lang?: Lang; onToggleLang?: () => void; rightSlot?: ReactNode }) {
  const isAr = lang === "ar";
  const [open, setOpen] = useState(false);
  return (
    <>
      <style>{`
        .sh-wrap { position: sticky; top: 0; z-index: 900; background: ${NAVY}; color: #fff; font-family: 'Cairo', sans-serif; box-shadow: 0 2px 14px rgba(0,0,0,.22); }
        .sh-inner { max-width: 1300px; margin: 0 auto; padding: 0 5%; height: 64px; display: flex; align-items: center; justify-content: space-between; gap: 12px; }
        .sh-logo { color: #fff; text-decoration: none; font-weight: 900; font-size: 17px; display: flex; align-items: center; gap: 8px; white-space: nowrap; flex-shrink: 0; }
        .sh-nav { display: flex; gap: 2px; align-items: center; flex-wrap: wrap; justify-content: flex-end; }
        .sh-nav a { color: rgba(255,255,255,.88); text-decoration: none; font-size: 13px; font-weight: 700; padding: 6px 8px; border-radius: 8px; white-space: nowrap; transition: color .2s; }
        .sh-nav a:hover { color: ${GOLD}; }
        .sh-lang { background: rgba(255,255,255,.15); border: none; color: #fff; padding: 6px 14px; cursor: pointer; font-weight: 800; border-radius: 8px; margin-inline-start: 6px; font-family: 'Cairo', sans-serif; }
        .sh-burger { display: none; flex-direction: column; gap: 5px; cursor: pointer; padding: 6px; background: none; border: none; }
        .sh-burger span { width: 24px; height: 2px; background: #fff; display: block; border-radius: 2px; }
        .sh-mob { background: ${NAVY}; padding: 6px 5% 16px; border-top: 1px solid rgba(255,255,255,.1); display: flex; flex-direction: column; }
        .sh-mob a { color: #fff; text-decoration: none; font-size: 15px; font-weight: 600; padding: 12px 4px; border-bottom: 1px solid rgba(255,255,255,.06); }
        .sh-mob a:hover { color: ${GOLD}; }
        @media (max-width: 1024px) { .sh-nav { display: none; } .sh-burger { display: flex; } }
      `}</style>
      <header className="sh-wrap" dir={isAr ? "rtl" : "ltr"}>
        <div className="sh-inner">
          <a href="/" className="sh-logo">
            <span style={{ color: GOLD }}>◆</span>
            {isAr ? "الشعلة الرائدة" : "Al-Showla Al-Raeda"}
          </a>
          <div style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0 }}>
            <nav className="sh-nav">
              {NAV.map((n) => (
                <a key={n.href} href={n.href}>{isAr ? n.ar : n.en}</a>
              ))}
              {onToggleLang && (
                <button className="sh-lang" onClick={onToggleLang}>{isAr ? "EN" : "AR"}</button>
              )}
            </nav>
            {rightSlot}
            <button className="sh-burger" aria-label="menu" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
              <span /><span /><span />
            </button>
          </div>
        </div>
        {open && (
          <div className="sh-mob" dir={isAr ? "rtl" : "ltr"}>
            {NAV.map((n) => (
              <a key={n.href} href={n.href} onClick={() => setOpen(false)}>{isAr ? n.ar : n.en}</a>
            ))}
            {onToggleLang && (
              <button className="sh-lang" style={{ marginTop: 12, alignSelf: "flex-start" }}
                onClick={() => { onToggleLang(); setOpen(false); }}>
                {isAr ? "English" : "العربية"}
              </button>
            )}
          </div>
        )}
      </header>
    </>
  );
}

export function SiteFooter({ lang = "ar" }: { lang?: Lang }) {
  const isAr = lang === "ar";
  const colH: React.CSSProperties = { fontWeight: 800, fontSize: 14, marginBottom: 12, color: "#fff" };
  const link: React.CSSProperties = { color: "rgba(255,255,255,.7)", textDecoration: "none", fontSize: 13, display: "block", marginBottom: 8 };
  return (
    <footer dir={isAr ? "rtl" : "ltr"} style={{ background: NAVY, color: "#fff", fontFamily: "'Cairo', sans-serif", marginTop: 48 }}>
      <div style={{ maxWidth: 1240, margin: "0 auto", padding: "40px 5% 20px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 32 }}>
        <div>
          <div style={{ fontWeight: 900, fontSize: 18, marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ color: GOLD }}>◆</span>
            {isAr ? "الشعلة الرائدة" : "Al-Showla Al-Raeda"}
          </div>
          <p style={{ color: "rgba(255,255,255,.7)", fontSize: 13, lineHeight: 1.8, margin: 0 }}>
            {isAr
              ? "شركة ليبية رائدة متخصصة في استيراد وتوزيع مواد البناء والمستلزمات الصحية عالية الجودة منذ 2005."
              : "A leading Libyan company specialized in importing and distributing high-quality building and sanitary materials since 2005."}
          </p>
        </div>
        <div>
          <div style={colH}>{isAr ? "روابط سريعة" : "Quick Links"}</div>
          {NAV.map((n) => (
            <a key={n.href} href={n.href} style={link}>{isAr ? n.ar : n.en}</a>
          ))}
        </div>
        <div>
          <div style={colH}>{isAr ? "تواصل معنا" : "Contact"}</div>
          <a href="tel:+218948020200" style={link} dir="ltr">+218 94 802 0200</a>
          <a href="mailto:info@alshowla.com" style={link}>info@alshowla.com</a>
          <a href="https://maps.app.goo.gl/33C8%2B6CW" target="_blank" rel="noopener noreferrer" style={link}>
            {isAr ? "33C8+6CW، الطريق الدائري الثالث، بنغازي" : "33C8+6CW, Third Ring Rd, Benghazi"}
          </a>
        </div>
        <div>
          <div style={colH}>{isAr ? "تابعنا" : "Follow Us"}</div>
          <a href="https://wa.me/218948020200" target="_blank" rel="noopener noreferrer" style={link}>WhatsApp</a>
          <a href="https://www.facebook.com/ALSHOLA1500" target="_blank" rel="noopener noreferrer" style={link}>Facebook</a>
          <a href="https://www.instagram.com/alshola2024" target="_blank" rel="noopener noreferrer" style={link}>Instagram</a>
        </div>
      </div>
      <div style={{ borderTop: "1px solid rgba(255,255,255,.1)", padding: "16px 5%", textAlign: "center", fontSize: 12, color: "rgba(255,255,255,.5)" }}>
        © {new Date().getFullYear()} {isAr ? "شركة الشعلة الرائدة لاستيراد مواد البناء — جميع الحقوق محفوظة" : "Al-Showla Al-Raeda for Importing Building Materials — All rights reserved"}
      </div>
    </footer>
  );
}
