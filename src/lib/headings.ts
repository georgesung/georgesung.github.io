/**
 * Heading anchors for rendered post markdown.
 *
 * `marked` stopped emitting heading ids in v8, so we generate them ourselves.
 * Ids are what make section links shareable (/ai/qlora-ift/#what-is-lora) and
 * what a table of contents points at.
 */

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
