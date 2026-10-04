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
      ["كلية القانون — شركة الرصيد العقارية", "Faculty of Law — Al-Raseed Real Estate"],
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
  { titleAr: "مشروع مستشفى الأطفال والولادة", titleEn: "Children's & Maternity Hospital", group: "major", parties: [["الشركة التونسية الليبية", "Tunisian-Libyan Company"]] },
  { titleAr: "مشروع ميناء بنغازي الجديد", titleEn: "New Benghazi Port Project", group: "major", parties: [["SET Construction", "SET Construction"]] },
  { titleAr: "مشروع جامعة العرب", titleEn: "Arab University Project", group: "major", parties: [["شركة اكانيميا", "Akanimia"]] },
  { titleAr: "مشروع صيانة المصرف المركزي", titleEn: "Central Bank Maintenance Project", group: "major", parties: [] },
  { titleAr: "مشروع مجمع اللوتس", titleEn: "Lotus Complex Project", group: "major", parties: [["شركة B3 جروب", "B3 Group"]] },
  { titleAr: "محطات المعالجة — درنة", titleEn: "Treatment Plants — Derna", group: "major", parties: [["شركة CEE المصرية", "CEE (Egypt)"]] },
  { titleAr: "إعمار درنة بعد الفيضان", titleEn: "Derna Reconstruction after the Flood", group: "major", parties: [] },
  { titleAr: "توريدات عامة لعدة مشاريع", titleEn: "General supplies for multiple projects", group: "supply", parties: [["مجموعة خليفة القابضة", "Khalifa Holding Group"]] },
  { titleAr: "توريدات عامة لعدة مشاريع", titleEn: "General supplies for multiple projects", group: "supply", parties: [["شركة الرائدة القابضة", "Al-Raeda Holding"]] },
  { titleAr: "توريدات عامة لعدة مشاريع", titleEn: "General supplies for multiple projects", group: "supply", parties: [["شركة ميراس", "Miras Company"]] },
  { titleAr: "توريدات عامة لمشاريع الجنوب", titleEn: "General supplies for southern projects", group: "supply", parties: [] },
];

export type Partner = { nameAr: string; nameEn: string; logo?: string };

// Final approved partners list. Add `logo: "/partners/<file>"` as each logo arrives —
// cards without a logo show the company name instead.
export const PARTNERS: Partner[] = [
  { nameAr: "شركة بن غاطي الإماراتية", nameEn: "Binghatti (UAE)" },
  { nameAr: "شركة اكانيميا", nameEn: "Akanimia" },
  { nameAr: "شركة البينة — مجموعة خليفة القابضة", nameEn: "Al-Bayyina — Khalifa Holding" },
  { nameAr: "شركة الترسانة — مجموعة خليفة القابضة", nameEn: "Al-Tersana — Khalifa Holding" },
  { nameAr: "شركة نيوم مصر", nameEn: "NEOM Egypt" },
  { nameAr: "الشركة التونسية الليبية", nameEn: "Tunisian-Libyan Company" },
  { nameAr: "شركة B3 جروب", nameEn: "B3 Group" },
  { nameAr: "شركة ديزاين — مجموعة خليفة القابضة", nameEn: "Design — Khalifa Holding" },
  { nameAr: "شركة ناس — مجموعة خليفة القابضة", nameEn: "NAS — Khalifa Holding" },
  { nameAr: "شركة أهل الثقة — مجموعة الرائدة القابضة", nameEn: "Ahl Al-Thiqa — Al-Raeda Holding" },
  { nameAr: "شركة جسور العليا — مجموعة الرائدة القابضة", nameEn: "Jusoor Al-Ulya — Al-Raeda Holding" },
  { nameAr: "شركة القمم العالية", nameEn: "Al-Qimam Al-Aliya" },
  { nameAr: "شركة الفرات للمقاولات العامة", nameEn: "Al-Furat General Contracting" },
  { nameAr: "شركة ميراس للاستشارات", nameEn: "Miras Consulting" },
  { nameAr: "مجموعة خليفة القابضة", nameEn: "Khalifa Holding Group" },
  { nameAr: "شركة TGG التركية", nameEn: "TGG (Turkey)" },
  { nameAr: "شركة CEE المصرية", nameEn: "CEE (Egypt)" },
  { nameAr: "شركة SET Construction", nameEn: "SET Construction" },
  { nameAr: "شركة Kapasite", nameEn: "Kapasite" },
  { nameAr: "شركة وادي النيل", nameEn: "Wadi Al-Nil" },
  { nameAr: "شركة الرائدة القابضة", nameEn: "Al-Raeda Holding" },
  { nameAr: "شركة الرصيد العقارية", nameEn: "Al-Raseed Real Estate" },
  { nameAr: "شركة طائر البجعة", nameEn: "Taer Al-Bajaa" },
  { nameAr: "شركة عبر العالم", nameEn: "Abr Al-Alam" },
  { nameAr: "شركة الدار البيضاء", nameEn: "Al-Dar Al-Baida" },
  { nameAr: "شركة إطار التعمير", nameEn: "Itar Al-Taamir" },
  { nameAr: "شركة السعداء جروب المصرية", nameEn: "Al-Suadaa Group (Egypt)" },
  { nameAr: "شركة المقاولون العرب", nameEn: "Arab Contractors" },
];
