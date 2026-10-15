import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "إدارات الشركة والتواصل | الشعلة الرائدة",
  description: "أرقام هواتف وعناوين البريد الإلكتروني لإدارات شركة الشعلة الرائدة لاستيراد مواد البناء: رئيس مجلس الإدارة، المالية، المشتريات، المبيعات، والتسويق.",
};

export default function DepartmentsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
