"use client";

// §25: shared Header/Footer so secondary pages present a consistent chrome.
// Self-contained inline styles + absolute links (no dependency on page CSS).

type Lang = "ar" | "en";

const NAV: { href: string; ar: string; en: string }[] = [
  { href: "/", ar: "الرئيسية", en: "Home" },
  { href: "/products", ar: "المنتجات", en: "Products" },
  { href: "/advisor", ar: "المستشار الذكي", en: "AI Advisor" },
  { href: "/certificates", ar: "شهادات الجودة", en: "Certificates" },
  { href: "/delivery", ar: "التوصيل", en: "Delivery" },
  { href: "/faq", ar: "الأسئلة الشائعة", en: "FAQ" },
  { href: "/careers", ar: "الوظائف", en: "Careers" },
  { href: "/#contact", ar: "تواصل معنا", en: "Contact" },
];

const NAVY = "#001f4d";
const GOLD = "#c9a227";

export function SiteHeader({ lang = "ar", onToggleLang }: { lang?: Lang; onToggleLang?: () => void }) {
  const isAr = lang === "ar";
  return (
    <header dir={isAr ? "rtl" : "ltr"} style={{ background: NAVY, color: "#fff", fontFamily: "'Cairo', sans-serif" }}>
      <div style={{ maxWidth: 1240, margin: "0 auto", padding: "0 5%", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
        <a href="/" style={{ color: "#fff", textDecoration: "none", fontWeight: 900, fontSize: 17, display: "flex", alignItems: "center", gap: 8, whiteSpace: "nowrap" }}>
          <span style={{ color: GOLD }}>◆</span>
          {isAr ? "الشعلة الرائدة" : "Al-Showla Al-Raeda"}
        </a>
        <nav style={{ display: "flex", gap: 4, alignItems: "center", flexWrap: "wrap", justifyContent: "flex-end" }}>
          {NAV.map((n) => (
            <a key={n.href} href={n.href}
              style={{ color: "rgba(255,255,255,.85)", textDecoration: "none", fontSize: 13, fontWeight: 700, padding: "6px 10px", borderRadius: 8 }}>
              {isAr ? n.ar : n.en}
            </a>
          ))}
          {onToggleLang && (
            <button onClick={onToggleLang}
              style={{ background: "rgba(255,255,255,.15)", border: "none", color: "#fff", padding: "6px 14px", cursor: "pointer", fontWeight: 800, borderRadius: 8, marginInlineStart: 6 }}>
              {isAr ? "EN" : "AR"}
            </button>
          )}
        </nav>
      </div>
    </header>
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
          <a href="https://www.instagram.com/alshowlaalraeda" target="_blank" rel="noopener noreferrer" style={link}>Instagram</a>
        </div>
      </div>
      <div style={{ borderTop: "1px solid rgba(255,255,255,.1)", padding: "16px 5%", textAlign: "center", fontSize: 12, color: "rgba(255,255,255,.5)" }}>
        © {new Date().getFullYear()} {isAr ? "شركة الشعلة الرائدة لاستيراد مواد البناء — جميع الحقوق محفوظة" : "Al-Showla Al-Raeda for Importing Building Materials — All rights reserved"}
      </div>
    </footer>
  );
}
