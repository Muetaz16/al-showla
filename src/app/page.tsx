"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { submitContactMessage } from "@/app/cms-actions";
import { getBanners } from "@/app/cms-actions";

/* ─────────────────────────────────────────────
   TRANSLATIONS
───────────────────────────────────────────── */
const T = {
  en: {
    // Nav
    home: "Home", company: "Company ▾", whoWeAre: "Who We Are",
    ceoMsg: "Founder & Chairman's Message", services: "Services", products: "Products",
    clients: "Clients", partners: "Partners", contact: "Contact",
    orderNow: "Order Now",
    // Hero
    heroTag: "Est. 2005 · Tobruk, Libya · International Quality",
    heroH1a: "Building Libya's Future with",
    heroH1b: "World-Class Materials",
    heroP: "Al-Showla Al-Raeda — a leading Libyan company specialized in the import and distribution of premium building materials and construction solutions since 2005, trusted by contractors, developers, and government institutions across Libya.",
    discoverStory: "Discover Our Story", getQuote: "Get a Quote", scroll: "Scroll",
    yearsExp: "Years Experience", projectsDel: "Projects Delivered",
    satisfiedClients: "Satisfied Clients", globalBrands: "Global Brands",
    // About
    whoWeAreLbl: "Who We Are",
    aboutH2a: "Smart Solutions for", aboutH2b: "Stronger Projects",
    aboutP1: "Since its launch on 25 May 2005, Al-Showla Al-Raeda for Importing Building Materials has established itself as one of Libya's foremost companies specialized in providing high-quality building and sanitary materials. Over years of dedicated work, the company has built a reputation founded on credibility, diversity, and commitment to international quality standards.",
    aboutP2: "On 22 September 2021, the company entered a new phase of its journey by becoming an exclusive importer and agent for a number of major global brands, becoming a strategic link between the Libyan market and international markets.",
    aboutP3: "Today, Al-Showla Al-Raeda represents more than just a distributor; it is a trusted partner offering innovative, diverse solutions that support the aspirations of contractors, real-estate developers, and government entities, and contribute to building modern projects grounded in quality, trust, and sustainability.",
    downloadProfile: "Download Profile", contactUs: "Contact Us",
    yearsOfTrust: "Years of Trust",
    // Vision/Mission
    ourVision: "Our Vision", visionH: "Leading Locally,", visionHem: "Shining Regionally",
    visionP: "To be a leading company locally and regionally in the import and distribution of building materials — a benchmark for quality and innovation that promotes sustainable urban development.",
    ourMission: "Our Mission", missionH: "Comprehensive", missionHb: "Solutions",
    missionLi1: "Supplying internationally certified, high-quality materials",
    missionLi2: "Building strategic partnerships with leading manufacturers",
    missionLi3: "Providing technical and engineering support to clients",
    missionLi4: "Committing to sustainability and transparency",
    // Values
    val1t: "Commitment", val1b: "Fulfilling all contracts and deadlines with integrity.",
    val2t: "Trust", val2b: "Building long-term, reliable partnerships.",
    val3t: "Quality", val3b: "Our constant commitment to deliver the very best.",
    val4t: "Sustainability", val4b: "Supporting environmentally friendly projects.",
    val5t: "Innovation", val5b: "Introducing the latest solutions to the market.",
    // CEO
    ceoLbl: "Founder & Chairman's Message", ceoName: "Al Mahdi Al Awamy",
    ceoRole: "Chairman & Founder — Alshowla Alraeda",
    ceoQuote: "\"We continue our journey with a renewed vision that brings together the legacy of the founding generation and the ambition of the new generation.\"",
    ceoBody1: "It is my pleasure to welcome you to the website of Al-Showla Al-Raeda for Importing Building Materials — a company built on solid expertise spanning more than twenty years, which today continues its journey with a renewed spirit that combines the authenticity of the founding generation with the ambition of the new generation.",
    ceoBody2: "Building on this balance, we work to deliver integrated, high-quality solutions and to establish sustainable strategic partnerships that contribute to developing Libya's construction sector in line with the highest standards.",
    kpi1n: "2005", kpi1l: "Founded", kpi2n: "2021", kpi2l: "Global Expansion",
    kpi3n: "14", kpi3l: "Global Brands", kpi4n: "20+", kpi4l: "Years Leading",
    // Services
    servicesLbl: "What We Offer", servicesH2a: "Specialized", servicesH2b: "Services",
    svc1t: "Technical Consultancy & Specialized Solutions", svc1b: "Understanding client needs, providing technical advice, and selecting and specifying the right materials, systems, and solutions for the various applications and requirements of the construction sector.",
    svc2t: "Integrated Supply & Distribution", svc2b: "An integrated range of building materials and systems, construction chemicals, gypsum systems, and industrial tools and equipment — serving projects, contractors, companies, traders, and clients.",
    svc3t: "Technical & Application Support", svc3b: "Technical support, training, samples, and trials — assisting clients and execution teams in the correct use and application of products and systems in cooperation with manufacturers.",
    svc4t: "After-Sales & Continuous Support", svc4b: "Following up with clients after supply and sale, providing technical support, addressing feedback, and meeting later needs to ensure an integrated experience and a sustainable client relationship.",
    // Products
    productsLbl: "Our Catalog", productsH2a: "Quality", productsH2b: "Materials",
    viewAll: "View All →",
    prod1: "Building & Construction Solutions", prod2: "Industrial Tools & Equipment",
    prod3: "Gypsum Board Systems", prod4: "Ceramic Tiles",
    prod5: "Interior & Exterior Decor", prod6: "Roofing Systems",
    prod7: "Cement & Steel", prod8: "Thermal Insulation", prodAll: "All Products",
    brandsLbl: "Global Partnerships",
    // Clients
    clientsLbl: "Who We Serve", clientsH2a: "Trusted by", clientsH2b: "Libya's Builders",
    cl1: "Real Estate Developers", cl1s: "Premium materials for landmark projects",
    cl2: "Traders & Business Owners", cl2s: "Reliable wholesale supply chain",
    cl3: "Government & Infrastructure", cl3s: "National-scale project support",
    cl4: "Major Contracting Companies", cl4s: "End-to-end material solutions",
    cl5: "Individuals & Private Projects", cl5s: "Quality materials for every home",
    // Partners
    partnersLbl: "Our Brands", partnersH2a: "Our", partnersH2b: "Brands",
    // Contact
    contactLbl: "Get In Touch", contactH: "Let's Build", contactHem: "Together",
    contactP: "Ready to start your project? Our team is ready to provide you with the best building materials and technical consultation.",
    phoneLbl: "Phone", emailLbl: "Email", addressLbl: "Address", hoursLbl: "Working Hours",
    phoneVal: "+218 94 802 0200", emailVal: "info@alshowla.com",
    addressVal: "33C8+6CW, Third Ring Rd, Benghazi",
    hoursVal: "Sat – Thu: 9:00 AM – 5:00 PM",
    openMap: "Open in Google Maps",
    formContactOne: "Please provide a phone number or an email so we can reach you.",
    privacyNote: "By submitting this form you agree that your data will be used only to respond to your inquiry.",
    formName: "Full Name", formEmail: "Email Address", formPhone: "Phone Number",
    formSubject: "Subject", formMsg: "Your Message", formSend: "Send Message",
    formSuccess: "✓ Message sent successfully! We'll contact you shortly.",
    // Footer
    footerDesc: "A leading Libyan company specialized in the import and distribution of high-quality building and sanitary materials since 2005.",
    quickLinks: "Quick Links", ourServices: "Our Services", followUs: "Follow Us",
    copyright: "© 2025 AL-SHOWLA AL-RAEDA. All Rights Reserved.",
    orderWhatsapp: "Order on WhatsApp",
  },
  ar: {
    home: "الرئيسية", company: "الشركة ▾", whoWeAre: "من نحن",
    ceoMsg: " كلمة المؤسس ورئيس مجلس الإدارة ", services: "خدماتنا", products: "منتجاتنا",
    clients: "عملاؤنا", partners: "شركاؤنا", contact: "اتصل بنا",
    orderNow: "اطلب الآن",
    heroTag: "تأسست 2005 · طبرق، ليبيا · جودة عالمية",
    heroH1a: "نبني مستقبل ليبيا",
    heroH1b: "بمواد عالمية الجودة",
    heroP: "الشعلة الرائدة — شركة ليبية رائدة متخصصة في استيراد وتوزيع مواد البناء والمستلزمات الصحية عالية الجودة منذ عام 2005، موثوقة لدى المقاولين والمطورين والمؤسسات الحكومية في ليبيا.",
    discoverStory: "اكتشف قصتنا", getQuote: "احصل على عرض سعر", scroll: "انزل",
    yearsExp: "سنة خبرة", projectsDel: "مشروع منجز",
    satisfiedClients: "عميل راضٍ", globalBrands: "علامة عالمية",
    whoWeAreLbl: "من نحن",
    aboutH2a: "حلول ذكية لـ", aboutH2b: "مشاريع أقوى",
    aboutP1: "منذ انطلاقتها في 25 مايو 2005، أثبتت  الشعلة الرائدة لاستيراد مواد البناء مكانتها كإحدى أبرز الشركات الليبية المتخصصة في توفير مواد البناء والمواد الصحية عالية الجودة. وعلى مدى سنوات من العمل الجاد، نجحت الشركة في بناء سمعة قائمة على المصداقية، والتنوع، والالتزام بمعايير الجودة العالمية.",
    aboutP2: "وفي 22 سبتمبر 2021، دخلت الشركة مرحلة جديدة من مسيرتها عبر التحول إلى مستورد ووكيل حصري لعدد من كبرى العلامات التجارية العالمية، لتصبح حلقة وصل استراتيجية بين السوق الليبي والأسواق الدولية.",
    aboutP3: "واليوم، تمثل الشعلة الرائدة  شريك موثوق يقدم حلولاً مبتكرة ومتنوعة تدعم تطلعات المقاولين، والمطورين العقاريين، والجهات الحكومية، وتسهم في تشييد مشاريع حديثة ترتكز على الجودة والثقة والاستدامة.",
    downloadProfile: "تحميل الملف التعريفي", contactUs: "اتصل بنا",
    yearsOfTrust: "عاماً من الثقة",
    ourVision: "رؤيتنا", visionH: "رائدون محلياً،", visionHem: "متألقون إقليمياً",
    visionP: "أن نكون شركة رائدة محلياً وإقليمياً في استيراد وتوزيع مواد البناء، ومرجعاً في الجودة والابتكار من خلال تقديم حلول متكاملة تعزز التنمية العمرانية المستدامة.",
    ourMission: "مهمتنا", missionH: "حلول", missionHb: "شاملة",
    missionLi1: "توريد مواد عالية الجودة ومعتمدة دولياً",
    missionLi2: "بناء شراكات استراتيجية مع كبار المصنعين",
    missionLi3: "تقديم الدعم الفني والهندسي للعملاء",
    missionLi4: "الالتزام بالاستدامة والشفافية في جميع العمليات",
    val1t: "الالتزام", val1b: "الوفاء بجميع العقود والمواعيد بنزاهة.",
    val2t: "الثقة", val2b: "بناء شراكات موثوقة وطويلة الأمد.",
    val3t: "الجودة", val3b: "التزامنا الدائم بتقديم الأفضل دائماً.",
    val4t: "الاستدامة", val4b: "دعم المشاريع الصديقة للبيئة.",
    val5t: "الابتكار", val5b: "تقديم أحدث الحلول والمنتجات للسوق.",
    ceoLbl: " كلمة المؤسس ورئيس مجلس الإدارة ", ceoName: "المهدي العوامي",
    ceoRole: "رئيس مجلس الإدارة والمؤسس — الشعلة الرائدة",
    ceoQuote: "\"نواصل مسيرتنا برؤية متجددة تجمع بين إرث الجيل المؤسس وطموح الجيل الجديد.\"",
    ceoBody1: "يسرّني أن أرحّب بكم في الموقع الإلكتروني لشركة الشعلة الرائدة لاستيراد مواد البناء، وهي شركة تأسست على خبرة راسخة تمتد لأكثر من عشرين عامًا، وتواصل اليوم مسيرتها بروحٍ متجددة تجمع بين أصالة الجيل المؤسس وطموح الجيل الجديد.",
    ceoBody2: "وانطلاقًا من هذا التوازن، نعمل على تقديم حلول متكاملة عالية الجودة، وبناء شراكات استراتيجية مستدامة تُسهم في تطوير قطاع البناء في ليبيا وفق أعلى المعايير.",
    kpi1n: "2005", kpi1l: "سنة التأسيس", kpi2n: "2021", kpi2l: "التوسع العالمي",
    kpi3n: "14", kpi3l: "علامة عالمية", kpi4n: "20+", kpi4l: "سنة ريادة",
    servicesLbl: "ما نقدمه", servicesH2a: "خدمات", servicesH2b: "متخصصة",
    svc1t: "الاستشارات الفنية والحلول المتخصصة", svc1b: "فهم احتياجات العملاء وتقديم المشورة الفنية واختيار وتوصيف المواد والأنظمة والحلول المناسبة لمختلف التطبيقات ومتطلبات قطاع البناء.",
    svc2t: "التوريد والتوزيع المتكامل", svc2b: "توفير مجموعة متكاملة من مواد وأنظمة البناء والكيماويات الإنشائية وأنظمة الجبس والعدد والأدوات الصناعية، لخدمة المشاريع والمقاولين والشركات والتجار والعملاء.",
    svc3t: "الدعم الفني والتطبيقي", svc3b: "تقديم الدعم الفني والتدريب والعينات والتجارب، ومساندة العملاء وفرق التنفيذ في الاستخدام والتطبيق الصحيح للمنتجات والأنظمة بالتعاون مع المصنّعين.",
    svc4t: "خدمات ما بعد البيع والدعم المستمر", svc4b: "متابعة العملاء بعد التوريد والبيع، وتقديم الدعم الفني ومعالجة الملاحظات وتوفير الاحتياجات اللاحقة، لضمان تجربة متكاملة وعلاقة مستدامة مع العميل.",
    productsLbl: "كتالوجنا", productsH2a: "مواد", productsH2b: "عالية الجودة",
    viewAll: "← عرض الكل",
    prod1: "أنظمة حلول البناء والانشاء", prod2: "الأدوات والمعدات الصناعية",
    prod3: "أنظمة الجبس بورد", prod4: "بلاط السيراميك",
    prod5: "الديكور الداخلي والخارجي", prod6: "أنظمة التعرفية",
    prod7: "الأسمنت والحديد", prod8: "عزل حراري", prodAll: "جميع المنتجات",
    brandsLbl: "شراكات عالمية",
    clientsLbl: "من نخدم", clientsH2a: "موثوق به من قِبل", clientsH2b: "مقاولي ليبيا",
    cl1: "المطورون العقاريون", cl1s: "مواد متميزة للمشاريع الكبرى",
    cl2: "التجار وأصحاب الأعمال", cl2s: "سلسلة إمداد جملة موثوقة",
    cl3: "الحكومة والبنية التحتية", cl3s: "دعم المشاريع على النطاق الوطني",
    cl4: "شركات المقاولات الكبرى", cl4s: "حلول مواد متكاملة من البداية للنهاية",
    cl5: "الأفراد والمشاريع الخاصة", cl5s: "مواد جودة لكل منزل",
    partnersLbl: "علاماتنا التجارية", partnersH2a: "علاماتنا", partnersH2b: "التجارية",
    contactLbl: "تواصل معنا", contactH: "لنبني", contactHem: "معاً",
    contactP: "هل أنت مستعد لبدء مشروعك؟ فريقنا جاهز لتزويدك بأفضل مواد البناء والاستشارات الفنية.",
    phoneLbl: "الهاتف", emailLbl: "البريد الإلكتروني", addressLbl: "العنوان", hoursLbl: "ساعات العمل",
    phoneVal: "+218 94 802 0200", emailVal: "info@alshowla.com",
    addressVal: "33C8+6CW، الطريق الدائري الثالث، بنغازي",
    hoursVal: "السبت - الخميس: 9:00 ص - 5:00 م",
    openMap: "فتح في خرائط جوجل",
    formContactOne: "يرجى إدخال رقم هاتف أو بريد إلكتروني حتى نتمكن من التواصل معك.",
    privacyNote: "بإرسالك هذا النموذج فإنك توافق على استخدام بياناتك للرد على استفسارك فقط.",
    formName: "الاسم الكامل", formEmail: "البريد الإلكتروني", formPhone: "رقم الهاتف",
    formSubject: "الموضوع", formMsg: "رسالتك", formSend: "إرسال الرسالة",
    formSuccess: "✓ تم إرسال رسالتك بنجاح! سنتواصل معك قريباً.",
    footerDesc: "شركة ليبية رائدة متخصصة في استيراد وتوزيع مواد البناء والمستلزمات الصحية عالية الجودة منذ 2005.",
    quickLinks: "روابط سريعة", ourServices: "خدماتنا", followUs: "تابعنا",
    copyright: "© 2025 الشعلة الرائدة. جميع الحقوق محفوظة.",
    orderWhatsapp: "اطلب عبر واتساب",
  },
};
type Lang = "en" | "ar";

/* ─────────────────────────────────────────────
   MAIN PAGE COMPONENT
───────────────────────────────────────────── */
export default function Home() {
  const [lang, setLang] = useState<Lang>("ar");
  const [dark, setDark] = useState(false);
  const [navSolid, setNavSolid] = useState(true);
  const [mobOpen, setMobOpen] = useState(false);
  const [formSent, setFormSent] = useState(false);
  const [formError, setFormError] = useState("");
  const [heroBanner, setHeroBanner] = useState<string | null>(null);
  const [countersRan, setCountersRan] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<any>(null);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  const t = T[lang];
  const dir = lang === "ar" ? "rtl" : "ltr";

  /* ── Scroll ── */
  // Navbar is now permanently solid based on user request

  /* ── Intersection Observer for animations ── */
  useEffect(() => {
    // Signal that JS is managing reveals; this disables the CSS fail-safe so
    // content isn't left blank if this effect never runs (see globals.css).
    document.documentElement.classList.add("reveal-js");
    const els = Array.from(document.querySelectorAll<HTMLElement>(".ao,.al,.ar"));
    if (!els.length) return;
    const revealAll = () => els.forEach((el) => el.classList.add("av"));
    // No IntersectionObserver support → just show everything.
    if (typeof IntersectionObserver === "undefined") { revealAll(); return; }
    try {
      const obs = new IntersectionObserver((entries) => {
        entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("av"); } });
      }, { threshold: 0.12 });
      els.forEach((el) => obs.observe(el));
      // Safety net: reveal anything still hidden after 3s so content is never stuck.
      const timer = setTimeout(revealAll, 3000);
      return () => { obs.disconnect(); clearTimeout(timer); };
    } catch {
      revealAll();
    }
  }, [lang]);

  /* ── Counter animation ── */
  const countUp = useCallback(() => {
    if (countersRan) return;
    setCountersRan(true);
    document.querySelectorAll<HTMLElement>(".hstat-n[data-t]").forEach((el) => {
      const target = parseInt(el.dataset.t || "0", 10);
      let cur = 0;
      const step = Math.ceil(target / 60);
      const id = setInterval(() => {
        cur = Math.min(cur + step, target);
        el.textContent = cur + (el.dataset.suffix || "+");
        if (cur >= target) clearInterval(id);
      }, 25);
    });
  }, [countersRan]);

  useEffect(() => {
    const hero = document.querySelector("#home");
    if (!hero) return;
    const obs = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) countUp();
    }, { threshold: 0.3 });
    obs.observe(hero);
    return () => obs.disconnect();
  }, [countUp]);

  /* ── Dark mode ── */
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  /* ── Language / dir ── */
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
  }, [lang, dir]);

  useEffect(() => {
    getBanners().then((b) => { if (b[0]?.imageUrl) setHeroBanner(b[0].imageUrl); }).catch(() => { });
  }, []);

  /* ── Form handler ── */
  const handleForm = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError("");
    const formEl = e.currentTarget;
    const fd = new FormData(formEl);
    // Anti-spam honeypot: real users never see/fill this field
    if (String(fd.get("company_website") || "").trim()) {
      setFormSent(true);
      setTimeout(() => setFormSent(false), 5000);
      formEl.reset();
      return;
    }
    const email = String(fd.get("email") || "").trim();
    const phone = String(fd.get("phone") || "").trim();
    if (!email && !phone) {
      setFormError(t.formContactOne);
      return;
    }
    const ok = await submitContactMessage({
      name: fd.get("name"),
      email,
      phone,
      subject: fd.get("subject"),
      message: fd.get("message"),
    });
    if (ok) {
      setFormSent(true);
      setTimeout(() => setFormSent(false), 5000);
      formEl.reset();
    } else {
      setFormError(lang === "ar" ? "تعذر الإرسال، حاول مجدداً" : "Failed to send, try again");
    }
  };

  const LOGO = "https://alshowla.com/wp-content/uploads/2025/12/cropped-ICON-270x270.png";
  const HERO_IMG = "https://alshowla.com/wp-content/uploads/2026/01/Copy-of-Our-Vision-scaled.jpg";
  const VISION_IMG = "https://alshowla.com/wp-content/uploads/2026/01/Copy-of-Our-Vision-scaled.jpg";
  const MISSION_IMG = "https://alshowla.com/wp-content/uploads/2026/01/Copy-of-Our-Mision-scaled-e1768074828455.jpg";

  const products = [
    { bg: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600", tag: "Category 01", t: t.prod1, categoryId: "waterproof" },
    { bg: "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=600", tag: "Category 02", t: t.prod2, categoryId: "tools" },
    { bg: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600", tag: "Category 03", t: t.prod3, categoryId: "gypsum" },
    { bg: "/services/cat-ceramic.jpg", tag: "Category 04", t: t.prod4, categoryId: "sanitary" },
    { bg: "/services/cat-decor.jpg", tag: "Category 05", t: t.prod5, categoryId: "flooring" },
    { bg: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600", tag: "Category 06", t: t.prod6, categoryId: "adhesives" },
    { bg: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600", tag: "Category 07", t: t.prod7, categoryId: "steel" },
    { bg: "/services/cat-all.jpg", tag: lang === "ar" ? "تصفّح" : "Browse", t: t.prodAll, categoryId: "" },
  ];

  const BRAND_DATA = [
    {
      name: "Sika",
      url: "https://alshowla.com/wp-content/uploads/2026/01/Sika.jpg",
      country: lang === "ar" ? "🇨🇭 سويسرا" : "🇨🇭 Switzerland",
      founded: "1910",
      website: "https://www.sika.com",
      category: lang === "ar" ? "مواد بناء كيميائية" : "Chemical Construction Products",
      descAr: "سيكا شركة سويسرية رائدة عالمياً في مجال مواد البناء الكيميائية، متخصصة في أنظمة العزل المائي، المواد اللاصقة، مواد الحقن، وإضافات الخرسانة. تأسست عام 1910 وتعمل في أكثر من 100 دولة حول العالم. تُصنَّف من بين أكبر 500 شركة في العالم وحاصلة على شهادات ISO 9001 وISO 14001.",
      descEn: "Sika is a Swiss multinational company specializing in chemical construction products including waterproofing, adhesives, sealants, and concrete additives. Founded in 1910, it operates in 100+ countries and ranks among the world's 500 largest companies.",
      products: lang === "ar" ? ["أنظمة العزل المائي", "مواد لاصقة وحشوات", "مواد الحقن", "طلاءات وأرضيات", "إضافات الخرسانة"] : ["Waterproofing systems", "Adhesives & sealants", "Injection materials", "Coatings & flooring", "Concrete admixtures"],
      certifications: ["ISO 9001", "ISO 14001", "CE Mark", "NSF Certified"],
    },
    {
      name: "AGT",
      url: "https://alshowla.com/wp-content/uploads/2026/01/AGT.jpg",
      country: lang === "ar" ? "🇹🇷 تركيا" : "🇹🇷 Turkey",
      founded: "1984",
      website: "https://www.agtproduct.com",
      category: lang === "ar" ? "أرضيات لامينيت وPVC" : "Laminate & PVC Flooring",
      descAr: "AGT شركة تركية رائدة في تصنيع الأرضيات اللامينيت وأرضيات الفينيل PVC، وألواح الجدران، والأبواب الداخلية. تأسست عام 1984 وتصدّر منتجاتها إلى أكثر من 80 دولة. تتميز منتجاتها بالجودة العالية ومقاومة الرطوبة والمتانة الفائقة.",
      descEn: "AGT is a leading Turkish manufacturer of laminate flooring, PVC flooring, wall panels, and interior doors. Founded in 1984, it exports to 80+ countries with products known for durability and moisture resistance.",
      products: lang === "ar" ? ["أرضيات لامينيت", "أرضيات PVC", "ألواح جدران", "أبواب داخلية"] : ["Laminate flooring", "PVC flooring", "Wall panels", "Interior doors"],
      certifications: ["ISO 9001", "CE Mark", "E1 Emission Class", "PEFC Certified"],
    },
    {
      name: "DeWalt",
      url: "https://alshowla.com/wp-content/uploads/2026/01/DEWALT.jpg",
      country: lang === "ar" ? "🇺🇸 الولايات المتحدة" : "🇺🇸 United States",
      founded: "1923",
      website: "https://www.dewalt.com",
      category: lang === "ar" ? "أدوات كهربائية احترافية" : "Professional Power Tools",
      descAr: "ديوالت علامة تجارية أمريكية مختصة في تصنيع الأدوات الكهربائية الاحترافية للبناء والتشييد. تأسست عام 1923 وهي جزء من مجموعة Stanley Black & Decker. تُعدّ أدواتها الأكثر موثوقية في مواقع البناء حول العالم مع ضمان 3 سنوات.",
      descEn: "DeWalt is an American professional power tools brand founded in 1923, part of Stanley Black & Decker Group. Its tools are the most trusted on construction sites worldwide, offering a 3-year warranty.",
      products: lang === "ar" ? ["مطارق حفر", "مناشير دائرية", "مثاقب لاسلكية", "زوايا طحن", "أدوات القياس الليزرية"] : ["Hammer drills", "Circular saws", "Cordless drills", "Angle grinders", "Laser measuring tools"],
      certifications: ["CE Mark", "UL Safety", "ISO 9001", "CSA Certified"],
    },
    {
      name: "Gyproc",
      url: "https://alshowla.com/wp-content/uploads/2026/01/GYPROC.jpg",
      country: lang === "ar" ? "🇸🇪 السويد / مجموعة سان جوبان" : "🇸🇪 Sweden / Saint-Gobain Group",
      founded: "1917",
      website: "https://www.gyproc.com",
      category: lang === "ar" ? "ألواح الجبس والأسقف" : "Gypsum Board & Ceilings",
      descAr: "جيبروك علامة تجارية سويدية تأسست عام 1917، وهي الآن جزء من مجموعة سان جوبان الفرنسية العملاقة. متخصصة في تصنيع ألواح الجبس والأنظمة الجافة للجدران الداخلية والأسقف. منتجاتها مثالية للتحكم في الصوت والعزل الحراري ومقاومة الحريق.",
      descEn: "Gyproc is a Swedish brand founded in 1917, now part of the Saint-Gobain group. Specializing in gypsum board and dry wall systems for interior walls and ceilings with excellent acoustic, thermal and fire resistance properties.",
      products: lang === "ar" ? ["ألواح جبس قياسية", "ألواح مقاومة للرطوبة", "ألواح مقاومة للحريق", "أسقف معلقة", "ملحقات التركيب"] : ["Standard gypsum boards", "Moisture resistant boards", "Fire resistant boards", "Suspended ceilings", "Installation accessories"],
      certifications: ["ISO 9001", "CE Mark", "BSI Certified", "Fire Class A1"],
    },
    {
      name: "Weber",
      url: "https://alshowla.com/wp-content/uploads/2026/04/weber.jpg",
      country: lang === "ar" ? "🇫🇷 فرنسا / مجموعة سان جوبان" : "🇫🇷 France / Saint-Gobain Group",
      founded: "1902",
      website: "https://www.weber.com",
      category: lang === "ar" ? "مواد البناء الجاهزة" : "Ready-Mix Building Products",
      descAr: "ويبر علامة فرنسية من مجموعة سان جوبان، متخصصة في إنتاج مواد البناء الجاهزة كملاطات الغراء، مواد الأرضيات، طلاءات الواجهات، ومواد العزل. تأسست عام 1902 وتعمل في 60 دولة وتُعدّ من أكبر منتجي ملاطات البناء في العالم.",
      descEn: "Weber is a French brand of Saint-Gobain group, specialized in ready-to-use building mortars, tile adhesives, flooring products, facade coatings, and insulation. Founded in 1902, present in 60 countries.",
      products: lang === "ar" ? ["غراء البلاط", "ملاط الدرزات", "مواد الأرضيات المسطحة", "طلاءات الواجهات", "العزل الحراري الخارجي"] : ["Tile adhesives", "Grouts", "Self-leveling flooring", "Facade coatings", "External wall insulation"],
      certifications: ["ISO 9001", "CE Mark", "LEED Approved", "ISO 14001"],
    },
    {
      name: "Top Wet",
      url: "https://alshowla.com/wp-content/uploads/2026/04/top-wet.jpg",
      country: lang === "ar" ? "🌍 منتج متخصص" : "🌍 Specialized Product",
      founded: "—",
      website: "#",
      category: lang === "ar" ? "أنظمة العزل المائي" : "Waterproofing Systems",
      descAr: "توب ويت منتج متخصص في أنظمة العزل المائي للأسطح والمسابح والحمامات. يُستخدم على نطاق واسع في المشاريع الإنشائية نظراً لقدرته الفائقة على مقاومة الماء والرطوبة. مثالي للتطبيق على الأسطح الخرسانية والطوب والبلاط.",
      descEn: "Top Wet is a specialized waterproofing system for roofs, pools, and bathrooms. Widely used in construction projects for its superior water and humidity resistance. Ideal for concrete, masonry, and tile surfaces.",
      products: lang === "ar" ? ["عازل أسطح", "عازل مسابح", "عازل حمامات", "عازل خزانات المياه"] : ["Roof waterproofing", "Pool waterproofing", "Bathroom waterproofing", "Water tank lining"],
      certifications: ["CE Mark", "ISO 9001"],
    },
    {
      name: "Saint-Gobain",
      url: "https://alshowla.com/wp-content/uploads/2026/01/Saint-Goban.jpg",
      country: lang === "ar" ? "🇫🇷 فرنسا" : "🇫🇷 France",
      founded: "1665",
      website: "https://www.saint-gobain.com",
      category: lang === "ar" ? "مواد البناء المتكاملة" : "Integrated Construction Materials",
      descAr: "سان جوبان شركة فرنسية عريقة تأسست عام 1665 بأمر من الملك لويس الرابع عشر، وهي اليوم واحدة من أكبر مجموعات مواد البناء في العالم. تمتلك أكثر من 160,000 موظف في 75 دولة. تختص في تصنيع الزجاج المسطح، العزل الحراري والصوتي، ألواح الجبس، والأرضيات.",
      descEn: "Saint-Gobain is a French company founded in 1665 by order of King Louis XIV. Today it's one of the world's largest building materials groups with 160,000+ employees in 75 countries. Specializes in flat glass, insulation, gypsum boards, and flooring.",
      products: lang === "ar" ? ["ألواح الجبس (Gyproc)", "عزل حراري وصوتي", "زجاج مسطح", "أرضيات (Weber)", "حلول الواجهات"] : ["Gypsum boards (Gyproc)", "Thermal & acoustic insulation", "Flat glass", "Flooring (Weber)", "Facade solutions"],
      certifications: ["ISO 9001", "ISO 14001", "CE Mark", "LEED Partner"],
    },
    {
      name: "Master Builders Solutions",
      url: "https://alshowla.com/wp-content/uploads/2026/01/Master-building.jpg",
      country: lang === "ar" ? "🇩🇪 ألمانيا / مجموعة MBCC" : "🇩🇪 Germany / MBCC Group",
      founded: "1909",
      website: "https://www.master-builders-solutions.com",
      category: lang === "ar" ? "إضافات الخرسانة والكيمياء الإنشائية" : "Concrete Admixtures & Construction Chemistry",
      descAr: "ماستر بيلدرز سوليوشنز علامة ألمانية تحت مجموعة MBCC، متخصصة في تقديم حلول الكيمياء الإنشائية المتقدمة. تشمل منتجاتها إضافات الخرسانة، مواد الإصلاح والحماية، أنظمة العزل، والطلاءات الصناعية. تخدم مشاريع البنية التحتية والمباني التجارية والصناعية حول العالم.",
      descEn: "Master Builders Solutions is a German brand under MBCC Group, specialized in advanced construction chemistry solutions including concrete admixtures, repair & protection materials, waterproofing systems, and industrial coatings.",
      products: lang === "ar" ? ["إضافات الخرسانة", "مواد الإصلاح الإنشائي", "أنظمة العزل المائي", "طلاءات الحماية", "مواد الحقن"] : ["Concrete admixtures", "Structural repair materials", "Waterproofing systems", "Protective coatings", "Injection materials"],
      certifications: ["ISO 9001", "ISO 14001", "CE Mark", "ASTM Compliant"],
    },
    {
      name: "Knauf",
      url: "https://alshowla.com/wp-content/uploads/2026/01/KNAUF.jpg",
      country: lang === "ar" ? "🇩🇪 ألمانيا" : "🇩🇪 Germany",
      founded: "1932",
      website: "https://www.knauf.com",
      category: lang === "ar" ? "أنظمة الجبس والعزل" : "Gypsum & Insulation Systems",
      descAr: "كناف مجموعة ألمانية عائلية تأسست عام 1932 وتُعدّ من أكبر منتجي مواد الجبس والأنظمة الداخلية في العالم. تمتلك أكثر من 300 مصنع في 90 دولة وتوظف 35,000 شخص. منتجاتها تغطي ألواح الجبس، الصوف الصخري، أنظمة الأسقف المعلقة، ومواد الملاط.",
      descEn: "Knauf is a German family group founded in 1932 and one of the world's largest producers of gypsum products and interior systems. With 300+ plants in 90 countries and 35,000 employees, their products cover gypsum boards, rock wool, suspended ceilings, and plaster.",
      products: lang === "ar" ? ["ألواح جبس W111", "صوف صخري للعزل", "أسقف معلقة", "ملاط الجبس", "أنظمة الأرضيات"] : ["W111 Gypsum boards", "Rock wool insulation", "Suspended ceilings", "Gypsum plaster", "Flooring systems"],
      certifications: ["ISO 9001", "CE Mark", "Euroclass A1", "LEED Partner", "BSI Certified"],
    },
    {
      name: "Stanley",
      url: "https://alshowla.com/wp-content/uploads/2026/01/Stanley.jpg",
      country: lang === "ar" ? "🇺🇸 الولايات المتحدة" : "🇺🇸 United States",
      founded: "1843",
      website: "https://www.stanleytools.com",
      category: lang === "ar" ? "أدوات يدوية وكهربائية" : "Hand Tools & Power Tools",
      descAr: "ستانلي علامة أمريكية عريقة تأسست عام 1843 وهي جزء من مجموعة Stanley Black & Decker. تُصنَّف من بين أعرق وأوسع العلامات التجارية في مجال الأدوات حول العالم. تشمل منتجاتها مجموعات الأدوات اليدوية، أدوات القياس، أدوات النجارة، والأدوات الكهربائية الاحترافية.",
      descEn: "Stanley is an American brand founded in 1843, part of the Stanley Black & Decker Group. It's one of the most trusted tool brands in the world, offering hand tools, measuring tools, woodworking tools, and professional power tools.",
      products: lang === "ar" ? ["مجموعات الأدوات اليدوية", "أدوات القياس", "أدوات النجارة", "صناديق الأدوات", "أدوات اللحام"] : ["Hand tool sets", "Measuring tools", "Woodworking tools", "Tool storage", "Soldering tools"],
      certifications: ["ISO 9001", "CE Mark", "ANSI Compliant", "Lifetime Warranty"],
    },
    {
      name: "Black & Decker",
      url: "https://alshowla.com/wp-content/uploads/2026/01/B-DECKER.jpg",
      country: lang === "ar" ? "🇺🇸 الولايات المتحدة" : "🇺🇸 United States",
      founded: "1910",
      website: "https://www.blackanddecker.com",
      category: lang === "ar" ? "أدوات كهربائية ومنزلية" : "Power Tools & Home Products",
      descAr: "بلاك آند ديكر علامة أمريكية تأسست عام 1910 ومن بين الأوائل في تصنيع الأدوات الكهربائية المحمولة باليد. تُقدّم منتجاتها حلولاً شاملة للمستهلكين والمهنيين في مجالات البناء والصناعة والمنزل. جزء من مجموعة Stanley Black & Decker.",
      descEn: "Black & Decker is an American brand founded in 1910 and among the first to manufacture portable power tools. Offers comprehensive solutions for consumers and professionals in construction, industry, and home use.",
      products: lang === "ar" ? ["مثاقب كهربائية", "مناشير", "زوايا طحن", "أدوات بطارية", "معدات الحديقة"] : ["Electric drills", "Saws", "Angle grinders", "Battery tools", "Garden equipment"],
      certifications: ["CE Mark", "UL Safety", "ISO 9001", "CSA Certified"],
    },
    {
      name: "Deli",
      url: "https://alshowla.com/wp-content/uploads/2026/01/DELI.jpg",
      country: lang === "ar" ? "🇨🇳 الصين" : "🇨🇳 China",
      founded: "1988",
      website: "https://www.deliworld.com",
      category: lang === "ar" ? "أدوات يدوية ومكتبية" : "Hand Tools & Stationery",
      descAr: "ديلي مجموعة صينية تأسست عام 1988 ومن بين أكبر منتجي الأدوات اليدوية ومستلزمات الأعمال في العالم. تصدّر منتجاتها إلى أكثر من 100 دولة. تشمل منتجاتها طواقم الأدوات اليدوية، أقلام القياس، أدوات اللحام، والملاقط المهنية.",
      descEn: "Deli is a Chinese group founded in 1988 and one of the world's largest producers of hand tools and business products. Exports to 100+ countries with products including hand tool sets, measuring pens, welding tools, and professional clamps.",
      products: lang === "ar" ? ["مجموعات الأدوات اليدوية", "مفاتيح وبراغي", "أدوات القطع", "ملاقط مهنية", "أدوات القياس"] : ["Hand tool sets", "Wrenches & screwdrivers", "Cutting tools", "Professional clamps", "Measuring tools"],
      certifications: ["ISO 9001", "CE Mark", "GS Certified"],
    },
    {
      name: "Reform",
      url: "https://alshowla.com/wp-content/uploads/2026/01/REform.jpg",
      country: lang === "ar" ? "🌍 منتجات متخصصة" : "🌍 Specialized Products",
      founded: "—",
      website: "#",
      category: lang === "ar" ? "مواد البناء والتشطيب" : "Building & Finishing Materials",
      descAr: "ريفورم علامة تجارية متخصصة في مواد البناء والتشطيب الداخلي والخارجي. توفر منتجات عالية الجودة للمقاولين والمطورين العقاريين تشمل مواد الديكور الداخلي والواجهات الخارجية والأرضيات.",
      descEn: "Reform is a specialized brand in building and interior/exterior finishing materials. Provides high-quality products for contractors and real estate developers including interior décor, facade, and flooring materials.",
      products: lang === "ar" ? ["مواد التشطيب الداخلي", "ديكور الواجهات", "أرضيات ولوازمها", "مواد العزل"] : ["Interior finishing materials", "Facade décor", "Flooring & accessories", "Insulation materials"],
      certifications: ["ISO 9001", "CE Mark"],
    },
    {
      name: "LCC",
      url: "https://alshowla.com/wp-content/uploads/2026/01/LCC.jpg",
      country: lang === "ar" ? "🇱🇾 ليبيا" : "🇱🇾 Libya",
      founded: "—",
      website: "#",
      category: lang === "ar" ? "مواد بناء ليبية" : "Libyan Building Materials",
      descAr: "LCC شركة ليبية متخصصة في إنتاج وتوزيع مواد البناء المحلية. تساهم في دعم مشاريع البنية التحتية والإسكان في ليبيا بمنتجات محلية الصنع تلبي المعايير الجودة المطلوبة في القطاع الإنشائي الليبي.",
      descEn: "LCC is a Libyan company specializing in production and distribution of local building materials. Contributing to infrastructure and housing projects in Libya with locally manufactured products meeting the quality standards required in the Libyan construction sector.",
      products: lang === "ar" ? ["مواد بناء محلية", "مواد التشطيب", "منتجات الخرسانة"] : ["Local building materials", "Finishing materials", "Concrete products"],
      certifications: ["Libyan Standards Authority"],
    },
    {
      name: "NCC",
      url: "https://alshowla.com/wp-content/uploads/2026/01/NCC.jpg",
      country: lang === "ar" ? "🇱🇾 ليبيا" : "🇱🇾 Libya",
      founded: "—",
      website: "#",
      category: lang === "ar" ? "مواد بناء وإنشاء" : "Building & Construction Materials",
      descAr: "NCC شركة ليبية تعمل في مجال توريد مواد البناء والإنشاء. تدعم المشاريع الإنشائية في ليبيا بمنتجات تتوافق مع احتياجات السوق المحلية ومتطلبات البناء في المناخ الليبي.",
      descEn: "NCC is a Libyan company working in the supply of building and construction materials. Supporting construction projects in Libya with products compatible with local market needs and Libyan climate building requirements.",
      products: lang === "ar" ? ["مواد البناء", "مواد التشطيب", "لوازم الإنشاء"] : ["Building materials", "Finishing materials", "Construction supplies"],
      certifications: ["Libyan Standards Authority"],
    },
    {
      name: "الشركة الليبية للحديد والصلب",
      url: "/partners/libyan-iron-steel.jpg",
      country: lang === "ar" ? "🇱🇾 ليبيا" : "🇱🇾 Libya",
      founded: "—",
      website: "#",
      category: lang === "ar" ? "صناعة الحديد والصلب" : "Iron & Steel Industry",
      descAr: "الشركة الليبية للحديد والصلب، إحدى أكبر الشركات في ليبيا وشمال أفريقيا، متخصصة في إنتاج منتجات الحديد والصلب بأنواعها المختلفة.",
      descEn: "Libyan Iron and Steel Company (LISCO), one of the largest in Libya and North Africa, specialized in producing various iron and steel products.",
      products: lang === "ar" ? ["حديد التسليح", "الصلب", "المنتجات المعدنية"] : ["Rebar", "Steel", "Metal Products"],
      certifications: ["ISO 9001", "Libyan Standards Authority"],
    },
    {
      name: "شركة جولدن متيل",
      url: "/partners/golden-metal.jpg",
      country: lang === "ar" ? "🇱🇾 ليبيا" : "🇱🇾 Libya",
      founded: "—",
      website: "#",
      category: lang === "ar" ? "الصناعات المعدنية" : "Metal Industries",
      descAr: "شركة جولدن متيل، متخصصة في توفير وتصنيع المنتجات المعدنية المتنوعة لتلبية احتياجات قطاع البناء والتشييد.",
      descEn: "Golden Metal Company, specialized in providing and manufacturing various metal products to meet the needs of the construction sector.",
      products: lang === "ar" ? ["المنتجات المعدنية", "الهياكل المعدنية"] : ["Metal Products", "Metal Structures"],
      certifications: ["Libyan Standards Authority"],
    },
    {
      name: "الشركة العربية للأسمنت",
      url: "/partners/arabian-cement.jpg",
      country: lang === "ar" ? "🇱🇾 ليبيا" : "🇱🇾 Libya",
      founded: "—",
      website: "#",
      category: lang === "ar" ? "صناعة الأسمنت" : "Cement Industry",
      descAr: "الشركة العربية للأسمنت، من أبرز مصنعي الأسمنت في المنطقة، تقدم منتجات أسمنتية عالية الجودة لجميع أنواع المشاريع الإنشائية.",
      descEn: "Arab Cement Company, one of the leading cement manufacturers in the region, providing high-quality cement products for all types of construction projects.",
      products: lang === "ar" ? ["الأسمنت البورتلاندي", "الأسمنت المقاوم"] : ["Portland Cement", "Sulfate Resistant Cement"],
      certifications: ["ISO 9001", "Libyan Standards Authority"],
    },
  ];

  const brands = BRAND_DATA;

  const clients = [
    { img: "https://alshowla.com/wp-content/uploads/2026/01/c5.jpg", name: t.cl1, sub: t.cl1s, tall: true },
    { img: "https://alshowla.com/wp-content/uploads/2026/01/c3.jpg", name: t.cl2, sub: t.cl2s, tall: false },
    { img: "https://alshowla.com/wp-content/uploads/2026/01/constr.jpg", name: t.cl3, sub: t.cl3s, tall: false },
    { img: "https://alshowla.com/wp-content/uploads/2026/01/c2.jpg", name: t.cl4, sub: t.cl4s, tall: false },
    { img: "https://alshowla.com/wp-content/uploads/2026/01/c1.jpg", name: t.cl5, sub: t.cl5s, tall: false },
  ];

  const baseTicker = lang === "ar"
    ? ["أنظمة حلول البناء والانشاء", "الأدوات والمعدات الصناعية", "أنظمة الجبس بورد", "بلاط السيراميك", "الديكور الداخلي والخارجي", "أنظمة التعرفية", "الأسمنت والحديد", "عزل حراري"]
    : ["Building & Construction Solutions", "Industrial Tools & Equipment", "Gypsum Board Systems", "Ceramic Tiles", "Interior & Exterior Decor", "Roofing Systems", "Cement & Steel", "Thermal Insulation"];
  const ticker = [...baseTicker, ...baseTicker, ...baseTicker, ...baseTicker];

  return (
    <>
      {/* ── SIDE CONTROLS (Lang + Dark) ── */}
      <div className="side-controls">
        <div className="ctrl-group">
          <button className={`lang-opt${lang === "ar" ? " active" : ""}`} onClick={() => setLang("ar")}>AR</button>
          <button className={`lang-opt${lang === "en" ? " active" : ""}`} onClick={() => setLang("en")}>EN</button>
        </div>
        <div className="ctrl-group" style={{ marginTop: 4 }}>
          <button className="dark-btn" onClick={() => setDark(!dark)} title={dark ? "Light mode" : "Dark mode"}>
            {dark ? "☀️" : "🌙"}
          </button>
        </div>
      </div>

      {/* ── NAV ── */}
      <nav id="nav" className={navSolid ? "solid" : ""}>
        <a href="#home" className="nav-logo">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={LOGO} alt="Al-Showla Al-Raeda Logo" style={{ height: 38 }}
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
          <div>
            <div className="nav-logo-txt">{lang === "ar" ? "الشعلة الرائدة" : "AL-SHOWLA AL-RAEDA"}</div>
            <div className="nav-logo-sub">{lang === "ar" ? "مواد البناء والحلول الإنشائية" : "Building Materials & Construction"}</div>
          </div>
        </a>
        <div className="nav-links">
          <a href="#home">{t.home}</a>
          <div className="nav-drop">
            <a href="#about">{t.company} ▾</a>
            <div className="nav-drop-menu">
              <a href="#about">{t.whoWeAre}</a>
              <a href="#ceo">{t.ceoMsg}</a>
              <a href="/case-studies">{lang === "ar" ? "المشاريع المنفذة" : "Projects"}</a>
              <a href="/applicators">{lang === "ar" ? "المطبّقون المعتمدون" : "Applicators"}</a>
              <a href="/training">{lang === "ar" ? "ورش التدريب" : "Training"}</a>
              <a href="/blog">{lang === "ar" ? "المدونة" : "Blog"}</a>
              <a href="/careers">{lang === "ar" ? "الوظائف" : "Careers"}</a>
            </div>
          </div>
          <a href="#services">{t.services}</a>
          <div className="nav-drop">
            <a href="/products">{t.products} ▾</a>
            <div className="nav-drop-menu">
              <a href="/products">{lang === "ar" ? "كتالوج المنتجات" : "Products Catalog"}</a>
              <a href="/certificates">{lang === "ar" ? "شهادات الجودة" : "Quality Certificates"}</a>
              <a href="/documents">{lang === "ar" ? "مكتبة الوثائق الفنية" : "Technical Documents"}</a>
              <a href="/calculator">{lang === "ar" ? "حاسبة الكميات" : "Calculator"}</a>
              <a href="/delivery">{lang === "ar" ? "مناطق التوصيل" : "Delivery Zones"}</a>
              <a href="/sample">{lang === "ar" ? "طلب عينة مجانية" : "Request Free Sample"}</a>
            </div>
          </div>
          <a href="#clients">{t.clients}</a>
          <a href="#partners">{t.partners}</a>
          <a href="#contact">{t.contact}</a>
          <a href="/faq">{lang === "ar" ? "الأسئلة الشائعة" : "FAQ"}</a>
          <a href="/advisor" style={{ color: "var(--accent)", fontWeight: "bold" }}>
            🔧 {lang === "ar" ? "المستشار الذكي" : "AI Advisor"}
          </a>
          <a href="/contractor/login" style={{ color: "var(--primary)", fontWeight: "bold" }}>
            {lang === "ar" ? "تسجيل المقاولين" : "B2B Login"}
          </a>
          <a href="https://wa.me/218948020200" className="nav-cta" target="_blank" rel="noopener noreferrer">{t.orderNow}</a>
        </div>
        <div className={`hamburger${mobOpen ? " open" : ""}`} onClick={() => setMobOpen(!mobOpen)}>
          <span /><span /><span />
        </div>
      </nav>

      {/* ── MOBILE NAV ── */}
      <div className={`mob-nav${mobOpen ? " open" : ""}`}>
        {[["#home", t.home], ["#about", t.whoWeAre], ["#ceo", t.ceoMsg], ["#services", t.services], ["/products", lang === "ar" ? "كتالوج المنتجات" : "Products Catalog"], ["/advisor", lang === "ar" ? "المستشار الذكي" : "AI Advisor"], ["/certificates", lang === "ar" ? "شهادات الجودة" : "Quality Certificates"], ["/documents", lang === "ar" ? "مكتبة الوثائق" : "Documents"], ["/calculator", lang === "ar" ? "حاسبة الكميات" : "Calculator"], ["/case-studies", lang === "ar" ? "المشاريع" : "Projects"], ["/applicators", lang === "ar" ? "المطبّقون" : "Applicators"], ["/delivery", lang === "ar" ? "مناطق التوصيل" : "Delivery"], ["/training", lang === "ar" ? "ورش التدريب" : "Training"], ["/sample", lang === "ar" ? "طلب عينة" : "Request Sample"], ["/faq", lang === "ar" ? "الأسئلة الشائعة" : "FAQ"], ["/blog", lang === "ar" ? "المدونة" : "Blog"], ["/careers", lang === "ar" ? "الوظائف" : "Careers"], ["#clients", t.clients], ["#partners", t.partners], ["#contact", t.contact]].map(([href, label]) => (
          <a key={href} href={href} onClick={() => setMobOpen(false)}>{label}</a>
        ))}
        <div className="mob-nav-divider" />
        <a href="/contractor/login" style={{ color: "var(--primary)" }} onClick={() => setMobOpen(false)}>
          {lang === "ar" ? "تسجيل المقاولين (B2B)" : "B2B Login"}
        </a>
        <a href="https://wa.me/218948020200" target="_blank" rel="noopener noreferrer"
          style={{ color: "var(--accent)" }} onClick={() => setMobOpen(false)}>{t.orderWhatsapp}</a>
      </div>

      {/* ══════════════════ HERO ══════════════════ */}
      <section id="home">
        <div className="hero-photo">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={heroBanner || HERO_IMG} alt="Al-Showla Al-Raeda hero"
            onError={(e) => { (e.target as HTMLImageElement).parentElement!.style.background = "var(--blue-deeper)"; }} />
        </div>
        <div className="hero-dots" />
        <div className="hero-inner">
          <div className="hero-left">
            <div className="hero-tag ao" style={{ marginBottom: 14 }}>{t.heroTag}</div>
            <h1 className="hh ao d1" style={{ marginTop: 6 }}>
              {t.heroH1a}<br />
              <em style={{ display: "inline-block", marginTop: 10 }}>{t.heroH1b}</em>
            </h1>
            <p className="hero-p ao d2">{t.heroP}</p>
            <div className="hero-btns ao d3">
              <a href="#about" className="btn-w">{t.discoverStory}</a>
              <a href="#contact" className="btn-gh">{t.getQuote}</a>
            </div>
            <div className="hstats ao d4">
              {[
                { t: "20", s: "+", l: t.yearsExp },
                { t: "100", s: "+", l: t.projectsDel },
                { t: "75", s: "+", l: t.satisfiedClients },
                { t: "14", s: "", l: t.globalBrands },
              ].map((s, i) => (
                <div className="hstat" key={i}>
                  <div className="hstat-n" dir="ltr" data-t={s.t} data-suffix={s.s}>{s.t + s.s}</div>
                  <div className="hstat-l">{s.l}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="hero-right ao d2">
            {/* Decorative SVG hexagons */}
            <svg viewBox="0 0 440 440" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", maxWidth: 440 }}>
              <defs>
                <linearGradient id="hg1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#0051a2" stopOpacity=".5" />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity=".2" />
                </linearGradient>
              </defs>
              {[
                [220, 160, 120], [220, 160, 90], [220, 160, 58],
                [100, 220, 55], [340, 220, 55], [220, 330, 45],
              ].map(([cx, cy, r], i) => (
                <polygon key={i} fill={i < 3 ? "none" : "url(#hg1)"} stroke={i === 0 ? "rgba(255,255,255,.15)" : i === 1 ? "rgba(245,158,11,.25)" : "rgba(0,81,162,.4)"}
                  strokeWidth="1.5"
                  points={Array.from({ length: 6 }, (_, k) => {
                    const a = (Math.PI / 180) * (60 * k - 30);
                    return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`;
                  }).join(" ")} />
              ))}
              <text x="220" y="170" textAnchor="middle" fill="rgba(255,255,255,.9)" fontSize="15" fontWeight="800" fontFamily="Cairo, sans-serif">الشعلة الرائدة</text>
              <text x="220" y="192" textAnchor="middle" fill="rgba(245,158,11,.8)" fontSize="10" fontWeight="600" fontFamily="Cairo, sans-serif">EST. 2005</text>
            </svg>
          </div>
        </div>
        <div className="hero-scroll">
          <div className="sline" />
          <span>{t.scroll}</span>
        </div>
      </section>

      {/* ── TICKER ── */}
      <div className="ticker" aria-hidden="true">
        <div className="t-track">
          <div className="t-inner">
            {ticker.map((item, i) => (
              <span className="ti" key={`a${i}`}>{item}</span>
            ))}
          </div>
          <div className="t-inner" aria-hidden="true">
            {ticker.map((item, i) => (
              <span className="ti" key={`b${i}`}>{item}</span>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════════════ ABOUT ══════════════════ */}
      <section id="about" className="sec" style={{ background: "var(--white)" }}>
        <div className="con">
          <div className="about-grid">
            <div className="about-imgbox al">
              <div className="about-imgbox-inner">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={VISION_IMG} alt="About Al-Showla Al-Raeda"
                  onError={(e) => { (e.target as HTMLImageElement).src = MISSION_IMG; }} />
              </div>
              <div className="ab-badge">
                <div className="ab-n">20+</div>
                <div className="ab-t">{t.yearsOfTrust}</div>
              </div>
            </div>
            <div className="ar">
              <div className="lbl">{t.whoWeAreLbl}</div>
              <h2 className="sh">{t.aboutH2a} <em>{t.aboutH2b}</em></h2>
              <p className="sp" style={{ marginBottom: 14 }}>{t.aboutP1}</p>
              <p className="sp" style={{ marginBottom: 14 }}>{t.aboutP2}</p>
              <p className="sp">{t.aboutP3}</p>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 24 }}>
                <a href="#contact"
                  style={{ border: "2px solid var(--blue)", color: "var(--blue)", padding: "11px 26px", fontSize: 13, fontWeight: 700, textDecoration: "none", cursor: "pointer", transition: "all .25s" }}
                  onMouseOver={(e) => { const el = e.target as HTMLElement; el.style.background = "var(--blue)"; el.style.color = "#fff"; }}
                  onMouseOut={(e) => { const el = e.target as HTMLElement; el.style.background = "transparent"; el.style.color = "var(--blue)"; }}>
                  {t.contactUs}
                </a>
              </div>
            </div>
          </div>

          {/* Vision & Mission */}
          <div className="vm-bento ao">
            <div className="vm-pane">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={VISION_IMG} alt={t.ourVision} />
              <div className="vm-over">
                <div className="lbl lbl-w">{t.ourVision}</div>
                <div className="vm-t">{t.visionH} <em>{t.visionHem}</em></div>
                <p className="vm-b">{t.visionP}</p>
              </div>
            </div>
            <div className="vm-pane">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={MISSION_IMG} alt={t.ourMission} />
              <div className="vm-over">
                <div className="lbl lbl-w">{t.ourMission}</div>
                <div className="vm-t"><em>{t.missionH}</em> {t.missionHb}</div>
                <div className="vm-b">
                  <ul>
                    {[t.missionLi1, t.missionLi2, t.missionLi3, t.missionLi4].map((li, i) => <li key={i}>{li}</li>)}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Values */}
          <div className="vals ao">
            {[
              { ico: "🤝", t: t.val1t, b: t.val1b },
              { ico: "⭐", t: t.val2t, b: t.val2b },
              { ico: "🏆", t: t.val3t, b: t.val3b },
              { ico: "🌱", t: t.val4t, b: t.val4b },
              { ico: "💡", t: t.val5t, b: t.val5b },
            ].map((v, i) => (
              <div className="val-item" key={i}>
                <div className="val-ico">{v.ico}</div>
                <div className="val-t">{v.t}</div>
                <div className="val-b">{v.b}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════ CEO ══════════════════ */}
      <section id="ceo" className="sec" style={{ background: "var(--off)" }}>
        <div className="con">
          <div className="ceo-grid">
            <div className="ceo-portrait-wrap al">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/chairman.jpg" alt={t.ceoName} />
            </div>
            <div className="ar">
              <div className="lbl">{t.ceoLbl}</div>
              <div className="ceo-name">{t.ceoName}</div>
              <div className="ceo-quote">{t.ceoQuote}</div>
              <p className="ceo-body" style={{ marginBottom: 12 }}>{t.ceoBody1}</p>
              <p className="ceo-body">{t.ceoBody2}</p>
              <div className="ceo-kpis">
                {[{ n: t.kpi1n, l: t.kpi1l }, { n: t.kpi2n, l: t.kpi2l }, { n: t.kpi3n, l: t.kpi3l }, { n: t.kpi4n, l: t.kpi4l }].map((k, i) => (
                  <div className="ceo-kpi" key={i}>
                    <div className="ceo-kpi-n" dir="ltr">{k.n}</div>
                    <div className="ceo-kpi-l">{k.l}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════ SERVICES ══════════════════ */}
      <section id="services" className="sec" style={{ background: "var(--blue-deeper)" }}>
        <div className="con">
          <div className="lbl lbl-w ao">{t.servicesLbl}</div>
          <h2 className="sh shw ao">{t.servicesH2a} <em style={{ color: "var(--accent)" }}>{t.servicesH2b}</em></h2>
          <div className="svc-grid">
            {[
              { bg: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800", ico: "🔧", n: "01", t: t.svc1t, b: t.svc1b, descAr: "فهم احتياجات العملاء وتقديم المشورة الفنية واختيار وتوصيف المواد والأنظمة والحلول المناسبة لمختلف التطبيقات ومتطلبات قطاع البناء، بالاعتماد على خبرة فنية متخصصة تضمن الاختيار الأمثل لكل مشروع.", descEn: "Understanding client needs and providing technical advice — selecting and specifying the right materials, systems, and solutions for the various applications and requirements of the construction sector, backed by specialized expertise that ensures the optimal choice for every project." },
              { bg: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800", ico: "📦", n: "02", t: t.svc2t, b: t.svc2b, descAr: "توفير مجموعة متكاملة من مواد وأنظمة البناء والكيماويات الإنشائية وأنظمة الجبس والعدد والأدوات الصناعية، لخدمة المشاريع والمقاولين والشركات والتجار والعملاء، عبر سلسلة إمداد مستقرة وشبكة توزيع تغطي كافة أنحاء ليبيا.", descEn: "Providing an integrated range of building materials and systems, construction chemicals, gypsum systems, and industrial tools and equipment — serving projects, contractors, companies, traders, and clients through a stable supply chain and a distribution network covering all of Libya." },
              { bg: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800", ico: "🛠️", n: "03", t: t.svc3t, b: t.svc3b, descAr: "تقديم الدعم الفني والتدريب والعينات والتجارب، ومساندة العملاء وفرق التنفيذ في الاستخدام والتطبيق الصحيح للمنتجات والأنظمة بالتعاون مع المصنّعين، لضمان أفضل النتائج على أرض الواقع.", descEn: "Providing technical support, training, samples, and trials, and assisting clients and execution teams in the correct use and application of products and systems in cooperation with manufacturers to ensure the best results on site." },
              { bg: "/services/support-247.jpg", ico: "🤝", n: "04", t: t.svc4t, b: t.svc4b, descAr: "متابعة العملاء بعد التوريد والبيع، وتقديم الدعم الفني ومعالجة الملاحظات وتوفير الاحتياجات اللاحقة، لضمان تجربة متكاملة وعلاقة مستدامة مع العميل تقوم على الثقة والاستمرارية.", descEn: "Following up with clients after supply and sale, providing technical support, addressing feedback, and meeting subsequent needs to ensure an integrated experience and a sustainable client relationship built on trust and continuity." },
            ].map((s, i) => (
              <div className="svc-card" key={i} onClick={() => setSelectedService(s)} style={{ cursor: "pointer" }}>
                <div className="svc-img" style={{ backgroundImage: `url(${s.bg})` }} />
                <div className="svc-shade" />
                <div className="svc-body">
                  <div className="svc-idx">{s.n}</div>
                  <div className="svc-ico">{s.ico}</div>
                  <div className="svc-t">{s.t}</div>
                  <div className="svc-b">{s.b}</div>
                </div>
                <div className="svc-bar" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════ PRODUCTS ══════════════════ */}
      <section id="products" className="sec" style={{ background: "var(--white)" }}>
        <div className="con">
          <div className="prod-hd">
            <div>
              <div className="lbl ao">{t.productsLbl}</div>
              <h2 className="sh ao">{t.productsH2a} <em>{t.productsH2b}</em></h2>
            </div>
            <a href="/products" style={{ color: "var(--blue)", fontWeight: 700, fontSize: 14, textDecoration: "none", flexShrink: 0 }}>{t.viewAll}</a>
          </div>
          <div className="prod-grid">
            {products.map((p, i) => (
              <a href={p.categoryId ? `/products?category=${p.categoryId}` : "/products"} className="pc" key={i} style={{ cursor: "pointer", textDecoration: "none" }}>
                <div className="pc-bg" style={{ backgroundImage: `url(${p.bg})` }} />
                <div className="pc-sh" />
                <div className="pc-ln" />
                <div className="pc-body">
                  <div className="pc-num">{String(i + 1).padStart(2, "0")}</div>
                  <div className="pc-tag">{p.tag}</div>
                  <div className="pc-t">{p.t}</div>
                </div>
              </a>
            ))}
          </div>

          {/* Brands */}
          <div style={{ marginTop: 48 }}>
            <div className="lbl ao">{t.brandsLbl}</div>
            <div className="brands-g">
              {BRAND_DATA.map((b, i) => (
                <div className="br-cell" key={i}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={b.url} alt={b.name}
                    onError={(e) => {
                      const el = e.target as HTMLImageElement;
                      el.style.display = "none";
                      const span = document.createElement("span");
                      span.textContent = b.name;
                      span.style.cssText = "font-size:14px;font-weight:800;color:var(--gray);opacity:.5;";
                      el.parentElement?.appendChild(span);
                    }} />
                </div>
              ))}
            </div>
          </div>

          {/* ── Brand Popup Modal ── */}
          {selectedBrand && (
            <div
              onClick={() => setSelectedBrand(null)}
              style={{
                position: "fixed", inset: 0, background: "rgba(0,10,30,.75)",
                zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center",
                padding: "4%", backdropFilter: "blur(6px)",
              }}
            >
              <div
                onClick={e => e.stopPropagation()}
                style={{
                  background: "#fff", borderRadius: 20, width: "100%", maxWidth: 680,
                  maxHeight: "88vh", overflowY: "auto",
                  boxShadow: "0 30px 80px rgba(0,0,0,.45), 0 0 0 1px rgba(0,81,162,.15)",
                  animation: "brandPopIn .35s cubic-bezier(.16,1,.3,1)",
                }}
              >
                <style>{`
                  @keyframes brandPopIn { from { opacity:0; transform:scale(.92) translateY(20px); } to { opacity:1; transform:none; } }
                  .br-hover-label { opacity: 0; }
                  .br-cell:hover .br-hover-label { opacity: 1 !important; }
                `}</style>

                {/* Header */}
                <div style={{
                  background: "linear-gradient(135deg, #001f4d, #0051a2)",
                  borderRadius: "20px 20px 0 0", padding: "24px 28px",
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={selectedBrand.url} alt={selectedBrand.name}
                      style={{
                        width: 80, height: 56, objectFit: "contain",
                        background: "#fff", borderRadius: 10, padding: 8,
                        flexShrink: 0,
                      }}
                    />
                    <div>
                      <div style={{ fontSize: 22, fontWeight: 900, color: "#fff" }}>{selectedBrand.name}</div>
                      <div style={{ fontSize: 13, color: "rgba(255,255,255,.7)", marginTop: 2 }}>{selectedBrand.country}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedBrand(null)}
                    style={{
                      background: "rgba(255,255,255,.15)", border: "1px solid rgba(255,255,255,.3)",
                      color: "#fff", width: 38, height: 38, borderRadius: 10,
                      fontSize: 18, cursor: "pointer", display: "flex",
                      alignItems: "center", justifyContent: "center", flexShrink: 0,
                    }}
                  >✕</button>
                </div>

                <div style={{ padding: "28px" }}>
                  {/* Info chips */}
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20 }}>
                    {[{
                      icon: "🏭", label: lang === "ar" ? "تأسست" : "Founded", val: selectedBrand.founded
                    }, {
                      icon: "📦", label: lang === "ar" ? "التخصص" : "Category", val: selectedBrand.category
                    }, {
                      icon: "🌐", label: lang === "ar" ? "الموقع" : "Website",
                      val: selectedBrand.website !== "#" ? (
                        <a href={selectedBrand.website} target="_blank" rel="noreferrer"
                          style={{ color: "#0051a2", fontWeight: 700, textDecoration: "none" }}
                        >
                          {lang === "ar" ? "زيارة الموقع ↗" : "Visit Website ↗"}
                        </a>
                      ) : (lang === "ar" ? "غير متاح" : "N/A")
                    }].map((chip, ci) => (
                      <div key={ci} style={{
                        background: "#f0f6ff", border: "1px solid #d0e4fb",
                        borderRadius: 10, padding: "10px 14px", flex: "1 1 180px",
                      }}>
                        <div style={{ fontSize: 11, color: "#64748b", fontWeight: 700, marginBottom: 4 }}>
                          {chip.icon} {chip.label}
                        </div>
                        <div style={{ fontSize: 13, fontWeight: 800, color: "#1e293b" }}>
                          {typeof chip.val === "string" ? chip.val : chip.val}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Description */}
                  <p style={{
                    fontSize: 14, lineHeight: 1.85, color: "#374151",
                    background: "#f8faff", border: "1px solid #e0ecff",
                    borderRadius: 12, padding: "16px 18px", margin: "0 0 20px",
                  }}>
                    {lang === "ar" ? selectedBrand.descAr : selectedBrand.descEn}
                  </p>

                  {/* Products */}
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ fontSize: 13, fontWeight: 900, color: "#0051a2", marginBottom: 10, letterSpacing: ".04em" }}>
                      📋 {lang === "ar" ? "المنتجات والخدمات المتاحة" : "Available Products & Services"}
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {selectedBrand.products.map((p: string, pi: number) => (
                        <span key={pi} style={{
                          background: "#e8f0fb", color: "#0051a2",
                          border: "1px solid #c7d9f5",
                          borderRadius: 20, padding: "5px 14px",
                          fontSize: 12, fontWeight: 700,
                        }}>
                          ✓ {p}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Certifications */}
                  <div style={{ marginBottom: 24 }}>
                    <div style={{ fontSize: 13, fontWeight: 900, color: "#0051a2", marginBottom: 10, letterSpacing: ".04em" }}>
                      🏅 {lang === "ar" ? "شهادات الجودة" : "Quality Certifications"}
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {selectedBrand.certifications.map((c: string, ci: number) => (
                        <span key={ci} style={{
                          background: "#fefce8", color: "#92400e",
                          border: "1px solid #fde68a",
                          borderRadius: 20, padding: "5px 14px",
                          fontSize: 12, fontWeight: 800,
                        }}>
                          🏅 {c}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* CTA */}
                  <div style={{ display: "flex", gap: 10 }}>
                    <a
                      href="#contact"
                      onClick={() => setSelectedBrand(null)}
                      style={{
                        flex: 1, background: "linear-gradient(135deg, #0051a2, #003578)",
                        color: "#fff", padding: "13px", borderRadius: 12,
                        textAlign: "center", fontWeight: 800, fontSize: 14,
                        textDecoration: "none", display: "block",
                        boxShadow: "0 4px 15px rgba(0,81,162,.35)",
                      }}
                    >
                      {lang === "ar" ? "📞 تواصل معنا لطلب المنتجات" : "📞 Contact Us to Order"}
                    </a>
                    {selectedBrand.website !== "#" && (
                      <a
                        href={selectedBrand.website}
                        target="_blank" rel="noreferrer"
                        style={{
                          padding: "13px 20px", borderRadius: 12,
                          border: "1.5px solid #0051a2", color: "#0051a2",
                          fontWeight: 800, fontSize: 14, textDecoration: "none",
                          display: "flex", alignItems: "center", gap: 6,
                        }}
                      >
                        🌐 {lang === "ar" ? "الموقع الرسمي" : "Official Site"}
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Service Popup Modal ── */}
          {selectedService && (
            <div
              onClick={() => setSelectedService(null)}
              style={{
                position: "fixed", inset: 0, background: "rgba(0,10,30,.75)",
                zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center",
                padding: "4%", backdropFilter: "blur(6px)",
              }}
            >
              <div
                onClick={e => e.stopPropagation()}
                style={{
                  background: "#fff", borderRadius: 20, width: "100%", maxWidth: 500,
                  maxHeight: "88vh", overflowY: "auto",
                  boxShadow: "0 30px 80px rgba(0,0,0,.45)",
                  animation: "brandPopIn .3s ease-out",
                }}
              >
                <div style={{
                  height: 180, backgroundImage: `url(${selectedService.bg})`,
                  backgroundSize: "cover", backgroundPosition: "center",
                  borderRadius: "20px 20px 0 0", position: "relative"
                }}>
                  <button
                    onClick={() => setSelectedService(null)}
                    style={{
                      position: "absolute", top: 16, right: 16,
                      background: "rgba(0,0,0,.5)", border: "none",
                      color: "#fff", width: 32, height: 32, borderRadius: "50%",
                      fontSize: 16, cursor: "pointer", display: "flex",
                      alignItems: "center", justifyContent: "center",
                    }}
                  >✕</button>
                </div>
                <div style={{ padding: "24px" }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>{selectedService.ico}</div>
                  <h3 style={{ fontSize: 24, fontWeight: 900, color: "var(--blue-deeper)", marginBottom: 12 }}>{selectedService.t}</h3>
                  <p style={{ fontSize: 16, color: "#475569", lineHeight: 1.8, marginBottom: 24 }}>
                    {lang === "ar" ? selectedService.descAr : selectedService.descEn}
                  </p>
                  <a href="#contact" onClick={() => setSelectedService(null)} style={{
                    display: "inline-block", background: "var(--blue)", color: "#fff",
                    padding: "12px 24px", borderRadius: 8, textDecoration: "none", fontWeight: 700
                  }}>
                    {lang === "ar" ? "تواصل معنا للاستفسار" : "Contact us for inquiries"}
                  </a>
                </div>
              </div>
            </div>
          )}

        </div>
      </section>

      {/* ══════════════════ CLIENTS ══════════════════ */}
      <section id="clients" className="sec" style={{ background: "var(--off)" }}>
        <div className="con">
          <div className="lbl ao">{t.clientsLbl}</div>
          <h2 className="sh ao">{t.clientsH2a} <em>{t.clientsH2b}</em></h2>
          <div className="cl-bento" style={{ marginTop: 48 }}>
            {clients.map((c, i) => (
              <div className={`cl-card${c.tall ? " tall" : ""}`} key={i}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={c.img} alt={c.name} />
                <div className="cl-over">
                  <div className="cl-dot" />
                  <div className="cl-t">{c.name}</div>
                  <div className="cl-sub">{c.sub}</div>
                </div>
                <div className="cl-ln" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════ PARTNERS ══════════════════ */}
      <section id="partners" className="sec" style={{ background: "var(--white)" }}>
        <div className="con">
          <div className="lbl ao">{t.partnersLbl}</div>
          <h2 className="sh ao">{t.partnersH2a} <em>{t.partnersH2b}</em></h2>
          <div className="pg-grid">
            {BRAND_DATA.map((b, i) => (
              <div className="pg" key={i}
                onClick={() => setSelectedBrand(b)}
                title={b.name}
                style={{ cursor: "pointer", position: "relative", transition: "all .3s", overflow: "hidden" }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.transform = "translateY(-4px)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 24px rgba(0,81,162,.15)";
                  (e.currentTarget as HTMLElement).style.borderColor = "rgba(0,81,162,.3)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.transform = "none";
                  (e.currentTarget as HTMLElement).style.boxShadow = "none";
                  (e.currentTarget as HTMLElement).style.borderColor = "";
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={b.url} alt={b.name}
                  onError={(e) => {
                    const el = e.target as HTMLImageElement;
                    el.style.display = "none";
                    const s = document.createElement("span");
                    s.textContent = b.name;
                    s.style.cssText = "font-size:12px;font-weight:800;color:var(--gray);opacity:.5;";
                    el.parentElement?.appendChild(s);
                  }} />
                <div style={{
                  position: "absolute", bottom: 0, left: 0, right: 0,
                  background: "linear-gradient(to top, rgba(0,31,77,.8), transparent)",
                  color: "#fff", fontSize: 10, fontWeight: 800, padding: "12px 6px 4px",
                  opacity: 0, transition: "opacity .3s",
                  textAlign: "center", letterSpacing: ".02em",
                }} className="br-hover-label">
                  {lang === "ar" ? "عرض التفاصيل" : "View Details"}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════ CONTACT ══════════════════ */}
      <section id="contact" className="sec" style={{ background: "var(--blue-deeper)" }}>
        <div className="con">
          <div className="contact-grid">
            <div>
              <div className="lbl lbl-w ao">{t.contactLbl}</div>
              <div className="c-bar" />
              <h2 className="c-h ao">{t.contactH} <em>{t.contactHem}</em></h2>
              <p className="c-p ao">{t.contactP}</p>
              {[
                { ico: "📞", lbl: t.phoneLbl, val: <a href="tel:+218948020200" dir="ltr" style={{ unicodeBidi: "embed", display: "inline-block" }}>{t.phoneVal}</a> },
                { ico: "✉️", lbl: t.emailLbl, val: <a href="mailto:info@alshowla.com">{t.emailVal}</a> },
                { ico: "📍", lbl: t.addressLbl, val: <span>{t.addressVal}</span> },
                { ico: "🕐", lbl: t.hoursLbl, val: <span>{t.hoursVal}</span> },
              ].map((c, i) => (
                <div className="ci ao" key={i}>
                  <div className="ci-ico">{c.ico}</div>
                  <div>
                    <div className="ci-lbl">{c.lbl}</div>
                    <div className="ci-val">{c.val}</div>
                  </div>
                </div>
              ))}
              <div className="soc-row">
                {[
                  ["WhatsApp", "https://wa.me/218948020200"],
                  ["Facebook", "https://www.facebook.com/ALSHOLA1500"],
                  ["Instagram", "https://www.instagram.com/alshola2024"],
                ].map(([name, url]) => (
                  <a key={name} href={url} target="_blank" rel="noopener noreferrer" className="soc-a">{name}</a>
                ))}
              </div>
              <div className="ao" style={{ marginTop: 20, borderRadius: 8, overflow: "hidden", border: "1px solid rgba(255,255,255,.15)" }}>
                <iframe
                  title="موقع الشركة"
                  src="https://www.google.com/maps?q=32.0709114074707,20.06633186340332&z=17&hl=en&output=embed"
                  width="100%"
                  height="220"
                  style={{ border: 0 }}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
              <a href="https://www.google.com/maps?q=32.0709114074707,20.06633186340332&z=17&hl=en" target="_blank" rel="noopener noreferrer"
                className="ao" style={{ display: "inline-block", marginTop: 10, color: "var(--accent)", fontSize: 13, fontWeight: 700, textDecoration: "none" }}>
                🗺️ {t.openMap}
              </a>
            </div>
            <div>
              <div className="form-wrap ao">
                {formSent ? (
                  <div style={{ background: "#d1fae5", border: "1.5px solid #059669", padding: "18px 20px", color: "#065f46", fontWeight: 700, fontSize: 14, borderRadius: 2 }}>
                    {t.formSuccess}
                  </div>
                ) : (
                  <form onSubmit={handleForm}>
                    {formError && <div style={{ color: "#fca5a5", marginBottom: 12, fontSize: 13 }}>{formError}</div>}
                    {/* Honeypot: hidden from humans; bots that fill it are silently dropped */}
                    <input name="company_website" type="text" tabIndex={-1} autoComplete="off" aria-hidden="true"
                      style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0 }} />
                    <div className="f2">
                      <div className="fg"><label>{t.formName}</label><input name="name" type="text" required /></div>
                      <div className="fg"><label>{t.formEmail}</label><input name="email" type="email" /></div>
                    </div>
                    <div className="f2">
                      <div className="fg"><label>{t.formPhone}</label><input name="phone" type="tel" /></div>
                      <div className="fg"><label>{t.formSubject}</label><input name="subject" type="text" required /></div>
                    </div>
                    <div className="fg"><label>{t.formMsg}</label><textarea name="message" required /></div>
                    <p style={{ fontSize: 11, color: "rgba(255,255,255,.45)", margin: "0 0 12px", lineHeight: 1.7 }}>{t.privacyNote}</p>
                    <button type="submit" className="fsub">{t.formSend}</button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════ FOOTER ══════════════════ */}
      <footer>
        <div className="ft-top">
          <div className="ft-brand">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={LOGO} alt="Al-Showla Al-Raeda"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
            <p>{t.footerDesc}</p>
          </div>
          <div>
            <div className="ft-col-h">{t.quickLinks}</div>
            <ul className="ft-links">
              {[["#home", t.home], ["#about", t.whoWeAre], ["#ceo", t.ceoMsg], ["#contact", t.contact]].map(([href, label]) => (
                <li key={href}><a href={href}>{label}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <div className="ft-col-h">{t.ourServices}</div>
            <ul className="ft-links">
              {[t.svc1t, t.svc2t, t.svc3t, t.svc4t].map((s) => (
                <li key={s}><a href="#services">{s}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <div className="ft-col-h">{t.followUs}</div>
            <ul className="ft-links">
              {[["WhatsApp", "https://wa.me/218948020200"], ["Facebook", "https://www.facebook.com/ALSHOLA1500"], ["Instagram", "https://www.instagram.com/alshola2024"]].map(([name, url]) => (
                <li key={name}><a href={url} target="_blank" rel="noopener noreferrer">{name}</a></li>
              ))}
            </ul>
          </div>
        </div>
        <div className="ft-bot">
          <div className="ft-copy">{t.copyright}</div>
          <div className="ft-soc">
            <a href="https://wa.me/218948020200" target="_blank" rel="noopener noreferrer">WhatsApp</a>
            <a href="https://www.facebook.com/ALSHOLA1500" target="_blank" rel="noopener noreferrer">Facebook</a>
          </div>
        </div>
      </footer>

      {/* ── WHATSAPP FAB ── */}
      <a href="https://wa.me/218948020200" className="wafab" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
        </svg>
      </a>
    </>
  );
}
