// Featured projects and partners — as supplied by the client (Oct 2026).
// Shared by the homepage and the company profile. Where the client's two lists spelled a
// company differently, the spelling from the approved partners list is used.

export type Project = {
  titleAr: string;
  titleEn: string;
  // Contractors / developers we supplied on this project. Each entry: [Arabic, English].
  parties: [string, string][];
  group: "major" | "supply";
  image?: string;
};

export const PROJECTS: Project[] = [
  {
    titleAr: "مشروع جامعة بنغازي", titleEn: "University of Benghazi Project", group: "major",
    parties: [
      ["كلية العلوم — شركة الفرات للمقاولات", "Faculty of Science — Al-Furat Contracting"],
      ["كلية القانون — شركة الوصيد العقارية", "Faculty of Law — Al-Waseed Real Estate"],
      ["كلية الآداب — شركة الدار البيضاء", "Faculty of Arts — Al-Dar Al-Baida"],
      ["كلية الاقتصاد — شركة طائر البجعة", "Faculty of Economics — Taer Al-Bajaa"],
      ["كلية الهندسة — شركة عبر العالم", "Faculty of Engineering — Abr Al-Alam"],
      ["مبيت الطلبة — شركة إطار التعمير", "Student Housing — Itar Al-Taamir"],
    ],
  },
  { titleAr: "مشروع كوبري الهواري", titleEn: "Al-Hawari Bridge Project", group: "major", parties: [["شركة السعداء جروب", "Al-Suadaa Group"]] },
  { titleAr: "مشروع كوبري طريق المطار", titleEn: "Airport Road Bridge Project", group: "major", parties: [["شركة وادي النيل", "Wadi Al-Nil"]] },
  { titleAr: "الطريق الدائري الثالث", titleEn: "Third Ring Road", group: "major", parties: [["شركة نيوم مصر", "NEOM Egypt"]] },
  { titleAr: "أبراج بنغازي — جليانة", titleEn: "Benghazi Towers — Juliana", group: "major", parties: [["شركة TGG التركية", "TGG (Turkey)"]] },
  { titleAr: "فندق كورنيش بنغازي", titleEn: "Benghazi Corniche Hotel", group: "major", parties: [["شركة Kapasite", "Kapasite Proje"]] },
  { titleAr: "مشروع القرية السياحية", titleEn: "Tourist Village Project", group: "major", parties: [["شركة بن غاطي للإعمار", "Binghatti Development"]] },
  {
    titleAr: "مشروع 20 ألف وحدة سكنية", titleEn: "20,000 Housing Units Project", group: "major",
    parties: [["شركة القمم العالية", "Al-Qimam Al-Aliya"], ["شركة الفرات للمقاولات", "Al-Furat Contracting"], ["شركة الرائدة القابضة", "Al-Raeda Holding"]],
  },
  { titleAr: "مشروع خزانات سلوق", titleEn: "Suluq Water Tanks Project", group: "major", parties: [["SET Construction", "SET Construction"]] },
  { titleAr: "مشروع مستشفى الأطفال والولادة", titleEn: "Children's & Maternity Hospital", group: "major", parties: [["الشركة الليبية التونسية", "Libyan Tunisian Company (LTC)"]] },
  { titleAr: "مشروع ميناء بنغازي الجديد", titleEn: "New Benghazi Port Project", group: "major", parties: [["SET Construction", "SET Construction"]] },
  { titleAr: "مشروع جامعة العرب", titleEn: "Arab University Project", group: "major", parties: [["شركة اكانيميا", "Ankamena İnşaat"]] },
  { titleAr: "مشروع صيانة المصرف المركزي", titleEn: "Central Bank Maintenance Project", group: "major", parties: [] },
  { titleAr: "مشروع مجمع اللوتس", titleEn: "Lotus Complex Project", group: "major", parties: [["شركة B3 جروب", "B3 Group"]] },
  { titleAr: "محطات المعالجة — درنة", titleEn: "Treatment Plants — Derna", group: "major", parties: [["شركة CEE المصرية", "CEE (Egypt)"]] },
  { titleAr: "إعمار درنة بعد الفيضان", titleEn: "Derna Reconstruction after the Flood", group: "major", parties: [] },
  { titleAr: "توريدات عامة لعدة مشاريع", titleEn: "General supplies for multiple projects", group: "supply", parties: [["مجموعة خليفة القابضة", "Khalifa Holding Group"]] },
  { titleAr: "توريدات عامة لعدة مشاريع", titleEn: "General supplies for multiple projects", group: "supply", parties: [["شركة الرائدة القابضة", "Al-Raeda Holding"]] },
  { titleAr: "توريدات عامة لعدة مشاريع", titleEn: "General supplies for multiple projects", group: "supply", parties: [["شركة مراس", "Meraas"]] },
  { titleAr: "توريدات عامة لمشاريع الجنوب", titleEn: "General supplies for southern projects", group: "supply", parties: [] },
];

export type Partner = { nameAr: string; nameEn: string; logo?: string; big?: boolean };

// Final approved partners list. Add `logo: "/partners/<file>"` as each logo arrives —
// cards without a logo show the company name instead.
export const PARTNERS: Partner[] = [
  { nameAr: "شركة بن غاطي الإماراتية", nameEn: "Binghatti (UAE)", logo: "/partners/binghatti.webp" },
  { nameAr: "شركة اكانيميا", nameEn: "Ankamena İnşaat (Turkey)", logo: "/partners/ankamena.webp" },
  { nameAr: "شركة البينة — مجموعة خليفة القابضة", nameEn: "Al-Bayyina — Khalifa Holding" },
  { nameAr: "شركة الترسانة — مجموعة خليفة القابضة", nameEn: "Al-Tersana — Khalifa Holding", logo: "/partners/al-tersana.webp" },
  { nameAr: "شركة نيوم مصر", nameEn: "NEOM Egypt", logo: "/partners/neom-egypt.webp", big: true },
  { nameAr: "الشركة الليبية التونسية", nameEn: "Libyan Tunisian Company (LTC)", logo: "/partners/ltc.webp" },
  { nameAr: "شركة B3 جروب", nameEn: "B3 Group", logo: "/partners/b3-group.webp" },
  { nameAr: "شركة ديزاين — مجموعة خليفة القابضة", nameEn: "Design — Khalifa Holding", logo: "/partners/design.webp" },
  { nameAr: "شركة ناس — مجموعة خليفة القابضة", nameEn: "NAS — Khalifa Holding" },
  { nameAr: "شركة أهل الثقة — مجموعة الرائدة القابضة", nameEn: "Ahl Al-Thiqa — Al-Raeda Holding", logo: "/partners/ahl-al-thiqa.webp" },
  { nameAr: "شركة جسور العلى — مجموعة الرائدة القابضة", nameEn: "Jusoor Al-Ola — Al-Raeda Holding" },
  { nameAr: "شركة القمم العالية", nameEn: "Al-Qimam Al-Aliya" },
  { nameAr: "شركة الفرات للإنشاءات والمقاولات العامة", nameEn: "Al-Furat Construction & General Contracting", logo: "/partners/al-furat.webp", big: true },
  { nameAr: "شركة مراس للهندسة والإنشاءات", nameEn: "Meraas Engineering & Construction", logo: "/partners/meraas.webp" },
  { nameAr: "مجموعة خليفة القابضة", nameEn: "Khalifa Holding Group", logo: "/partners/khalifa-holding.webp" },
  { nameAr: "شركة TGG التركية", nameEn: "TGG (Turkey)", logo: "/partners/tgg.webp", big: true },
  { nameAr: "شركة CEE المصرية", nameEn: "CEE (Egypt)" },
  { nameAr: "شركة SET Construction", nameEn: "SET Construction", logo: "/partners/set-construction.webp" },
  { nameAr: "شركة Kapasite", nameEn: "Kapasite", logo: "/partners/kapasite.webp", big: true },
  { nameAr: "شركة وادي النيل للمقاولات والاستثمارات العقارية", nameEn: "Wadi El Nile Contracting & Real Estate", logo: "/partners/wadi-al-nil.webp", big: true },
  { nameAr: "شركة الرائدة القابضة", nameEn: "Al-Raeda Holding", logo: "/partners/al-raeda-holding.webp" },
  { nameAr: "شركة الوصيد العقارية", nameEn: "Al-Waseed Real Estate", logo: "/partners/al-waseed.webp" },
  { nameAr: "شركة طائر البجعة", nameEn: "Taer Al-Bajaa" },
  { nameAr: "شركة عبر العالم", nameEn: "Abr Al-Alam", logo: "/partners/abr-al-alam.webp" },
  { nameAr: "شركة الدار البيضاء", nameEn: "Al-Dar Al-Baida", logo: "/partners/al-dar-al-baida.webp" },
  { nameAr: "شركة إطار التعمير القابضة", nameEn: "Etar Al-Tameer Holding", logo: "/partners/itar-al-taamir.webp" },
  { nameAr: "شركة السعداء جروب المصرية", nameEn: "Al-Suadaa Group (Egypt)", logo: "/partners/al-suadaa.webp" },
  { nameAr: "شركة المقاولون العرب", nameEn: "Arab Contractors", logo: "/partners/arab-contractors.webp", big: true },
];
