"use client";

// §25: shared Header/Footer so EVERY page presents the exact same chrome.
// Self-contained (scoped <style> + inline) so it never depends on page CSS.

import { useState, type ReactNode } from "react";
import { setStoredLang, LANGS, type Lang } from "@/lib/useLang";
import { useDark } from "@/lib/useDark";

// Single source of truth for the full site menu — shown identically on every page.
export const NAV: { href: string; ar: string; en: string }[] = [
  { href: "/", ar: "الرئيسية", en: "Home" },
  { href: "/products", ar: "المنتجات", en: "Products" },
  { href: "/advisor", ar: "المستشار الذكي", en: "AI Advisor" },
  { href: "/certificates", ar: "شهادات الجودة", en: "Certificates" },
  { href: "/documents", ar: "مكتبة الوثائق", en: "Documents" },
  { href: "/calculator", ar: "الحاسبة", en: "Calculator" },
  { href: "/#projects", ar: "المشاريع", en: "Projects" },
  { href: "/applicators", ar: "المطبّقون", en: "Applicators" },
  { href: "/delivery", ar: "التوصيل", en: "Delivery" },
  { href: "/training", ar: "التدريب", en: "Training" },
  { href: "/blog", ar: "المدونة", en: "Blog" },
  { href: "/midmak", ar: "ميدماك", en: "Midmak" },
  { href: "/careers", ar: "الوظائف", en: "Careers" },
  { href: "/faq", ar: "الأسئلة الشائعة", en: "FAQ" },
  { href: "/#contact", ar: "تواصل معنا", en: "Contact" },
];

const LOGO = "/site/cropped-ICON-270x270.png";

// SiteHeader / SiteFooter render the SAME chrome as the main page, by reusing the
// homepage's global nav/footer CSS classes (defined in globals.css). Placed on
// every secondary page so the whole site shares one look. Sticky (in-flow) so it
// never overlaps page content, and section links use /#anchor to jump to the home
// page's sections.
export function SiteHeader({ lang = "ar", onToggleLang, rightSlot }: { lang?: Lang; onToggleLang?: () => void; rightSlot?: ReactNode }) {
  const isAr = lang === "ar";
  const [mobOpen, setMobOpen] = useState(false);
  const [dark, setDark] = useDark();
  const L = (ar: string, en: string, tr?: string) => (lang === "ar" ? ar : lang === "tr" ? (tr ?? en) : en);
  const mobLinks: [string, string][] = [
    ["/", L("الرئيسية", "Home", "Ana Sayfa")],
    ["/#about", L("من نحن", "Who We Are", "Hakkımızda")],
    ["/#ceo", L("كلمة رئيس مجلس الإدارة", "Chairman's Message", "Başkanın Mesajı")],
    ["/departments", L("الهيكل التنظيمي", "Organizational Structure", "Organizasyon Yapısı")],
    ["/#services", L("خدماتنا", "Services", "Hizmetler")],
    ["/products", L("كتالوج المنتجات", "Products Catalog", "Ürün Kataloğu")],
    ["/certificates", L("شهادات الجودة", "Certificates", "Sertifikalar")],
    ["/documents", L("مكتبة الوثائق", "Documents", "Belgeler")],
    ["/calculator", L("حاسبة الكميات", "Calculator", "Hesaplayıcı")],
    ["/#projects", L("المشاريع", "Projects", "Projeler")],
    ["/applicators", L("المطبّقون", "Applicators", "Uygulayıcılar")],
    ["/delivery", L("مناطق التوصيل", "Delivery", "Teslimat")],
    ["/training", L("ورش التدريب", "Training", "Eğitim")],
    ["/blog", L("المدونة", "Blog", "Blog")],
    ["/midmak", L("ميدماك", "Midmak", "Midmak")],
    ["/careers", L("الوظائف", "Careers", "Kariyer")],
    ["/faq", L("الأسئلة الشائعة", "FAQ", "SSS")],
    ["/#clients", L("من نخدم", "Who We Serve", "Kime Hizmet Veriyoruz")],
    ["/#partners", L("عملاؤنا", "Our Clients", "Müşterilerimiz")],
    ["/#contact", L("اتصل بنا", "Contact", "İletişim")],
  ];
  return (
    <>
      <header
        dir={isAr ? "rtl" : "ltr"}
        style={{
          position: "sticky", top: 0, zIndex: 999, height: 70,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 clamp(14px, 3vw, 5%)", gap: 16, background: "var(--white)",
          boxShadow: "0 1px 0 var(--gray-light), 0 4px 20px rgba(0,81,162,.06)",
          fontFamily: "'Cairo', sans-serif",
        }}
      >
        <a href="/" className="nav-logo">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={LOGO} alt="Al-Showla Al-Raeda" className="nav-logo-img"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
          <div>
            <div className="nav-logo-txt">{L("الشعلة الرائدة", "AL-SHOWLA AL-RAEDA")}</div>
            <div className="nav-logo-sub">{L("مواد البناء والحلول الإنشائية", "Building Materials & Construction")}</div>
          </div>
        </a>
        <div className="nav-links">
          <a href="/">{L("الرئيسية", "Home", "Ana Sayfa")}</a>
          <div className="nav-drop">
            <a href="/#about">{L("الشركة", "Company", "Şirket")} ▾</a>
            <div className="nav-drop-menu">
              <a href="/#about">{L("من نحن", "Who We Are", "Hakkımızda")}</a>
              <a href="/#ceo">{L("كلمة رئيس مجلس الإدارة", "Chairman's Message", "Başkanın Mesajı")}</a>
              <a href="/departments">{L("الهيكل التنظيمي", "Organizational Structure", "Organizasyon Yapısı")}</a>
              <a href="/#projects">{L("المشاريع المنفذة", "Projects", "Projeler")}</a>
              <a href="/applicators">{L("المطبّقون المعتمدون", "Applicators", "Onaylı Uygulayıcılar")}</a>
              <a href="/training">{L("ورش التدريب", "Training", "Eğitim")}</a>
              <a href="/blog">{L("المدونة", "Blog", "Blog")}</a>
              <a href="/midmak">{L("ميدماك", "Midmak", "Midmak")}</a>
              <a href="/careers">{L("الوظائف", "Careers", "Kariyer")}</a>
              <a href="/#clients" className="nav-drop-sec">{L("من نخدم", "Who We Serve", "Kime Hizmet Veriyoruz")}</a>
              <a href="/#partners" className="nav-drop-sec">{L("عملاؤنا", "Our Clients", "Müşterilerimiz")}</a>
              <a href="/faq" className="nav-drop-sec">{L("الأسئلة الشائعة", "FAQ", "SSS")}</a>
            </div>
          </div>
          <a href="/#services">{L("خدماتنا", "Services", "Hizmetler")}</a>
          <div className="nav-drop">
            <a href="/products">{L("منتجاتنا", "Products", "Ürünler")} ▾</a>
            <div className="nav-drop-menu">
              <a href="/products">{L("كتالوج المنتجات", "Products Catalog", "Ürün Kataloğu")}</a>
              <a href="/certificates">{L("شهادات الجودة", "Certificates", "Kalite Sertifikaları")}</a>
              <a href="/documents">{L("مكتبة الوثائق الفنية", "Technical Documents", "Teknik Belgeler")}</a>
              <a href="/calculator">{L("حاسبة الكميات", "Calculator", "Miktar Hesaplayıcı")}</a>
              <a href="/delivery">{L("مناطق التوصيل", "Delivery Zones", "Teslimat Bölgeleri")}</a>
              <a href="/sample">{L("طلب عينة مجانية", "Request Free Sample", "Ücretsiz Numune")}</a>
              <a href="/advisor" className="nav-drop-ter">🔧 {L("المستشار الذكي", "AI Advisor", "Akıllı Danışman")}</a>
            </div>
          </div>
          <a href="/#clients" className="nav-sec">{L("من نخدم", "Who We Serve", "Kime Hizmet Veriyoruz")}</a>
          <a href="/#partners" className="nav-sec">{L("عملاؤنا", "Our Clients", "Müşterilerimiz")}</a>
          <a href="/#contact">{L("اتصل بنا", "Contact", "İletişim")}</a>
          <a href="/faq" className="nav-sec">{L("الأسئلة الشائعة", "FAQ", "SSS")}</a>
          <a href="/advisor" className="nav-ter" style={{ color: "var(--accent)", fontWeight: "bold" }}>🔧 {L("المستشار الذكي", "AI Advisor", "Akıllı Danışman")}</a>
          <a href="/contractor/login" style={{ color: "var(--blue)", fontWeight: "bold", border: "1.5px solid var(--blue)", borderRadius: 20, padding: "5px 14px" }}>🏗️ {L("بوابة المقاولين", "Contractor Portal", "Müteahhit Portalı")}</a>
          <div style={{ display: "flex", gap: 2, background: "var(--blue-light)", borderRadius: 7, padding: 2 }}>
            {LANGS.map(({ code, label }) => (
              <button key={code} onClick={() => setStoredLang(code)}
                style={{ background: lang === code ? "var(--blue)" : "transparent", color: lang === code ? "#fff" : "var(--blue)", border: "none", padding: "5px 9px", cursor: "pointer", fontWeight: 800, borderRadius: 5, fontFamily: "'Cairo', sans-serif", fontSize: 12.5, lineHeight: 1 }}>
                {label}
              </button>
            ))}
          </div>
          <button onClick={() => setDark(!dark)} title={dark ? "Light" : "Dark"} aria-label="Theme"
            style={{ background: "var(--blue-light)", border: "none", color: "var(--blue)", padding: "6px 10px", cursor: "pointer", borderRadius: 7, fontSize: 15, lineHeight: 1 }}>
            {dark ? "☀️" : "🌙"}
          </button>
          <a href="https://wa.me/218948020200" className="nav-cta" target="_blank" rel="noopener noreferrer">{L("اطلب الآن", "Order Now", "Hemen Sipariş")}</a>
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
        <a href="/advisor" onClick={() => setMobOpen(false)} style={{ color: "var(--accent)" }}>🔧 {L("المستشار الذكي", "AI Advisor", "Akıllı Danışman")}</a>
        <div className="mob-nav-divider" />
        <a href="/contractor/login" onClick={() => setMobOpen(false)} style={{ color: "#fff" }}>🏗️ {L("بوابة المقاولين", "Contractor Portal", "Müteahhit Portalı")}</a>
        <a href="https://wa.me/218948020200" target="_blank" rel="noopener noreferrer" onClick={() => setMobOpen(false)} style={{ color: "var(--accent)" }}>{L("اطلب الآن عبر واتساب", "Order via WhatsApp", "WhatsApp ile Sipariş")}</a>
        <div style={{ display: "flex", gap: 6, marginTop: 14, justifyContent: "center" }}>
          {LANGS.map(({ code, label }) => (
            <button key={code} onClick={() => { setStoredLang(code); setMobOpen(false); }}
              style={{ background: lang === code ? "var(--accent)" : "rgba(255,255,255,.15)", border: "none", color: "#fff", padding: "10px 20px", cursor: "pointer", fontWeight: 800, borderRadius: 8, fontFamily: "'Cairo', sans-serif" }}>
              {label}
            </button>
          ))}
          <button onClick={() => setDark(!dark)} aria-label="Theme"
            style={{ background: "rgba(255,255,255,.15)", border: "none", color: "#fff", padding: "10px 16px", cursor: "pointer", borderRadius: 8, fontSize: 16 }}>
            {dark ? "☀️" : "🌙"}
          </button>
        </div>
      </div>
    </>
  );
}

export function SiteFooter({ lang = "ar" }: { lang?: Lang }) {
  const isAr = lang === "ar";
  const L = (ar: string, en: string, tr?: string) => (lang === "ar" ? ar : lang === "tr" ? (tr ?? en) : en);
  return (
    <footer dir={isAr ? "rtl" : "ltr"}>
      <div className="ft-top">
        <div className="ft-brand">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={LOGO} alt="Al-Showla Al-Raeda"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
          <p>{L("شركة ليبية متخصصة في استيراد وتوزيع مواد البناء والمستلزمات الصحية عالية الجودة منذ 2005.",
            "A leading Libyan company specialized in importing and distributing high-quality building and sanitary materials since 2005.",
            "2005'ten bu yana yüksek kaliteli yapı ve sıhhi malzemelerin ithalat ve dağıtımında uzmanlaşmış öncü bir Libya şirketi.")}</p>
        </div>
        <div>
          <div className="ft-col-h">{L("روابط سريعة", "Quick Links", "Hızlı Bağlantılar")}</div>
          <ul className="ft-links">
            {[["/", L("الرئيسية", "Home", "Ana Sayfa")], ["/#about", L("من نحن", "Who We Are", "Hakkımızda")], ["/#ceo", L("كلمة الرئيس", "Chairman", "Başkan")], ["/products", L("المنتجات", "Products", "Ürünler")], ["/#contact", L("اتصل بنا", "Contact", "İletişim")]].map(([href, label]) => (
              <li key={href}><a href={href}>{label}</a></li>
            ))}
          </ul>
        </div>
        <div>
          <div className="ft-col-h">{L("خدماتنا", "Our Services", "Hizmetlerimiz")}</div>
          <ul className="ft-links">
            {[["/products", L("كتالوج المنتجات", "Catalog", "Katalog")], ["/documents", L("مكتبة الوثائق", "Documents", "Belgeler")], ["/calculator", L("حاسبة الكميات", "Calculator", "Hesaplayıcı")], ["/advisor", L("المستشار الذكي", "AI Advisor", "Akıllı Danışman")]].map(([href, label]) => (
              <li key={href}><a href={href}>{label}</a></li>
            ))}
          </ul>
        </div>
        <div>
          <div className="ft-col-h">{L("تواصل معنا", "Contact", "İletişim")}</div>
          <ul className="ft-links">
            <li><a href="tel:+218948020200" dir="ltr">+218 94 802 0200</a></li>
            <li><a href="mailto:sales@alshowla.com">sales@alshowla.com</a></li>
            <li><a href="https://wa.me/218948020200" target="_blank" rel="noopener noreferrer">WhatsApp</a></li>
            <li><a href="https://www.facebook.com/ALSHOLA1500" target="_blank" rel="noopener noreferrer">Facebook</a></li>
            <li><a href="https://www.instagram.com/alshola2024" target="_blank" rel="noopener noreferrer">Instagram</a></li>
            <li><a href="https://www.linkedin.com/company/alshowla-alraeda/" target="_blank" rel="noopener noreferrer">LinkedIn</a></li>
          </ul>
        </div>
      </div>
      <div className="ft-bot">
        <div className="ft-copy">© {new Date().getFullYear()} {L("شركة الشعلة الرائدة لاستيراد مواد البناء — جميع الحقوق محفوظة", "Al-Showla Al-Raeda for Importing Building Materials — All rights reserved", "Al-Showla Al-Raeda Yapı Malzemeleri İthalat — Tüm hakları saklıdır")}</div>
        <div className="ft-soc">
          <a href="https://wa.me/218948020200" target="_blank" rel="noopener noreferrer">WhatsApp</a>
          <a href="https://www.facebook.com/ALSHOLA1500" target="_blank" rel="noopener noreferrer">Facebook</a>
          <a href="https://www.instagram.com/alshola2024" target="_blank" rel="noopener noreferrer">Instagram</a>
          <a href="https://www.linkedin.com/company/alshowla-alraeda/" target="_blank" rel="noopener noreferrer">LinkedIn</a>
        </div>
      </div>
    </footer>
  );
}
