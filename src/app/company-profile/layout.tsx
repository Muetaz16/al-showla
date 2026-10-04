import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "الملف التعريفي | الشعلة الرائدة — Company Profile",
  description: "الملف التعريفي لشركة الشعلة الرائدة لاستيراد مواد البناء: من نحن، مسيرتنا، رؤيتنا ورسالتنا، قيمنا، خدماتنا، شركاؤنا ومشاريعنا.",
};

export default function CompanyProfileLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
