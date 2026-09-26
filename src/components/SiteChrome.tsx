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

const LOGO = "https://alshowla.com/wp-content/uploads/2025/12/cropped-ICON-270x270.png";

// SiteHeader / SiteFooter render the SAME chrome as the main page, by reusing the
// homepage's global nav/footer CSS classes (defined in globals.css). Placed on
// every secondary page so the whole site shares one look. Sticky (in-flow) so it
// never overlaps page content, and section links use /#anchor to jump to the home
// page's sections.
export function SiteHeader({ lang = "ar", onToggleLang, rightSlot }: { lang?: Lang; onToggleLang?: () => void; rightSlot?: ReactNode }) {
  const isAr = lang === "ar";
  const [mobOpen, setMobOpen] = useState(false);
  const L = (ar: string, en: string) => (isAr ? ar : en);
  const mobLinks: [string, string][] = [
    ["/", L("الرئيسية", "Home")],
    ["/#about", L("من نحن", "Who We Are")],
    ["/#ceo", L("كلمة رئيس مجلس الإدارة", "Chairman's Message")],
    ["/#services", L("خدماتنا", "Services")],
    ["/products", L("كتالوج المنتجات", "Products Catalog")],
    ["/certificates", L("شهادات الجودة", "Certificates")],
    ["/documents", L("مكتبة الوثائق", "Documents")],
    ["/calculator", L("حاسبة الكميات", "Calculator")],
    ["/case-studies", L("المشاريع", "Projects")],
    ["/applicators", L("المطبّقون", "Applicators")],
    ["/delivery", L("مناطق التوصيل", "Delivery")],
    ["/training", L("ورش التدريب", "Training")],
    ["/blog", L("المدونة", "Blog")],
    ["/careers", L("الوظائف", "Careers")],
    ["/faq", L("الأسئلة الشائعة", "FAQ")],
    ["/#clients", L("عملاؤنا", "Clients")],
    ["/#partners", L("شركاؤنا", "Partners")],
    ["/#contact", L("اتصل بنا", "Contact")],
  ];
  return (
    <>
      <header
        dir={isAr ? "rtl" : "ltr"}
        style={{
          position: "sticky", top: 0, zIndex: 999, height: 70,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 5%", gap: 16, background: "var(--white)",
          boxShadow: "0 1px 0 var(--gray-light), 0 4px 20px rgba(0,81,162,.06)",
          fontFamily: "'Cairo', sans-serif",
        }}
      >
        <a href="/" className="nav-logo">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={LOGO} alt="Al-Showla Al-Raeda" style={{ height: 38 }}
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
          <div>
            <div className="nav-logo-txt">{L("الشعلة الرائدة", "AL-SHOWLA AL-RAEDA")}</div>
            <div className="nav-logo-sub">{L("مواد البناء والحلول الإنشائية", "Building Materials & Construction")}</div>
          </div>
        </a>
        <div className="nav-links">
          <a href="/">{L("الرئيسية", "Home")}</a>
          <div className="nav-drop">
            <a href="/#about">{L("الشركة", "Company")} ▾</a>
            <div className="nav-drop-menu">
              <a href="/#about">{L("من نحن", "Who We Are")}</a>
              <a href="/#ceo">{L("كلمة رئيس مجلس الإدارة", "Chairman's Message")}</a>
              <a href="/case-studies">{L("المشاريع المنفذة", "Projects")}</a>
              <a href="/applicators">{L("المطبّقون المعتمدون", "Applicators")}</a>
              <a href="/training">{L("ورش التدريب", "Training")}</a>
              <a href="/blog">{L("المدونة", "Blog")}</a>
              <a href="/careers">{L("الوظائف", "Careers")}</a>
            </div>
          </div>
          <a href="/#services">{L("خدماتنا", "Services")}</a>
          <div className="nav-drop">
            <a href="/products">{L("منتجاتنا", "Products")} ▾</a>
            <div className="nav-drop-menu">
              <a href="/products">{L("كتالوج المنتجات", "Products Catalog")}</a>
              <a href="/certificates">{L("شهادات الجودة", "Certificates")}</a>
              <a href="/documents">{L("مكتبة الوثائق الفنية", "Technical Documents")}</a>
              <a href="/calculator">{L("حاسبة الكميات", "Calculator")}</a>
              <a href="/delivery">{L("مناطق التوصيل", "Delivery Zones")}</a>
              <a href="/sample">{L("طلب عينة مجانية", "Request Free Sample")}</a>
            </div>
          </div>
          <a href="/#clients">{L("عملاؤنا", "Clients")}</a>
          <a href="/#partners">{L("شركاؤنا", "Partners")}</a>
          <a href="/#contact">{L("اتصل بنا", "Contact")}</a>
          <a href="/faq">{L("الأسئلة الشائعة", "FAQ")}</a>
          <a href="/advisor" style={{ color: "var(--accent)", fontWeight: "bold" }}>🔧 {L("المستشار الذكي", "AI Advisor")}</a>
          <a href="/contractor/login" style={{ color: "var(--blue)", fontWeight: "bold" }}>{L("تسجيل المقاولين", "B2B Login")}</a>
          {onToggleLang && (
            <button onClick={onToggleLang} style={{ background: "var(--blue-light)", border: "none", color: "var(--blue)", padding: "6px 12px", cursor: "pointer", fontWeight: 800, borderRadius: 6, fontFamily: "'Cairo', sans-serif" }}>
              {isAr ? "EN" : "AR"}
            </button>
          )}
          <a href="https://wa.me/218948020200" className="nav-cta" target="_blank" rel="noopener noreferrer">{L("اطلب الآن", "Order Now")}</a>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {rightSlot}
          <div className={`hamburger${mobOpen ? " open" : ""}`} onClick={() => setMobOpen(!mobOpen)}>
            <span /><span /><span />
          </div>
        </div>
      </header>

      <div className={`mob-nav${mobOpen ? " open" : ""}`} dir={isAr ? "rtl" : "ltr"}>
        {mobLinks.map(([href, label]) => (
          <a key={href} href={href} onClick={() => setMobOpen(false)}>{label}</a>
        ))}
        <a href="/advisor" onClick={() => setMobOpen(false)} style={{ color: "var(--accent)" }}>🔧 {L("المستشار الذكي", "AI Advisor")}</a>
        <div className="mob-nav-divider" />
        <a href="/contractor/login" onClick={() => setMobOpen(false)} style={{ color: "#fff" }}>{L("تسجيل المقاولين (B2B)", "B2B Login")}</a>
        <a href="https://wa.me/218948020200" target="_blank" rel="noopener noreferrer" onClick={() => setMobOpen(false)} style={{ color: "var(--accent)" }}>{L("اطلب الآن عبر واتساب", "Order via WhatsApp")}</a>
        {onToggleLang && (
          <button onClick={() => { onToggleLang(); setMobOpen(false); }} style={{ marginTop: 14, background: "rgba(255,255,255,.15)", border: "none", color: "#fff", padding: "10px 22px", cursor: "pointer", fontWeight: 800, borderRadius: 8, fontFamily: "'Cairo', sans-serif" }}>
            {isAr ? "English" : "العربية"}
          </button>
        )}
      </div>
    </>
  );
}

export function SiteFooter({ lang = "ar" }: { lang?: Lang }) {
  const isAr = lang === "ar";
  const L = (ar: string, en: string) => (isAr ? ar : en);
  return (
    <footer dir={isAr ? "rtl" : "ltr"}>
      <div className="ft-top">
        <div className="ft-brand">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={LOGO} alt="Al-Showla Al-Raeda"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
          <p>{L("شركة ليبية رائدة متخصصة في استيراد وتوزيع مواد البناء والمستلزمات الصحية عالية الجودة منذ 2005.",
            "A leading Libyan company specialized in importing and distributing high-quality building and sanitary materials since 2005.")}</p>
        </div>
        <div>
          <div className="ft-col-h">{L("روابط سريعة", "Quick Links")}</div>
          <ul className="ft-links">
            {[["/", L("الرئيسية", "Home")], ["/#about", L("من نحن", "Who We Are")], ["/#ceo", L("كلمة الرئيس", "Chairman")], ["/products", L("المنتجات", "Products")], ["/#contact", L("اتصل بنا", "Contact")]].map(([href, label]) => (
              <li key={href}><a href={href}>{label}</a></li>
            ))}
          </ul>
        </div>
        <div>
          <div className="ft-col-h">{L("خدماتنا", "Our Services")}</div>
          <ul className="ft-links">
            {[["/products", L("كتالوج المنتجات", "Catalog")], ["/documents", L("مكتبة الوثائق", "Documents")], ["/calculator", L("حاسبة الكميات", "Calculator")], ["/advisor", L("المستشار الذكي", "AI Advisor")]].map(([href, label]) => (
              <li key={href}><a href={href}>{label}</a></li>
            ))}
          </ul>
        </div>
        <div>
          <div className="ft-col-h">{L("تواصل معنا", "Contact")}</div>
          <ul className="ft-links">
            <li><a href="tel:+218948020200" dir="ltr">+218 94 802 0200</a></li>
            <li><a href="mailto:info@alshowla.com">info@alshowla.com</a></li>
            <li><a href="https://wa.me/218948020200" target="_blank" rel="noopener noreferrer">WhatsApp</a></li>
            <li><a href="https://www.facebook.com/ALSHOLA1500" target="_blank" rel="noopener noreferrer">Facebook</a></li>
            <li><a href="https://www.instagram.com/alshola2024" target="_blank" rel="noopener noreferrer">Instagram</a></li>
          </ul>
        </div>
      </div>
      <div className="ft-bot">
        <div className="ft-copy">© {new Date().getFullYear()} {L("شركة الشعلة الرائدة لاستيراد مواد البناء — جميع الحقوق محفوظة", "Al-Showla Al-Raeda for Importing Building Materials — All rights reserved")}</div>
        <div className="ft-soc">
          <a href="https://wa.me/218948020200" target="_blank" rel="noopener noreferrer">WhatsApp</a>
          <a href="https://www.facebook.com/ALSHOLA1500" target="_blank" rel="noopener noreferrer">Facebook</a>
          <a href="https://www.instagram.com/alshola2024" target="_blank" rel="noopener noreferrer">Instagram</a>
        </div>
      </div>
    </footer>
  );
}
