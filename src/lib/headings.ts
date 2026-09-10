/**
 * Heading anchors for rendered post markdown.
 *
 * `marked` stopped emitting heading ids in v8, so we generate them ourselves.
 * Ids are what make section links shareable (/ai/qlora-ift/#what-is-lora) and
 * what a table of contents points at.
 */

import { Marked, type Tokens } from "marked";

/**
 * Turn heading text into a URL fragment. Everything that isn't a letter, digit
 * or space is dropped, which also handles emoji ("Show me the matmuls 👀") and
 * any inline markdown syntax that happens to be in a heading.
 */
export function slugify(text: string): string {
  const slug = text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return slug || "section";
}

/**
 * Slugs have to be unique within a page, and they aren't naturally: the
 * Claude Code tracing post repeats both "Initial setup" and "Start main agent".
 * Returns a function that appends -1, -2, ... to repeats.
 *
 * Callers must feed it every heading in document order. Two passes over the
 * same markdown (rendering the HTML, building the table of contents) each start
 * a fresh slugger and therefore agree on the ids.
 */
export function createSlugger(): (text: string) => string {
  const seen = new Map<string, number>();

  return (text: string) => {
    const base = slugify(text);
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    return count === 0 ? base : `${base}-${count}`;
  };
}

export interface TocEntry {
  id: string;
  /** Heading text as written in the markdown. */
  text: string;
  /** Nesting depth, normalized to 0, 1, 2 — not the raw h-level. */
  level: number;
}

/** Deepest level shown in the table of contents. 0-based, so three levels. */
const MAX_TOC_LEVEL = 2;

/**
 * Build a table of contents from a post's markdown.
 *
 * Lexing rather than scanning for "#" matters: headings inside fenced code
 * blocks aren't headings, and several posts have them.
 */
export function extractToc(markdown: string): TocEntry[] {
  const headings = new Marked()
    .lexer(markdown)
    .filter((token): token is Tokens.Heading => token.type === "heading");

  // Posts use # for their top-level sections, since the title lives in the page
  // layout rather than the markdown, and some skip levels outright — the tennis
  // post goes h1 -> h3 with no h2 in between. Map whichever depths a post
  // actually uses onto consecutive levels so the nesting reads correctly.
  const depths = [...new Set(headings.map((heading) => heading.depth))].sort(
    (a, b) => a - b,
  );

  // Every heading goes through the slugger, including ones the table of
  // contents drops, so its duplicate counters stay in step with the render pass
  // and the two agree on ids.
  const slugFor = createSlugger();

  return headings
    .map((heading) => ({
      id: slugFor(heading.text),
      text: heading.text,
      level: depths.indexOf(heading.depth),
    }))
    .filter((entry) => entry.level <= MAX_TOC_LEVEL);
}
