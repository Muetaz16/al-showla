import { getBlogPost } from "@/app/cms-actions";
import { notFound } from "next/navigation";
import BlogPostView from "./BlogPostView";

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getBlogPost(slug);
  if (!post) notFound();

  return <BlogPostView post={post} />;
}
