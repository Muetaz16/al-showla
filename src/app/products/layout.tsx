import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "كتالوج المنتجات | الشعلة الرائدة",
  description: "تصفح كتالوج مواد البناء الشامل: عزل مائي، جبس، أدوات، مستلزمات صحية، حديد، أرضيات. بحث فوري، فلترة بالفئة، مقارنة المنتجات.",
  keywords: ["كتالوج مواد البناء", "سيكا", "كناف", "ديوالت", "عزل مائي", "ألواح جبس", "الشعلة الرائدة"],
};

export default function ProductsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
