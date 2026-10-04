"use client";

// Company profile (الملف التعريفي) — bilingual web version that opens directly
// in the browser instead of downloading a PDF. "Print / Save PDF" uses the
// browser's print dialog with the print styles below.

import { useEffect, useState } from "react";
import {
  ClipboardCheck, Handshake, Leaf, Lightbulb, Award, ShieldCheck, Wrench, Truck,
  RefreshCw, MonitorSmartphone, Building2, HardHat, Landmark, Store, Phone, Mail,
  MapPin, Clock, Printer, Quote, Target, Eye,
} from "lucide-react";
import { PROJECTS, PARTNERS } from "@/lib/company-data";

type Lang = "ar" | "en";

const LOGO = "https://alshowla.com/wp-content/uploads/2025/12/cropped-ICON-270x270.png";
const HERO_IMG = "https://alshowla.com/wp-content/uploads/2026/01/Copy-of-Our-Vision-scaled.jpg";
const WP = "https://alshowla.com/wp-content/uploads";

const BRANDS: { name: string; logo: string }[] = [
  { name: "Sika", logo: `${WP}/2026/01/Sika.jpg` },
  { name: "AGT", logo: `${WP}/2026/01/AGT.jpg` },
  { name: "DeWalt", logo: `${WP}/2026/01/DEWALT.jpg` },
  { name: "Gyproc", logo: `${WP}/2026/01/GYPROC.jpg` },
  { name: "Weber", logo: `${WP}/2026/04/weber.jpg` },
  { name: "Top Wet", logo: `${WP}/2026/04/top-wet.jpg` },
  { name: "Saint-Gobain", logo: `${WP}/2026/01/Saint-Goban.jpg` },
  { name: "Knauf", logo: `${WP}/2026/01/KNAUF.jpg` },
  { name: "Stanley", logo: `${WP}/2026/01/Stanley.jpg` },
  { name: "Black & Decker", logo: `${WP}/2026/01/B-DECKER.jpg` },
  { name: "Deli", logo: `${WP}/2026/01/DELI.jpg` },
  { name: "Reform", logo: `${WP}/2026/01/REform.jpg` },
  { name: "NCC", logo: `${WP}/2026/01/NCC.jpg` },
  { name: "الشركة الليبية للحديد والصلب", logo: "/partners/libyan-iron-steel.jpg" },
  { name: "شركة جولدن متيل", logo: "/partners/golden-metal.jpg" },
  { name: "الشركة العربية للأسمنت", logo: "/partners/arabian-cement.jpg" },
];

const T = {
  ar: {
    badge: "الملف التعريفي · COMPANY PROFILE",
    heroA: "نبني مستقبل ليبيا", heroB: "بمواد عالمية الجودة",
    heroP: "شركة ليبية رائدة متخصصة في استيراد وتوزيع مواد البناء والمستلزمات الصحية عالية الجودة منذ عام 2005 — انطلقت من مدينة طبرق، واتخذت من بنغازي مقرًا رئيسيًا لها، لتكون حلقة الوصل الاستراتيجية بين السوق الليبي وكبرى العلامات العالمية.",
    print: "طباعة / حفظ PDF",
    stats: [["2005", "سنة التأسيس — طبرق"], ["20+", "عامًا من الثقة"], ["14", "علامة تجارية"], ["100+", "مشروع منجز"]],
    aboutLbl: "من نحن", aboutH: "حلول ذكية لـ", aboutHem: "مشاريع أقوى",
    aboutP: [
      "انطلقت الشعلة الرائدة لاستيراد مواد البناء من مدينة طبرق في 25 مايو 2005، وسرعان ما أثبتت مكانتها كإحدى أبرز الشركات الليبية المتخصصة في توفير مواد البناء والمواد الصحية عالية الجودة. وعلى مدى أكثر من عشرين عامًا من العمل الجاد، بنت الشركة سمعة راسخة قائمة على المصداقية، والتنوع، والالتزام بمعايير الجودة العالمية.",
      "وفي 22 سبتمبر 2021، دخلت الشركة مرحلة جديدة من مسيرتها عبر التحول إلى مستورد ووكيل حصري لعدد من كبرى العلامات التجارية العالمية، لتصبح حلقة وصل استراتيجية بين السوق الليبي والأسواق الدولية، متخذةً من مدينة بنغازي مقرًا رئيسيًا لعملياتها.",
      "واليوم، تمثل الشعلة الرائدة شريكًا موثوقًا يقدم حلولًا مبتكرة ومتنوعة تدعم تطلعات المقاولين، والمطورين العقاريين، والجهات الحكومية، وتسهم في تشييد مشاريع حديثة ترتكز على الجودة والثقة والاستدامة.",
    ],
    journeyLbl: "مسيرتنا", journeyH: "محطات في", journeyHem: "رحلة النمو",
    journey: [
      ["2005", "الانطلاقة من طبرق", "تأسيس الشعلة الرائدة لاستيراد مواد البناء في مدينة طبرق، وبناء قاعدة عملاء تقوم على الجودة والمصداقية في توريد مواد البناء والمواد الصحية."],
      ["2005 — 2021", "ترسيخ الحضور في السوق الليبي", "توسع مطّرد في المنتجات والعملاء عبر أكثر من خمسة عشر عامًا، وبناء علاقات موثوقة مع المقاولين والتجار والجهات الحكومية."],
      ["2021", "الوكالات الحصرية والتوسع العالمي", "التحول إلى مستورد ووكيل حصري لعدد من كبرى العلامات العالمية، لتصبح الشركة حلقة وصل استراتيجية بين السوق الليبي والأسواق الدولية."],
      ["اليوم", "المقر الرئيسي في بنغازي", "إدارة العمليات من بنغازي مع منظومة متكاملة من التوريد والدعم الفني وخدمات ما بعد البيع، وحضور رقمي عبر منصة إلكترونية حديثة."],
    ],
    vmLbl: "رؤيتنا ورسالتنا", vmH: "إلى أين", vmHem: "نتجه",
    visionT: "رؤيتنا", visionP: "أن نكون شركة رائدة محليًا وإقليميًا في استيراد وتوزيع مواد البناء، ومرجعًا في الجودة والابتكار من خلال تقديم حلول متكاملة تعزز التنمية العمرانية المستدامة.",
    missionT: "مهمتنا — حلول شاملة",
    mission: ["توريد مواد عالية الجودة ومعتمدة دوليًا", "بناء شراكات استراتيجية مع كبار المصنعين", "تقديم الدعم الفني والهندسي للعملاء", "الالتزام بالاستدامة والشفافية في جميع العمليات"],
    valuesLbl: "قيمنا", valuesH: "القيم التي", valuesHem: "نلتزم بها",
    values: [["الالتزام", "الوفاء بجميع العقود والمواعيد بنزاهة."], ["الثقة", "بناء شراكات موثوقة وطويلة الأمد."], ["الجودة", "التزامنا الدائم بتقديم الأفضل دائمًا."], ["الاستدامة", "دعم المشاريع الصديقة للبيئة."], ["الابتكار", "تقديم أحدث الحلول والمنتجات للسوق."]],
    whyLbl: "لماذا الشعلة الرائدة", whyH: "قوّتنا", whyHem: "التنافسية",
    why: [
      ["وكالات حصرية معتمدة", "وكيل ومستورد حصري لعدد من كبرى العلامات العالمية، بما يضمن منتجات أصلية ومصدرًا موثوقًا."],
      ["جودة مطابقة للمعايير الدولية", "منتجات معتمدة بشهادات جودة عالمية (ISO) موثّقة ومتاحة للاطلاع."],
      ["دعم فني وتطبيقي", "استشارات فنية وتدريب وعينات ومساندة لفرق التنفيذ في الاستخدام الصحيح للمنتجات والأنظمة."],
      ["توريد وتوزيع متكامل", "منظومة إمداد موثوقة تخدم المشاريع والمقاولين والتجار على امتداد السوق الليبي."],
      ["خدمات ما بعد البيع", "متابعة مستمرة بعد التوريد ومعالجة الملاحظات لضمان علاقة مستدامة مع العميل."],
      ["منصة إلكترونية حديثة", "كتالوج رقمي، حاسبة كميات، مكتبة وثائق فنية، ومستشار فني ذكي لخدمة العملاء على مدار الساعة."],
    ],
    whyStats: [["2021", "بداية الوكالات الحصرية"], ["14", "علامة تجارية"], ["100%", "منتجات أصلية"], ["24/7", "حضور رقمي"]],
    ceoLbl: "كلمة المؤسس ورئيس مجلس الإدارة", ceoH: "رسالة", ceoHem: "القيادة",
    ceoQuote: "نواصل مسيرتنا برؤية متجددة تجمع بين إرث الجيل المؤسس وطموح الجيل الجديد.",
    ceoBody: [
      "يسرّني أن أرحّب بكم في شركة الشعلة الرائدة لاستيراد مواد البناء، وهي شركة تأسست على خبرة راسخة تمتد لأكثر من عشرين عامًا، وتواصل اليوم مسيرتها بروحٍ متجددة تجمع بين أصالة الجيل المؤسس وطموح الجيل الجديد.",
      "وانطلاقًا من هذا التوازن، نعمل على تقديم حلول متكاملة عالية الجودة، وبناء شراكات استراتيجية مستدامة تُسهم في تطوير قطاع البناء في ليبيا وفق أعلى المعايير.",
    ],
    ceoName: "المهدي العوامي", ceoRole: "رئيس مجلس الإدارة والمؤسس — الشعلة الرائدة",
    svcLbl: "ما نقدمه", svcH: "خدمات", svcHem: "متخصصة",
    services: [
      ["الاستشارات الفنية والحلول المتخصصة", "فهم احتياجات العملاء وتقديم المشورة الفنية واختيار وتوصيف المواد والأنظمة والحلول المناسبة لمختلف التطبيقات ومتطلبات قطاع البناء."],
      ["التوريد والتوزيع المتكامل", "توفير مجموعة متكاملة من مواد وأنظمة البناء والكيماويات الإنشائية وأنظمة الجبس والعدد والأدوات الصناعية، لخدمة المشاريع والمقاولين والشركات والتجار والعملاء."],
      ["الدعم الفني والتطبيقي", "تقديم الدعم الفني والتدريب والعينات والتجارب، ومساندة العملاء وفرق التنفيذ في الاستخدام والتطبيق الصحيح للمنتجات والأنظمة بالتعاون مع المصنّعين."],
      ["خدمات ما بعد البيع والدعم المستمر", "متابعة العملاء بعد التوريد والبيع، وتقديم الدعم الفني ومعالجة الملاحظات وتوفير الاحتياجات اللاحقة، لضمان تجربة متكاملة وعلاقة مستدامة مع العميل."],
    ],
    catLbl: "كتالوجنا", catH: "أقسام", catHem: "المنتجات",
    cats: ["كيماويات البناء", "الأدوات والمعدات الصناعية", "أنظمة الجبس بورد", "السيراميك والبورسلين والأحجار", "الأرضيات والتشطيبات المعمارية", "أنظمة تصريف مياه الأمطار", "الحديد والأسمنت وغيرها", "العزل الحراري"],
    projLbl: "مشاريعنا", projH: "أبرز", projHem: "المشاريع", projSupply: "توريدات عامة",
    partnersLbl: "شركاؤنا", partnersH: "", partnersHem: "شركاؤنا",
    brandsLbl: "علاماتنا التجارية", brandsH: "علاماتنا", brandsHem: "التجارية",
    sectorsLbl: "من نخدم", sectorsH: "قطاعات", sectorsHem: "نعتمد عليها",
    sectors: [["المطورون العقاريون", "مواد متميزة للمشاريع الكبرى والمعالم العمرانية."], ["شركات المقاولات الكبرى", "حلول مواد متكاملة من البداية حتى التسليم."], ["الحكومة والبنية التحتية", "دعم المشاريع على النطاق الوطني بموثوقية عالية."], ["التجار وأصحاب الأعمال", "سلسلة إمداد جملة موثوقة ومستقرة."]],
    ctaH: "لنبني", ctaHem: "معًا", ctaP: "هل أنت مستعد لبدء مشروعك؟ فريقنا جاهز لتزويدك بأفضل مواد البناء والاستشارات الفنية.",
    phoneL: "الهاتف", emailL: "البريد الإلكتروني", addrL: "المقر الرئيسي", hoursL: "ساعات العمل",
    addr: "33C8+6CW، الطريق الدائري الثالث، بنغازي، ليبيا", hours: "السبت – الخميس: 9:00 ص – 5:00 م",
  },
  en: {
    badge: "COMPANY PROFILE · الملف التعريفي",
    heroA: "Building Libya's Future", heroB: "With World-Class Materials",
    heroP: "A leading Libyan company specialized in importing and distributing high-quality building and sanitary materials since 2005 — founded in Tobruk and headquartered in Benghazi, the strategic link between the Libyan market and the world's leading brands.",
    print: "Print / Save PDF",
    stats: [["2005", "Founded — Tobruk"], ["20+", "Years of Trust"], ["14", "Brands"], ["100+", "Projects Delivered"]],
    aboutLbl: "Who We Are", aboutH: "Smart Solutions for", aboutHem: "Stronger Projects",
    aboutP: [
      "Al-Showla Al-Raeda for Importing Building Materials was founded in Tobruk on 25 May 2005, and quickly established itself as one of Libya's foremost companies specialized in providing high-quality building and sanitary materials. Over more than twenty years of dedicated work, the company has built a solid reputation founded on credibility, diversity, and commitment to international quality standards.",
      "On 22 September 2021, the company entered a new phase of its journey by becoming an exclusive importer and agent for a number of major global brands — a strategic link between the Libyan market and international markets — with Benghazi as the headquarters of its operations.",
      "Today, Al-Showla Al-Raeda is a trusted partner offering innovative, diverse solutions that support the aspirations of contractors, real-estate developers, and government entities, contributing to modern projects grounded in quality, trust, and sustainability.",
    ],
    journeyLbl: "Our Journey", journeyH: "Milestones in", journeyHem: "Our Growth",
    journey: [
      ["2005", "The Beginning in Tobruk", "Al-Showla Al-Raeda for Importing Building Materials is founded in Tobruk, building a client base grounded in quality and credibility in supplying building and sanitary materials."],
      ["2005 — 2021", "Establishing Our Presence in Libya", "Steady growth in products and clients over more than fifteen years, building trusted relationships with contractors, traders, and government entities."],
      ["2021", "Exclusive Agencies & Global Expansion", "Becoming an exclusive importer and agent for a number of major global brands — a strategic link between the Libyan market and international markets."],
      ["Today", "Headquartered in Benghazi", "Operations run from Benghazi with an integrated system of supply, technical support, and after-sales services, plus a digital presence through a modern online platform."],
    ],
    vmLbl: "Vision & Mission", vmH: "Where We", vmHem: "Are Heading",
    visionT: "Our Vision", visionP: "To be a leading company locally and regionally in the import and distribution of building materials — a benchmark for quality and innovation, delivering integrated solutions that promote sustainable urban development.",
    missionT: "Our Mission — Comprehensive Solutions",
    mission: ["Supplying internationally certified, high-quality materials", "Building strategic partnerships with leading manufacturers", "Providing technical and engineering support to clients", "Committing to sustainability and transparency in all operations"],
    valuesLbl: "Our Values", valuesH: "The Values", valuesHem: "We Stand By",
    values: [["Commitment", "Fulfilling all contracts and deadlines with integrity."], ["Trust", "Building long-term, reliable partnerships."], ["Quality", "Our constant commitment to deliver the very best."], ["Sustainability", "Supporting environmentally friendly projects."], ["Innovation", "Introducing the latest solutions to the market."]],
    whyLbl: "Why Al-Showla", whyH: "Our Competitive", whyHem: "Edge",
    why: [
      ["Certified Exclusive Agencies", "Exclusive agent and importer for a number of major global brands — guaranteeing genuine products and a reliable source."],
      ["International Quality Standards", "Products certified with international quality certificates (ISO), documented and available for review."],
      ["Technical & Application Support", "Technical consultation, training, samples, and on-site support for execution teams in the correct use of products and systems."],
      ["Integrated Supply & Distribution", "A reliable supply network serving projects, contractors, and traders across the Libyan market."],
      ["After-Sales Services", "Continuous follow-up after supply and handling of feedback to ensure a lasting client relationship."],
      ["Modern Online Platform", "Digital catalog, quantity calculator, technical document library, and a smart technical advisor available around the clock."],
    ],
    whyStats: [["2021", "Exclusive Agencies Since"], ["14", "Brands"], ["100%", "Genuine Products"], ["24/7", "Digital Presence"]],
    ceoLbl: "Founder & Chairman's Message", ceoH: "A Message from", ceoHem: "Our Leadership",
    ceoQuote: "We continue our journey with a renewed vision that brings together the legacy of the founding generation and the ambition of the new generation.",
    ceoBody: [
      "It is my pleasure to welcome you to Al-Showla Al-Raeda for Importing Building Materials — a company built on solid expertise spanning more than twenty years, which today continues its journey with a renewed spirit that combines the authenticity of the founding generation with the ambition of the new generation.",
      "Building on this balance, we work to deliver integrated, high-quality solutions and to establish sustainable strategic partnerships that contribute to developing Libya's construction sector in line with the highest standards.",
    ],
    ceoName: "Al Mahdi Al Awamy", ceoRole: "Chairman & Founder — Al-Showla Al-Raeda",
    svcLbl: "What We Offer", svcH: "Specialized", svcHem: "Services",
    services: [
      ["Technical Consultancy & Specialized Solutions", "Understanding client needs, providing technical advice, and selecting and specifying the right materials, systems, and solutions for the various applications and requirements of the construction sector."],
      ["Integrated Supply & Distribution", "An integrated range of building materials and systems, construction chemicals, gypsum systems, and industrial tools and equipment — serving projects, contractors, companies, traders, and clients."],
      ["Technical & Application Support", "Technical support, training, samples, and trials — assisting clients and execution teams in the correct use and application of products and systems in cooperation with manufacturers."],
      ["After-Sales & Continuous Support", "Following up with clients after supply and sale, providing technical support, addressing feedback, and meeting later needs to ensure an integrated experience and a lasting client relationship."],
    ],
    catLbl: "Our Catalog", catH: "Product", catHem: "Categories",
    cats: ["Construction Chemicals", "Industrial Tools & Equipment", "Gypsum Board Systems", "Ceramic, Porcelain & Stone", "Flooring & Architectural Finishes", "Rainwater Drainage Systems", "Steel, Cement & More", "Thermal Insulation"],
    projLbl: "Our Projects", projH: "Featured", projHem: "Projects", projSupply: "General Supplies",
    partnersLbl: "Our Partners", partnersH: "Our", partnersHem: "Partners",
    brandsLbl: "Our Brands", brandsH: "Our", brandsHem: "Brands",
    sectorsLbl: "Who We Serve", sectorsH: "Sectors That", sectorsHem: "Rely on Us",
    sectors: [["Real Estate Developers", "Premium materials for major projects and landmarks."], ["Major Contracting Companies", "Integrated material solutions from start to handover."], ["Government & Infrastructure", "Reliable support for national-scale projects."], ["Traders & Business Owners", "A reliable, stable wholesale supply chain."]],
    ctaH: "Let's Build", ctaHem: "Together", ctaP: "Ready to start your project? Our team is ready to provide you with the best building materials and technical consultation.",
    phoneL: "Phone", emailL: "Email", addrL: "Headquarters", hoursL: "Working Hours",
    addr: "33C8+6CW, Third Ring Road, Benghazi, Libya", hours: "Sat – Thu: 9:00 AM – 5:00 PM",
  },
};

const VALUE_ICONS = [ClipboardCheck, Handshake, Award, Leaf, Lightbulb];
const WHY_ICONS = [Award, ShieldCheck, Wrench, Truck, RefreshCw, MonitorSmartphone];
const SECTOR_ICONS = [Building2, HardHat, Landmark, Store];
const SECTOR_IMGS = [`${WP}/2026/01/c5.jpg`, `${WP}/2026/01/c2.jpg`, `${WP}/2026/01/constr.jpg`, `${WP}/2026/01/c3.jpg`];
const CAT_IMGS = ["/categories/cat-waterproof.jpg", "/categories/cat-tools.jpg", "/categories/cat-gypsum.jpg", "/services/cat-ceramic.jpg", "/categories/cat-flooring.jpg", "/categories/cat-sanitary.jpg", "/categories/cat-steel.jpg", "/categories/cat-adhesives.jpg"];
const SVC_IMGS = ["/services/cat-all.jpg", "/categories/cat-all.jpg", "/services/support-247.jpg", "/services/cat-decor.jpg"];

function SecHead({ lbl, h, em, light }: { lbl: string; h: string; em: string; light?: boolean }) {
  return (
    <div className="cp-head">
      <div className="cp-lbl">{lbl}</div>
      <h2 className="cp-h2" style={light ? { color: "#fff" } : undefined}>{h} <em>{em}</em></h2>
    </div>
  );
}

export default function CompanyProfilePage() {
  const [lang, setLang] = useState<Lang>("ar");
  const t = T[lang];
  const isAr = lang === "ar";

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("lang") === "en") setLang("en");
  }, []);

  return (
    <>
      <style>{CSS}</style>
      <main className="cp" dir={isAr ? "rtl" : "ltr"}>

        {/* ── COVER ── */}
        <section className="cp-hero" style={{ backgroundImage: `linear-gradient(120deg, rgba(0,31,77,.94), rgba(0,81,162,.82)), url(${HERO_IMG})` }}>
          <div className="cp-wrap">
            <div className="cp-hero-top">
              <div className="cp-brand">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={LOGO} alt="" />
                <div>
                  <div className="cp-brand-n">الشعلة الرائدة</div>
                  <div className="cp-brand-s">AL-SHOWLA AL-RAEDA</div>
                </div>
              </div>
              <div className="cp-actions">
                <div className="cp-lang">
                  <button className={isAr ? "on" : ""} onClick={() => setLang("ar")}>العربية</button>
                  <button className={!isAr ? "on" : ""} onClick={() => setLang("en")}>English</button>
                </div>
                <button className="cp-print" onClick={() => window.print()}><Printer size={16} /> {t.print}</button>
              </div>
            </div>
            <div className="cp-badge">{t.badge}</div>
            <h1 className="cp-h1">{t.heroA}<br /><em>{t.heroB}</em></h1>
            <p className="cp-hero-p">{t.heroP}</p>
            <div className="cp-stats">
              {t.stats.map(([n, l]) => (
                <div key={l} className="cp-stat"><div className="cp-stat-n" dir="ltr">{n}</div><div className="cp-stat-l">{l}</div></div>
              ))}
            </div>
          </div>
        </section>

        {/* ── ABOUT ── */}
        <section className="cp-sec">
          <div className="cp-wrap cp-split">
            <div>
              <SecHead lbl={t.aboutLbl} h={t.aboutH} em={t.aboutHem} />
              {t.aboutP.map((p, i) => <p key={i} className="cp-p">{p}</p>)}
            </div>
            <div className="cp-img-stack">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={HERO_IMG} alt="" className="cp-img-main" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/categories/cat-steel.jpg" alt="" className="cp-img-sub" />
            </div>
          </div>
        </section>

        {/* ── JOURNEY ── */}
        <section className="cp-sec cp-alt">
          <div className="cp-wrap">
            <SecHead lbl={t.journeyLbl} h={t.journeyH} em={t.journeyHem} />
            <div className="cp-timeline">
              {t.journey.map(([y, h, p]) => (
                <div key={y} className="cp-tl">
                  <div className="cp-tl-y" dir="ltr">{y}</div>
                  <div className="cp-tl-card"><h3>{h}</h3><p>{p}</p></div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── VISION & MISSION ── */}
        <section className="cp-sec">
          <div className="cp-wrap">
            <SecHead lbl={t.vmLbl} h={t.vmH} em={t.vmHem} />
            <div className="cp-vm">
              <div className="cp-vm-card" style={{ backgroundImage: `linear-gradient(160deg, rgba(0,53,120,.92), rgba(0,81,162,.85)), url(/categories/cat-all.jpg)` }}>
                <Eye size={30} className="cp-vm-ico" />
                <h3>{t.visionT}</h3>
                <p>{t.visionP}</p>
              </div>
              <div className="cp-vm-card" style={{ backgroundImage: `linear-gradient(160deg, rgba(0,31,77,.94), rgba(0,53,120,.88)), url(/categories/cat-adhesives.jpg)` }}>
                <Target size={30} className="cp-vm-ico" />
                <h3>{t.missionT}</h3>
                <ul>{t.mission.map((m) => <li key={m}>{m}</li>)}</ul>
              </div>
            </div>

            <div style={{ marginTop: 56 }}>
              <SecHead lbl={t.valuesLbl} h={t.valuesH} em={t.valuesHem} />
              <div className="cp-values">
                {t.values.map(([h, p], i) => {
                  const Icon = VALUE_ICONS[i];
                  return (
                    <div key={h} className="cp-value">
                      <div className="cp-ico"><Icon size={24} /></div>
                      <h3>{h}</h3><p>{p}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* ── WHY US ── */}
        <section className="cp-sec cp-alt">
          <div className="cp-wrap">
            <SecHead lbl={t.whyLbl} h={t.whyH} em={t.whyHem} />
            <div className="cp-grid3">
              {t.why.map(([h, p], i) => {
                const Icon = WHY_ICONS[i];
                return (
                  <div key={h} className="cp-card">
                    <div className="cp-ico cp-ico-blue"><Icon size={22} /></div>
                    <h3>{h}</h3><p>{p}</p>
                  </div>
                );
              })}
            </div>
            <div className="cp-stats cp-stats-light">
              {t.whyStats.map(([n, l]) => (
                <div key={l} className="cp-stat"><div className="cp-stat-n" dir="ltr">{n}</div><div className="cp-stat-l">{l}</div></div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CHAIRMAN ── */}
        <section className="cp-sec">
          <div className="cp-wrap">
            <SecHead lbl={t.ceoLbl} h={t.ceoH} em={t.ceoHem} />
            <div className="cp-ceo">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/chairman.jpg" alt={t.ceoName} className="cp-ceo-img" />
              <div className="cp-ceo-body">
                <Quote size={34} className="cp-ceo-q" />
                <blockquote>{t.ceoQuote}</blockquote>
                {t.ceoBody.map((p, i) => <p key={i} className="cp-p">{p}</p>)}
                <div className="cp-ceo-name">{t.ceoName}</div>
                <div className="cp-ceo-role">{t.ceoRole}</div>
              </div>
            </div>
          </div>
        </section>

        {/* ── SERVICES ── */}
        <section className="cp-sec cp-alt">
          <div className="cp-wrap">
            <SecHead lbl={t.svcLbl} h={t.svcH} em={t.svcHem} />
            <div className="cp-svcs">
              {t.services.map(([h, p], i) => (
                <div key={h} className="cp-svc">
                  <div className="cp-svc-img" style={{ backgroundImage: `url(${SVC_IMGS[i]})` }}>
                    <span dir="ltr">{String(i + 1).padStart(2, "0")}</span>
                  </div>
                  <div className="cp-svc-body"><h3>{h}</h3><p>{p}</p></div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── PRODUCT CATEGORIES ── */}
        <section className="cp-sec">
          <div className="cp-wrap">
            <SecHead lbl={t.catLbl} h={t.catH} em={t.catHem} />
            <div className="cp-cats">
              {t.cats.map((c, i) => (
                <div key={c} className="cp-cat" style={{ backgroundImage: `linear-gradient(to top, rgba(0,20,50,.88), rgba(0,20,50,.15)), url(${CAT_IMGS[i]})` }}>
                  <span>{c}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FEATURED PROJECTS ── */}
        <section className="cp-sec cp-alt">
          <div className="cp-wrap">
            <SecHead lbl={t.projLbl} h={t.projH} em={t.projHem} />
            <div className="cp-grid3">
              {PROJECTS.filter((p) => p.group === "major").map((p, i) => (
                <div key={i} className="cp-card">
                  <div className="cp-ico cp-ico-blue"><Building2 size={22} /></div>
                  <h3>{isAr ? p.titleAr : p.titleEn}</h3>
                  {p.parties.length > 0 && (
                    <ul className="cp-parties">{p.parties.map(([ar, en], j) => <li key={j}>{isAr ? ar : en}</li>)}</ul>
                  )}
                </div>
              ))}
            </div>
            <div className="cp-supply">
              <div className="cp-supply-h"><Truck size={18} /> {t.projSupply}</div>
              <div className="cp-supply-list">
                {PROJECTS.filter((p) => p.group === "supply").map((p, i) => (
                  <span key={i}>{isAr ? p.titleAr : p.titleEn}{p.parties[0] ? ` — ${isAr ? p.parties[0][0] : p.parties[0][1]}` : ""}</span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── PARTNERS ── */}
        <section className="cp-sec">
          <div className="cp-wrap">
            <SecHead lbl={t.partnersLbl} h={t.partnersH} em={t.partnersHem} />
            <div className="cp-partners">
              {PARTNERS.map((p, i) => (
                <div key={i} className="cp-partner">
                  {p.logo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.logo} alt={isAr ? p.nameAr : p.nameEn} loading="lazy" />
                  ) : (
                    <span>{isAr ? p.nameAr : p.nameEn}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── BRANDS ── */}
        <section className="cp-sec cp-alt">
          <div className="cp-wrap">
            <SecHead lbl={t.brandsLbl} h={t.brandsH} em={t.brandsHem} />
            <div className="cp-brands">
              {BRANDS.map((b) => (
                <div key={b.name} className="cp-logo" title={b.name}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={b.logo} alt={b.name} loading="lazy" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── SECTORS ── */}
        <section className="cp-sec">
          <div className="cp-wrap">
            <SecHead lbl={t.sectorsLbl} h={t.sectorsH} em={t.sectorsHem} />
            <div className="cp-sectors">
              {t.sectors.map(([h, p], i) => {
                const Icon = SECTOR_ICONS[i];
                return (
                  <div key={h} className="cp-sector" style={{ backgroundImage: `linear-gradient(to top, rgba(0,20,50,.92) 35%, rgba(0,20,50,.2)), url(${SECTOR_IMGS[i]})` }}>
                    <Icon size={26} className="cp-sector-ico" />
                    <h3>{h}</h3><p>{p}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── CONTACT ── */}
        <section className="cp-cta">
          <div className="cp-wrap">
            <SecHead lbl="" h={t.ctaH} em={t.ctaHem} light />
            <p className="cp-cta-p">{t.ctaP}</p>
            <div className="cp-contact">
              <div><Phone size={20} /><span>{t.phoneL}</span><a href="tel:+218948020200" dir="ltr">+218 94 802 0200</a></div>
              <div><Mail size={20} /><span>{t.emailL}</span><a href="mailto:sales@alshowla.com">sales@alshowla.com</a></div>
              <div><MapPin size={20} /><span>{t.addrL}</span><b>{t.addr}</b></div>
              <div><Clock size={20} /><span>{t.hoursL}</span><b>{t.hours}</b></div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

const CSS = `
.cp { font-family: 'Cairo', sans-serif; color: var(--text, #0f1c2e); background: #fff; }
.cp-wrap { max-width: 1140px; margin: 0 auto; padding: 0 24px; }
.cp-sec { padding: 80px 0; }
.cp-alt { background: #f4f7fb; }
.cp-head { margin-bottom: 36px; }
.cp-lbl { display: inline-flex; align-items: center; gap: 10px; color: var(--accent, #f59e0b); font-weight: 800; font-size: 14px; letter-spacing: .5px; }
.cp-lbl:not(:empty)::before { content: ""; width: 36px; height: 3px; background: var(--accent, #f59e0b); border-radius: 2px; }
.cp-h2 { font-size: clamp(1.7rem, 3.2vw, 2.5rem); font-weight: 900; margin: 8px 0 0; color: var(--blue-deeper, #001f4d); line-height: 1.3; }
.cp-h2 em { font-style: normal; color: var(--blue, #0051a2); }
.cp-p { font-size: 16px; line-height: 2; color: #475569; margin: 0 0 16px; }
.cp-ico { width: 48px; height: 48px; border-radius: 12px; display: grid; place-items: center; background: linear-gradient(135deg, #f59e0b, #d97706); color: #fff; flex-shrink: 0; }
.cp-ico-blue { background: linear-gradient(135deg, #0051a2, #003578); }

.cp-hero { background-size: cover; background-position: center; color: #fff; padding: 40px 0 70px; }
.cp-hero-top { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; margin-bottom: 70px; }
.cp-brand { display: flex; align-items: center; gap: 14px; }
.cp-brand img { width: 64px; height: 64px; background: #fff; border-radius: 16px; padding: 8px; }
.cp-brand-n { font-size: 24px; font-weight: 900; }
.cp-brand-s { font-size: 11px; letter-spacing: 4px; opacity: .75; }
.cp-actions { display: flex; gap: 10px; flex-wrap: wrap; }
.cp-lang { display: flex; background: rgba(255,255,255,.12); border-radius: 10px; padding: 4px; }
.cp-lang button { background: none; border: none; color: #fff; padding: 8px 16px; border-radius: 8px; cursor: pointer; font: 700 14px 'Cairo', sans-serif; }
.cp-lang button.on { background: #fff; color: var(--blue, #0051a2); }
.cp-print { display: inline-flex; align-items: center; gap: 8px; background: var(--accent, #f59e0b); color: #0f1c2e; border: none; padding: 10px 18px; border-radius: 10px; cursor: pointer; font: 800 14px 'Cairo', sans-serif; }
.cp-badge { display: inline-block; border: 1px solid rgba(245,158,11,.6); color: var(--accent, #f59e0b); padding: 8px 18px; border-radius: 30px; font-size: 13px; font-weight: 800; letter-spacing: 1px; }
.cp-h1 { font-size: clamp(2.2rem, 5.5vw, 4rem); font-weight: 900; line-height: 1.25; margin: 22px 0 18px; }
.cp-h1 em { font-style: normal; color: var(--accent, #f59e0b); }
.cp-hero-p { max-width: 720px; font-size: 17px; line-height: 2; opacity: .9; margin: 0; }
.cp-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-top: 44px; }
.cp-stat { background: rgba(255,255,255,.1); border: 1px solid rgba(255,255,255,.18); border-radius: 16px; padding: 22px 16px; text-align: center; backdrop-filter: blur(4px); }
.cp-stat-n { font-size: 2.1rem; font-weight: 900; color: var(--accent, #f59e0b); }
.cp-stat-l { font-size: 14px; opacity: .9; }
.cp-stats-light .cp-stat { background: #fff; border-color: #e2e8f0; }
.cp-stats-light .cp-stat-n { color: var(--blue, #0051a2); }
.cp-stats-light .cp-stat-l { color: #64748b; }
.cp-stats-light .cp-stat:first-child { background: linear-gradient(135deg, #003578, #0051a2); }
.cp-stats-light .cp-stat:first-child .cp-stat-n, .cp-stats-light .cp-stat:first-child .cp-stat-l { color: #fff; }

.cp-split { display: grid; grid-template-columns: 1.15fr 1fr; gap: 56px; align-items: center; }
.cp-img-stack { position: relative; padding-bottom: 60px; }
.cp-img-main { width: 100%; height: 420px; object-fit: cover; border-radius: 20px; box-shadow: 0 20px 50px rgba(0,31,77,.18); }
.cp-img-sub { position: absolute; bottom: 0; inset-inline-start: -30px; width: 52%; height: 190px; object-fit: cover; border-radius: 16px; border: 6px solid #fff; box-shadow: 0 14px 34px rgba(0,31,77,.2); }

.cp-timeline { display: grid; grid-template-columns: repeat(4, 1fr); gap: 18px; position: relative; }
.cp-timeline::before { content: ""; position: absolute; top: 22px; left: 4%; right: 4%; height: 3px; background: linear-gradient(90deg, #f59e0b, #0051a2); }
.cp-tl { position: relative; }
.cp-tl-y { position: relative; display: inline-block; background: var(--blue, #0051a2); color: #fff; font-weight: 900; padding: 8px 16px; border-radius: 30px; font-size: 15px; margin-bottom: 16px; box-shadow: 0 0 0 6px #f4f7fb; }
.cp-tl-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 20px; height: calc(100% - 56px); }
.cp-tl-card h3 { font-size: 17px; font-weight: 800; margin: 0 0 8px; color: var(--blue-deeper, #001f4d); }
.cp-tl-card p { font-size: 14px; line-height: 1.9; color: #64748b; margin: 0; }

.cp-vm { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.cp-vm-card { color: #fff; border-radius: 20px; padding: 36px; background-size: cover; background-position: center; min-height: 260px; }
.cp-vm-ico { color: var(--accent, #f59e0b); }
.cp-vm-card h3 { font-size: 22px; font-weight: 900; margin: 12px 0; }
.cp-vm-card p, .cp-vm-card li { font-size: 15px; line-height: 2; opacity: .92; }
.cp-vm-card ul { margin: 0; padding-inline-start: 20px; }
.cp-vm-card li::marker { color: var(--accent, #f59e0b); }
.cp-values { display: grid; grid-template-columns: repeat(5, 1fr); gap: 14px; }
.cp-value { background: #fff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 24px 18px; text-align: center; transition: transform .25s, box-shadow .25s; }
.cp-value:hover { transform: translateY(-4px); box-shadow: 0 14px 30px rgba(0,31,77,.1); }
.cp-value .cp-ico { margin: 0 auto 14px; }
.cp-value h3 { font-size: 17px; font-weight: 800; margin: 0 0 6px; color: var(--blue-deeper, #001f4d); }
.cp-value p { font-size: 13px; line-height: 1.8; color: #64748b; margin: 0; }

.cp-grid3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; }
.cp-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 26px; }
.cp-card h3 { font-size: 17px; font-weight: 800; margin: 16px 0 8px; color: var(--blue-deeper, #001f4d); }
.cp-card p { font-size: 14px; line-height: 1.9; color: #64748b; margin: 0; }

.cp-ceo { display: grid; grid-template-columns: 320px 1fr; gap: 40px; align-items: center; background: #f4f7fb; border-radius: 24px; padding: 32px; border-inline-start: 5px solid var(--accent, #f59e0b); }
.cp-ceo-img { width: 100%; height: 380px; object-fit: cover; object-position: top; border-radius: 18px; }
.cp-ceo-q { color: var(--accent, #f59e0b); }
.cp-ceo blockquote { font-size: 21px; font-weight: 800; line-height: 1.7; color: var(--blue-deeper, #001f4d); margin: 8px 0 18px; }
.cp-ceo-name { font-size: 20px; font-weight: 900; color: var(--blue, #0051a2); margin-top: 8px; }
.cp-ceo-role { font-size: 14px; color: #64748b; }

.cp-svcs { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
.cp-svc { display: flex; background: #fff; border-radius: 18px; overflow: hidden; border: 1px solid #e2e8f0; }
.cp-svc-img { width: 38%; min-height: 200px; background-size: cover; background-position: center; position: relative; flex-shrink: 0; }
.cp-svc-img span { position: absolute; top: 14px; inset-inline-start: 14px; background: var(--accent, #f59e0b); color: #0f1c2e; font-weight: 900; padding: 4px 12px; border-radius: 8px; }
.cp-svc-body { padding: 22px; }
.cp-svc-body h3 { font-size: 17px; font-weight: 800; margin: 0 0 8px; color: var(--blue-deeper, #001f4d); }
.cp-svc-body p { font-size: 14px; line-height: 1.9; color: #64748b; margin: 0; }

.cp-cats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; }
.cp-cat { height: 180px; border-radius: 16px; background-size: cover; background-position: center; display: flex; align-items: flex-end; padding: 18px; color: #fff; font-weight: 800; font-size: 16px; transition: transform .25s; }
.cp-cat:hover { transform: scale(1.02); }

.cp-brands { display: grid; grid-template-columns: repeat(6, 1fr); gap: 14px; }
.cp-logo { background: #fff; border: 1px solid #e2e8f0; border-radius: 14px; height: 110px; display: grid; place-items: center; padding: 12px; transition: box-shadow .25s; }
.cp-logo:hover { box-shadow: 0 10px 24px rgba(0,31,77,.1); }
.cp-logo img { max-width: 100%; max-height: 80px; object-fit: contain; }

.cp-parties { list-style: none; margin: 10px 0 0; padding: 0; }
.cp-parties li { font-size: 13px; color: #64748b; line-height: 1.8; padding-inline-start: 14px; position: relative; }
.cp-parties li::before { content: ""; position: absolute; inset-inline-start: 0; top: .75em; width: 6px; height: 6px; border-radius: 50%; background: var(--accent, #f59e0b); }
.cp-supply { margin-top: 18px; background: linear-gradient(135deg, #001f4d, #0051a2); color: #fff; border-radius: 16px; padding: 20px 24px; }
.cp-supply-h { display: flex; align-items: center; gap: 8px; font-weight: 800; color: var(--accent, #f59e0b); margin-bottom: 10px; }
.cp-supply-list { display: flex; flex-wrap: wrap; gap: 8px; }
.cp-supply-list span { background: rgba(255,255,255,.1); border: 1px solid rgba(255,255,255,.18); border-radius: 30px; padding: 6px 14px; font-size: 13px; }
.cp-partners { display: grid; grid-template-columns: repeat(6, 1fr); gap: 12px; }
.cp-partner { background: #fff; border: 1px solid #e2e8f0; border-radius: 14px; min-height: 96px; padding: 12px; display: flex; align-items: center; justify-content: center; text-align: center; }
.cp-partner span { font-size: 13px; font-weight: 800; color: var(--blue-deeper, #001f4d); line-height: 1.6; }
.cp-partner img { max-width: 100%; max-height: 64px; object-fit: contain; }

.cp-sectors { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
.cp-sector { min-height: 300px; border-radius: 18px; background-size: cover; background-position: center; color: #fff; padding: 22px; display: flex; flex-direction: column; justify-content: flex-end; }
.cp-sector-ico { color: var(--accent, #f59e0b); }
.cp-sector h3 { font-size: 18px; font-weight: 900; margin: 10px 0 6px; }
.cp-sector p { font-size: 14px; line-height: 1.8; opacity: .9; margin: 0; }

.cp-cta { background: linear-gradient(135deg, #001f4d, #0051a2); color: #fff; padding: 80px 0; }
.cp-cta-p { font-size: 17px; opacity: .9; max-width: 640px; line-height: 1.9; }
.cp-contact { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-top: 30px; }
.cp-contact > div { background: rgba(255,255,255,.08); border: 1px solid rgba(255,255,255,.18); border-radius: 16px; padding: 20px; display: flex; flex-direction: column; gap: 6px; }
.cp-contact svg { color: var(--accent, #f59e0b); }
.cp-contact span { font-size: 13px; color: var(--accent, #f59e0b); font-weight: 800; }
.cp-contact a, .cp-contact b { color: #fff; font-weight: 600; font-size: 15px; text-decoration: none; line-height: 1.7; }

@media (max-width: 960px) {
  .cp-split, .cp-vm, .cp-svcs, .cp-ceo { grid-template-columns: 1fr; }
  .cp-timeline, .cp-sectors, .cp-contact, .cp-cats { grid-template-columns: repeat(2, 1fr); }
  .cp-timeline::before { display: none; }
  .cp-values { grid-template-columns: repeat(3, 1fr); }
  .cp-grid3 { grid-template-columns: repeat(2, 1fr); }
  .cp-brands, .cp-partners { grid-template-columns: repeat(4, 1fr); }
  .cp-img-sub { inset-inline-start: 10px; }
  .cp-ceo-img { height: 320px; }
}
@media (max-width: 600px) {
  .cp-sec { padding: 56px 0; }
  .cp-stats, .cp-values, .cp-grid3, .cp-timeline, .cp-sectors, .cp-contact { grid-template-columns: 1fr 1fr; }
  .cp-grid3, .cp-timeline, .cp-sectors, .cp-contact { grid-template-columns: 1fr; }
  .cp-brands, .cp-partners { grid-template-columns: repeat(2, 1fr); }
  .cp-svc { flex-direction: column; }
  .cp-svc-img { width: 100%; }
  .cp-img-main { height: 280px; }
}

@media print {
  header, footer, .mob-nav, .cp-actions { display: none !important; }
  .cp * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .cp-sec, .cp-cta { padding: 36px 0; break-inside: avoid-page; }
  .cp-hero { padding: 30px 0 40px; }
  .cp-hero-top { margin-bottom: 30px; }
  .cp-card, .cp-value, .cp-svc, .cp-tl-card, .cp-sector, .cp-cat, .cp-logo, .cp-partner { break-inside: avoid; }
}
`;
