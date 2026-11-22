import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ميدماك | الشعلة الرائدة",
  alternates: { canonical: "/midmak" },
};

export default function MidmakLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
