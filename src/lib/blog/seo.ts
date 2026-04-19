import type { Metadata } from "next";

const PUBLIC_SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

interface SEOData {
  title: string;
  description: string;
  slug: string;
  meta?: {
    title?: string | null;
    description?: string | null;
    image?: { url?: string | null } | string | number | null;
  };
}

export function generateSEOMetadata(post: SEOData): Metadata {
  const title = post.meta?.title || `${post.title || "Blog Post"} | Blog`;
  const description = post.meta?.description || post.description || "";

  let imageUrl: string | undefined;
  if (post.meta?.image && typeof post.meta.image === "object" && "url" in post.meta.image) {
    imageUrl = post.meta.image.url || undefined;
  }

  const postUrl = `${PUBLIC_SITE_URL}/blog/${post.slug || ""}`;

  return {
    title,
    description,
    alternates: { canonical: postUrl },
    openGraph: {
      title,
      description,
      type: "article",
      url: postUrl,
      ...(imageUrl && {
        images: [{ url: imageUrl, width: 1200, height: 630, alt: title }],
      }),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(imageUrl && { images: [imageUrl] }),
    },
  };
}

export function generateBlogListMetadata(): Metadata {
  const title = "Blog";
  const description = "Artículos e insights sobre tecnología, IA y productividad.";
  const blogUrl = `${PUBLIC_SITE_URL}/blog`;

  return {
    title,
    description,
    alternates: { canonical: blogUrl },
    openGraph: { title, description, type: "website", url: blogUrl },
    twitter: { card: "summary_large_image", title, description },
  };
}
