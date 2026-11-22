import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "المشاريع المنفذة",
  alternates: { canonical: "/projects" },
  description: "مشاريع نفخر بالمساهمة فيها عبر توريد مواد البناء والحلول الإنشائية في ليبيا — جامعات، مستشفيات، كباري، أبراج، ومحطات معالجة.",
  keywords: ["مشاريع الشعلة الرائدة", "مشاريع البناء ليبيا", "بنغازي", "توريد مواد البناء", "completed projects Libya"],
};

export default function ProjectsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
