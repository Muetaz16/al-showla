import { getBlogPost } from "@/app/cms-actions";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getBlogPost(slug);
  if (!post) notFound();

  return (
    <div dir="rtl" style={{ minHeight: "100vh", background: "#f7f9fc", fontFamily: "'Cairo', sans-serif" }}>
      <div style={{ background: "#001f4d", padding: "0 5%", height: 60, display: "flex", alignItems: "center" }}>
        <Link href="/blog" style={{ color: "#fff", textDecoration: "none", fontWeight: 700 }}>→ المدونة</Link>
      </div>
      <article style={{ maxWidth: 720, margin: "40px auto", padding: "0 5%" }}>
        <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 12 }}>{post.date}</div>
        <h1 style={{ fontSize: 32, fontWeight: 900, color: "#0f1c2e", marginBottom: 16 }}>{post.titleAr}</h1>
        <p style={{ fontSize: 16, color: "#3d5473", lineHeight: 1.9, whiteSpace: "pre-wrap" }}>{post.bodyAr}</p>
      </article>
    </div>
  );
}
