"use client";

import { useEffect, useState } from "react";
import { getBlogPosts } from "@/app/cms-actions";
import Link from "next/link";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";

type Lang = "ar" | "en";

export default function BlogPage() {
  const [lang, setLang] = useState<Lang>("ar");
  const [posts, setPosts] = useState<any[]>([]);

  useEffect(() => { getBlogPosts().then(setPosts); }, []);

  const dir = lang === "ar" ? "rtl" : "ltr";

  return (
    <div dir={dir} style={{ minHeight: "100vh", background: "#f7f9fc", fontFamily: "'Cairo', sans-serif" }}>
      <SiteHeader lang={lang} onToggleLang={() => setLang(l => l === "ar" ? "en" : "ar")} />
      <div style={{ maxWidth: 800, margin: "40px auto", padding: "0 5%" }}>
        <h1 style={{ fontSize: 28, fontWeight: 900, color: "#0f1c2e", marginBottom: 8 }}>{lang === "ar" ? "المدونة" : "Blog"}</h1>
        <p style={{ color: "#64748b", marginBottom: 32 }}>{lang === "ar" ? "نصائح وأخبار مواد البناء" : "Building materials tips and news"}</p>
        <div style={{ display: "grid", gap: 20 }}>
          {posts.filter(p => p.published !== false).map(post => (
            <Link key={post.id} href={`/blog/${post.slug}`} style={{ background: "#fff", borderRadius: 16, padding: 24, textDecoration: "none", color: "inherit", boxShadow: "0 4px 20px rgba(0,0,0,.05)", display: "block" }}>
              <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 8 }}>{post.date}</div>
              <h2 style={{ fontSize: 20, fontWeight: 900, color: "#0051a2", marginBottom: 8 }}>{lang === "ar" ? post.titleAr : post.titleEn}</h2>
              <p style={{ color: "#64748b", fontSize: 14 }}>{lang === "ar" ? post.excerptAr : post.excerptEn}</p>
            </Link>
          ))}
        </div>
      </div>
      <SiteFooter lang={lang} />
    </div>
  );
}
