import { getAllPosts, getPostBySlug } from "@/lib/posts";
import { notFound } from "next/navigation";
import { Marked } from "marked";
import { createHighlighter } from "shiki";
import Link from "next/link";

interface PageProps {
  params: Promise<{
    category: string;
    slug: string;
  }>;
}

let highlighterInstance: Awaited<ReturnType<typeof createHighlighter>> | null = null;

async function getHighlighter() {
  if (!highlighterInstance) {
    highlighterInstance = await createHighlighter({
      themes: ["github-dark", "github-light"],
      langs: ["python", "bash", "json", "yaml", "markdown", "plaintext", "html", "xml"],
    });
  }
  return highlighterInstance;
}

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({
    category: post.category,
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: PageProps) {
  const { category, slug } = await params;
  const post = getPostBySlug(category, slug);
  
  if (!post) {
    return {
      title: "Post Not Found | George Sung",
    };
  }

  return {
    title: `${post.title} | George Sung`,
    description: post.excerpt,
  };
}

export default async function PostPage({ params }: PageProps) {
  const { category, slug } = await params;
  const post = getPostBySlug(category, slug);

  if (!post) {
    notFound();
  }

  // Parse markdown to HTML using Shiki highlighter
  const highlighter = await getHighlighter();
  const markedInstance = new Marked();

  markedInstance.use({
    renderer: {
      code(token: { text: string; lang?: string; escaped?: boolean }) {
        const language = token.lang || "plaintext";
        const supportedLangs = ["python", "bash", "json", "yaml", "markdown", "plaintext", "html", "xml"];
        const finalLang = supportedLangs.includes(language) ? language : "plaintext";

        return highlighter.codeToHtml(token.text, {
          lang: finalLang,
          themes: {
            light: "github-light",
            dark: "github-dark",
          },
          defaultColor: "light",
        });
      },
      link(token: { href: string; title?: string | null; text: string }) {
        const isExternal = /^https?:\/\//.test(token.href) || token.href.startsWith("//");
        const target = isExternal ? ' target="_blank" rel="noopener noreferrer"' : '';
        const titleAttr = token.title ? ` title="${token.title}"` : '';
        return `<a href="${token.href}"${titleAttr}${target}>${token.text}</a>`;
      },
    },
  });

  const htmlContent = await markedInstance.parse(post.content);

  return (
    <article className="container max-w-4xl mx-auto px-4 py-12 md:py-16">
      <div className="mb-8">
        <Link 
          href="/" 
          className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
        >
          ← Back to home
        </Link>
      </div>

      <header className="mb-8 border-b pb-8 border-border">
        <div className="flex items-center gap-3 text-sm text-muted-foreground mb-3">
          <time dateTime={post.date}>
            {new Date(post.date + "T00:00:00").toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </time>
          <span>•</span>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-secondary text-secondary-foreground">
            {post.displayCategory}
          </span>
        </div>
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground leading-tight">
          {post.title}
        </h1>
      </header>

      <div 
        className="prose max-w-none dark:prose-invert"
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />
    </article>
  );
}
