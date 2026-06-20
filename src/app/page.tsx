import Link from "next/link";
import { getAllPosts } from "@/lib/posts";
import { ArrowRight, Calendar, Tag } from "lucide-react";

export const metadata = {
  title: "George Sung",
  description: "Personal blog of Jou-ching (George) Sung. All views and opinions expressed are my own.",
};

export default function Home() {
  const posts = getAllPosts();

  return (
    <div className="container max-w-4xl mx-auto px-4 py-12 md:py-20">
      {/* Hero Section */}
      <section className="mb-16 md:mb-24">
        <div className="max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground mb-4">
            Hi, I&apos;m George Sung.
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-6">
            Welcome to my blog, it&apos;s about AI :) All views and opinions expressed here are my own.
          </p>
          <div className="flex gap-4">
            <Link
              href="/about"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors"
            >
              More about me <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Blog Posts Section */}
      <section>
        <div className="flex items-baseline justify-between border-b pb-4 mb-8 border-border">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Latest Articles
          </h2>
          <span className="text-sm text-muted-foreground font-medium">
            {posts.length} {posts.length === 1 ? "post" : "posts"}
          </span>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-12 border rounded-lg border-dashed border-border bg-muted/30">
            <p className="text-muted-foreground">No posts found. Start writing in <code className="bg-muted px-1.5 py-0.5 rounded text-sm">content/posts/</code>!</p>
          </div>
        ) : (
          <div className="space-y-12">
            {posts.map((post) => (
              <article key={`${post.category}-${post.slug}`} className="group flex flex-col gap-3">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Calendar size={14} />
                    <time dateTime={post.date}>
                      {new Date(post.date + "T00:00:00").toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </time>
                  </span>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1">
                    <Tag size={14} />
                    <span className="font-medium">{post.displayCategory}</span>
                  </span>
                </div>

                <h3 className="text-2xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
                  <Link href={`/${post.category}/${post.slug}`} className="block">
                    {post.title}
                  </Link>
                </h3>

                {post.excerpt && (
                  <p className="text-muted-foreground text-base leading-relaxed line-clamp-3">
                    {post.excerpt}
                  </p>
                )}

                <div className="mt-1">
                  <Link
                    href={`/${post.category}/${post.slug}`}
                    className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
                  >
                    Read article <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
