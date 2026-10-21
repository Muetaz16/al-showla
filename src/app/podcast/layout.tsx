import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "بودكاست ميدماك | الشعلة الرائدة",
  description: "ميدماك — بودكاست الشعلة الرائدة: حوارات حول قطاع البناء ومواد البناء والحلول الإنشائية في ليبيا.",
};

export default function PodcastLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
