import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://alshowla.com";
  // Public, indexable pages only. Login / cart / chat and other transactional or
  // authenticated routes are intentionally excluded from the sitemap.
  const pages = [
    "", "/products", "/certificates", "/sample", "/faq", "/blog",
    "/calculator", "/careers",
  ];
  return pages.map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : 0.8,
  }));
}
