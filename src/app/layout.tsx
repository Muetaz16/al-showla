import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";
import Analytics from "@/components/Analytics";
import PWAClient from "@/components/PWAClient";
import Script from "next/script";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-cairo",
  display: "swap",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://alshowla.com";
const OG_IMAGE = "https://alshowla.com/wp-content/uploads/2026/01/Copy-of-Our-Vision-scaled.jpg";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "AL-SHOWLA AL-RAEDA | مواد البناء والحلول الإنشائية",
    template: "%s | الشعلة الرائدة",
  },
  description:
    "الشعلة الرائدة — شركة ليبية رائدة متخصصة في استيراد وتوزيع مواد البناء والمستلزمات الصحية عالية الجودة منذ عام 2005. AL-Showla Al-Raeda, a leading Libyan company specialized in building materials since 2005.",
  keywords: [
    "مواد البناء", "ليبيا", "بنغازي", "الشعلة الرائدة", "مواد إنشائية",
    "building materials", "Libya", "Benghazi", "construction",
    "سيكا", "كناف", "Sika", "Knauf", "جبس", "عزل مائي",
  ],
  robots: { index: true, follow: true },
  alternates: { canonical: "/" },
  manifest: "/manifest.json",
  icons: {
    icon: "/icon-192.png",
    apple: "/icon-192.png",
  },
  appleWebApp: { capable: true, statusBarStyle: "default", title: "الشعلة الرائدة" },
  openGraph: {
    title: "AL-SHOWLA AL-RAEDA | مواد البناء والحلول الإنشائية",
    description: "شركة ليبية رائدة في مواد البناء منذ 2005",
    siteName: "AL-SHOWLA AL-RAEDA",
    url: SITE_URL,
    locale: "ar_LY",
    type: "website",
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: "الشعلة الرائدة لاستيراد مواد البناء" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "AL-SHOWLA AL-RAEDA | مواد البناء والحلول الإنشائية",
    description: "شركة ليبية رائدة في مواد البناء منذ 2005",
    images: [OG_IMAGE],
  },
};

// Schema.org structured data (Organization) — improves rich-result eligibility
const ORG_JSONLD = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "الشعلة الرائدة لاستيراد مواد البناء",
  alternateName: "AL-SHOWLA AL-RAEDA",
  url: SITE_URL,
  logo: "https://alshowla.com/wp-content/uploads/2025/12/cropped-ICON-270x270.png",
  foundingDate: "2005-05-25",
  description:
    "شركة ليبية رائدة متخصصة في استيراد وتوزيع مواد البناء والمستلزمات الصحية عالية الجودة منذ 2005.",
  address: {
    "@type": "PostalAddress",
    addressLocality: "بنغازي",
    addressCountry: "LY",
  },
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+218-94-802-0200",
    contactType: "sales",
    email: "info@alshowla.com",
  },
  sameAs: [
    "https://www.facebook.com/ALSHOLA1500",
    "https://www.instagram.com/alshola2024",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ORG_JSONLD) }}
        />
      </head>
      <body className={cairo.variable} style={{ fontFamily: "var(--font-cairo), 'Cairo', sans-serif" }}>
        <Script id="sw-registration" strategy="afterInteractive">
          {`
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js').then(
                  function(registration) { console.log('SW registered:', registration.scope); },
                  function(err) { console.log('SW registration failed:', err); }
                );
              });
            }
          `}
        </Script>
        <Analytics />
        <PWAClient />
        {children}
      </body>
    </html>
  );
}
