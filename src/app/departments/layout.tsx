import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "الهيكل التنظيمي | الشعلة الرائدة",
  description: "الهيكل التنظيمي لشركة الشعلة الرائدة لاستيراد مواد البناء وبيانات التواصل مع كل إدارة: رئيس مجلس الإدارة، المالية، المشتريات، المبيعات، والتسويق.",
};

export default function DepartmentsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
