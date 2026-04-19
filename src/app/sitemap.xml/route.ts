import { NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@payload-config";

const PUBLIC_SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

const staticRoutes = [
  { path: "/", priority: "1.0", changefreq: "weekly" },
  { path: "/blog", priority: "0.8", changefreq: "daily" },
];

export async function GET() {
  const payload = await getPayload({ config });
  const posts = await payload.find({
    collection: "posts",
    where: { status: { equals: "published" } },
    sort: "-publishedDate",
    limit: 1000,
    depth: 0,
  });

  const staticEntries = staticRoutes
    .map(
      (route) => `  <url>
    <loc>${PUBLIC_SITE_URL}${route.path}</loc>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`,
    )
    .join("\n");

  const postEntries = posts.docs
    .map((post) => {
      const lastmod = post.updatedAt
        ? new Date(post.updatedAt).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0];
      return `  <url>
    <loc>${PUBLIC_SITE_URL}/blog/${post.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticEntries}
${postEntries}
</urlset>`;

  return new NextResponse(xml, {
    status: 200,
    headers: { "Content-Type": "application/xml" },
  });
}
