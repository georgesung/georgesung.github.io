import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/posts";

const SITE_URL = "https://www.georgesung.com";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts();

  return [
    { url: `${SITE_URL}/`, priority: 1 },
    { url: `${SITE_URL}/about/`, priority: 0.5 },
    ...posts.map((post) => ({
      // Trailing slash to match the site's permalink shape (/:category/:slug/)
      url: `${SITE_URL}/${post.category}/${post.slug}/`,
      lastModified: new Date(`${post.date}T00:00:00Z`),
      priority: 0.8,
    })),
  ];
}
