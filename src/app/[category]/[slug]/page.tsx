import { getAllPosts, getPostBySlug } from "@/lib/posts";
import { notFound } from "next/navigation";
import { Marked } from "marked";
import { createHighlighter } from "shiki";
import { createSlugger, extractToc } from "@/lib/headings";
import { TableOfContents } from "@/components/TableOfContents";
import { TableOfContentsDetails } from "@/components/TableOfContentsDetails";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface PageProps {
  params: Promise<{
    category: string;
    slug: string;
  }>;
}

/**
 * Lucide "link" icon, inlined as a string because post HTML is built as markup
 * rather than JSX. Matches the icons in src/components/icons.tsx.
 */
const HEADING_ANCHOR_ICON =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" ' +
  // Without intrinsic dimensions an SVG expands to fill its container, so keep
  // it sane even if the stylesheet hasn't applied yet. CSS overrides these.
  'width="1em" height="1em" fill="none" ' +
  'stroke="currentColor" stroke-width="2" stroke-linecap="round" ' +
  'stroke-linejoin="round" aria-hidden="true" focusable="false">' +
  '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>' +
  '<path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>' +
  "</svg>";

/** Heading text goes into an attribute, and headings contain & and " freely. */
function escapeAttribute(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
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

  // marked emits no heading ids of its own; generate them so sections are
  // linkable and the table of contents has something to point at.
  const slugFor = createSlugger();

  markedInstance.use({
    renderer: {
      heading(token) {
        const id = slugFor(token.text);
        const anchor =
          `<a class="heading-anchor" href="#${id}" aria-label="Link to section: ` +
          `${escapeAttribute(token.text)}">${HEADING_ANCHOR_ICON}</a>`;
        return `<h${token.depth} id="${id}">${this.parser.parseInline(token.tokens)}${anchor}</h${token.depth}>\n`;
      },
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

  // Not worth the furniture on a post with barely any structure.
  const toc = extractToc(post.content);
  const showToc = toc.length >= 3;

  return (
    <div
      className={cn(
        "mx-auto flex w-full max-w-4xl",
        // Only widen when there is actually a rail to make room for, so posts
        // without one stay centered like the rest of the site.
        showToc && "toc:max-w-[72rem]",
      )}
    >
      <article className="min-w-0 flex-1 px-4 py-12 md:py-16">
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

        {showToc && <TableOfContentsDetails toc={toc} />}

        <div 
          className="prose max-w-none dark:prose-invert"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
      </article>

      {showToc && (
        // data-post-toc is the hook the header/footer widening in globals.css
        // keys off; see the .site-frame rule there.
        <div
          data-post-toc
          className="ml-8 hidden w-56 shrink-0 py-12 toc:block md:py-16"
        >
          <TableOfContents toc={toc} />
        </div>
      )}
    </div>
  );
}
