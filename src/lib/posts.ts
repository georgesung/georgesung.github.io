import fs from "fs";
import path from "path";
import matter from "gray-matter";

export interface Post {
  title: string;
  date: string;
  slug: string;
  category: string;
  displayCategory: string;
  excerpt: string;
  content: string;
}

const postsDirectory = path.join(process.cwd(), "content/posts");

export function getAllPosts(): Post[] {
  if (!fs.existsSync(postsDirectory)) {
    return [];
  }

  const fileNames = fs.readdirSync(postsDirectory);
  const allPostsData = fileNames
    .filter((fileName) => fileName.endsWith(".md"))
    .map((fileName) => {
      // Filename format: YYYY-MM-DD-slug.md
      const match = fileName.match(/^(\d{4}-\d{2}-\d{2})-(.+)\.md$/);
      const fileDate = match ? match[1] : "";
      const fileSlug = match ? match[2] : fileName.replace(/\.md$/, "");

      const fullPath = path.join(postsDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, "utf8");

      // Use gray-matter to parse the post metadata section
      const { data, content } = matter(fileContents);

      const displayCategory = data.categories || data.category || "General";
      const category = typeof displayCategory === "string" ? displayCategory.toLowerCase() : "general";

      // Use date from front-matter if available (formatted as YYYY-MM-DD), otherwise fallback to filename date
      let postDate = fileDate;
      if (data.date) {
        const dateObj = typeof data.date === "string" ? new Date(data.date) : data.date;
        if (dateObj instanceof Date && !isNaN(dateObj.getTime())) {
          postDate = dateObj.toISOString().split("T")[0];
        } else if (typeof data.date === "string") {
          const dateMatch = data.date.match(/^\d{4}-\d{2}-\d{2}/);
          if (dateMatch) {
            postDate = dateMatch[0];
          }
        }
      }

      // Generate excerpt: look for TLDR first, or just strip some markdown/html
      let excerpt = "";
      if (content) {
        // Try to find a TLDR section
        const tldrMatch = content.match(/##\s+TLDR\s*\n+([\s\S]*?)(?=\n##|$)/i);
        if (tldrMatch) {
          excerpt = tldrMatch[1].trim();
        } else {
          // Fallback: take the first non-empty paragraph (and strip simple markdown links/formatting/images)
          const paragraphs = content
            .split(/\n\s*\n+/)
            .map(p => p.trim())
            .filter(p => p.length > 0 && !p.startsWith("#") && !p.startsWith("!") && !p.startsWith("["));
          
          if (paragraphs.length > 0) {
            excerpt = paragraphs[0];
          }
        }
        
        // Clean excerpt: limit length and clean up markdown syntax slightly
        excerpt = excerpt
          .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // replace [text](url) with text
          .replace(/[*_`]/g, "") // remove bold/italic/code marks
          .substring(0, 280);
        if (excerpt.length >= 280) {
          excerpt = excerpt.trim() + "...";
        }
      }

      return {
        title: data.title || "Untitled",
        date: postDate,
        slug: fileSlug,
        category,
        displayCategory: typeof displayCategory === "string" ? displayCategory : "General",
        excerpt,
        content,
      };
    });

  // Sort posts by date descending
  return allPostsData.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getPostBySlug(category: string, slug: string): Post | null {
  const posts = getAllPosts();
  const post = posts.find(
    (p) => p.slug === slug && p.category === category.toLowerCase()
  );
  return post || null;
}
