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
  { titleAr: "مشروع بنغازي كورال باي", titleEn: "Benghazi Coral Bay Project", group: "major", parties: [["شركة بن غاطي الإماراتية", "Binghatti (UAE)"]] },
  {
    titleAr: "مشروع 20 ألف وحدة سكنية", titleEn: "20,000 Housing Units Project", group: "major",
    parties: [["شركة القمم العالية القابضة", "Al-Qimam Al-Aliya Holding"], ["شركة الفرات للمقاولات", "Al-Furat Contracting"], ["شركة الرائدة القابضة", "Al-Raeda Holding"]],
  },
  { titleAr: "محطة معالجة مياه سلوق", titleEn: "Suluq Water Treatment Plant", group: "major", parties: [["SET Construction", "SET Construction"]] },
  { titleAr: "مشروع مستشفى الأطفال والولادة", titleEn: "Children's & Maternity Hospital", group: "major", parties: [["الشركة الليبية التونسية", "Libyan Tunisian Company (LTC)"]] },
  { titleAr: "مشروع ميناء بنغازي الجديد", titleEn: "New Benghazi Port Project", group: "major", parties: [["SET Construction", "SET Construction"]] },
  { titleAr: "مشروع جامعة العرب", titleEn: "Arab University Project", group: "major", parties: [["شركة اكانيميا", "Ankamena İnşaat"]] },
  { titleAr: "مشروع صيانة مصرف ليبيا المركزي — بنغازي", titleEn: "Central Bank of Libya Maintenance Project — Benghazi", group: "major", parties: [] },
  { titleAr: "مشروع مجمع اللوتس", titleEn: "Lotus Complex Project", group: "major", parties: [["شركة B3 جروب", "B3 Group"]] },
  { titleAr: "محطات المعالجة — درنة", titleEn: "Treatment Plants — Derna", group: "major", parties: [["شركة CEE المصرية", "CEE (Egypt)"]] },
  { titleAr: "إعمار درنة بعد الفيضان", titleEn: "Derna Reconstruction after the Flood", group: "major", parties: [] },
  { titleAr: "توريدات عامة لعدة مشاريع", titleEn: "General supplies for multiple projects", group: "supply", parties: [["مجموعة خليفة القابضة", "Khalifa Holding Group"]] },
  { titleAr: "توريدات عامة لعدة مشاريع", titleEn: "General supplies for multiple projects", group: "supply", parties: [["شركة الرائدة القابضة", "Al-Raeda Holding"]] },
  { titleAr: "توريدات عامة لعدة مشاريع", titleEn: "General supplies for multiple projects", group: "supply", parties: [["شركة مراس", "Meraas"]] },
  { titleAr: "توريدات عامة لمشاريع الجنوب", titleEn: "General supplies for southern projects", group: "supply", parties: [] },
];

export type Partner = { nameAr: string; nameEn: string; logo?: string };

// Final approved partners list. Add `logo: "/partners/n/<file>"` as each logo arrives —
// cards without a logo show the company name instead.
export const PARTNERS: Partner[] = [
  // Order set by the client (4 rows of 7, read right-to-left on the RTL site)
  { nameAr: "شركة بن غاطي الإماراتية", nameEn: "Binghatti (UAE)", logo: "/partners/n/binghatti.webp" },
  { nameAr: "شركة TGG التركية", nameEn: "TGG (Turkey)", logo: "/partners/n/tgg.webp" },
  { nameAr: "مجموعة خليفة القابضة", nameEn: "Khalifa Holding Group", logo: "/partners/n/khalifa-holding.webp" },
  { nameAr: "شركة اكانيميا", nameEn: "Ankamena İnşaat (Turkey)", logo: "/partners/n/ankamena.webp" },
  { nameAr: "شركة السعداء جروب المصرية", nameEn: "Al-Suadaa Group (Egypt)", logo: "/partners/n/al-suadaa.webp" },
  { nameAr: "شركة شيلد إنماء للمقاولات", nameEn: "Shield Enmaa Contracting", logo: "/partners/n/shield-enmaa.webp" },
  { nameAr: "شركة المقاولون العرب", nameEn: "Arab Contractors", logo: "/partners/n/arab-contractors.webp" },
  { nameAr: "شركة مراس للهندسة والإنشاءات", nameEn: "Meraas Engineering & Construction", logo: "/partners/n/meraas.webp" },
  { nameAr: "الشركة الليبية التونسية", nameEn: "Libyan Tunisian Company (LTC)", logo: "/partners/n/ltc.webp" },
  { nameAr: "شركة CEE المصرية", nameEn: "CEE (Egypt)", logo: "/partners/n/ccc.webp" },
  { nameAr: "شركة SET Construction", nameEn: "SET Construction", logo: "/partners/n/set-construction.webp" },
  { nameAr: "شركة Kapasite", nameEn: "Kapasite", logo: "/partners/n/kapasite.webp" },
  { nameAr: "شركة وادي النيل للمقاولات والاستثمارات العقارية", nameEn: "Wadi El Nile Contracting & Real Estate", logo: "/partners/n/wadi-al-nil.webp" },
  { nameAr: "شركة الرائدة القابضة", nameEn: "Al-Raeda Holding", logo: "/partners/n/al-raeda-holding.webp" },
  { nameAr: "شركة الدار البيضاء", nameEn: "Al-Dar Al-Baida", logo: "/partners/n/al-dar-al-baida.webp" },
  { nameAr: "شركة إطار التعمير القابضة", nameEn: "Etar Al-Tameer Holding", logo: "/partners/n/itar-al-taamir.webp" },
  { nameAr: "شركة عبر العالم", nameEn: "Abr Al-Alam", logo: "/partners/n/abr-al-alam.webp" },
  { nameAr: "شركة الفرات للإنشاءات والمقاولات العامة", nameEn: "Al-Furat Construction & General Contracting", logo: "/partners/n/al-furat.webp" },
  { nameAr: "شركة البيّنة للصناعات — مجموعة خليفة القابضة", nameEn: "Al-Baynah Industries — Khalifa Holding", logo: "/partners/n/al-baynah.webp" },
  { nameAr: "شركة الترسانة — مجموعة خليفة القابضة", nameEn: "Al-Tersana — Khalifa Holding", logo: "/partners/n/al-tersana.webp" },
  { nameAr: "شركة نيوم مصر", nameEn: "NEOM Egypt", logo: "/partners/n/neom-egypt.webp" },
  { nameAr: "شركة طائر البجعة", nameEn: "Taer Al-Bajaa", logo: "/partners/n/taer-al-bajaa.webp" },
  { nameAr: "شركة ديزاين — مجموعة خليفة القابضة", nameEn: "Design — Khalifa Holding", logo: "/partners/n/design.webp" },
  { nameAr: "شركة ناس — مجموعة خليفة القابضة", nameEn: "NAS National Architectural Studio — Khalifa Holding", logo: "/partners/n/nas.webp" },
  { nameAr: "شركة B3 جروب", nameEn: "B3 Group", logo: "/partners/n/b3-group.webp" },
  { nameAr: "شركة جسور العلا — مجموعة الرائدة القابضة", nameEn: "Jusoor Al-Ola — Al-Raeda Holding", logo: "/partners/n/jusoor-al-ola.webp" },
  { nameAr: "شركة القمم العالية القابضة", nameEn: "Al-Qimam Al-Aliya Holding", logo: "/partners/n/al-qimam-al-aliya.webp" },
  { nameAr: "شركة الوصيد العقارية", nameEn: "Al-Waseed Real Estate", logo: "/partners/n/al-waseed.webp" },
];

export const LINKEDIN_URL = "https://www.linkedin.com/company/alshowla-alraeda/";

export type Department = { nameAr: string; nameEn: string; phone: string; email: string };

// Main department contacts (provided by the client). Phones are local Libyan numbers.
export const DEPARTMENTS: Department[] = [
  { nameAr: "رئيس مجلس الإدارة", nameEn: "Chairman of the Board", phone: "0915008600", email: "ceo@alshowla.com" },
  { nameAr: "الإدارة المالية", nameEn: "Finance", phone: "0927630846", email: "acct@alshowla.com" },
  { nameAr: "إدارة المشتريات", nameEn: "Procurement", phone: "0925200060", email: "ops@alshowla.com" },
  { nameAr: "إدارة المبيعات", nameEn: "Sales", phone: "0948020200", email: "sales@alshowla.com" },
  { nameAr: "إدارة التسويق", nameEn: "Marketing", phone: "0927426635", email: "om@alshowla.com" },
];

/** 0915008600 -> { tel: "+218915008600", display: "+218 91 500 8600" } */
export function libyanPhone(local: string) {
  const d = local.replace(/\D/g, "").replace(/^0/, "");
  return { tel: "+218" + d, display: `+218 ${d.slice(0, 2)} ${d.slice(2, 5)} ${d.slice(5)}` };
}
