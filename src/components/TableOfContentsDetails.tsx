import type { TocEntry } from "@/lib/headings";

/**
 * Collapsed table of contents shown above a post on screens too narrow for the
 * sticky rail. Plain <details>, so it costs no JavaScript.
 */
export function TableOfContentsDetails({ toc }: { toc: TocEntry[] }) {
  return (
    <details className="mb-8 rounded-lg border border-border bg-muted/30 px-4 py-3 toc:hidden">
      <summary className="cursor-pointer text-sm font-semibold">
        On this page
      </summary>
      <ul className="mt-3 space-y-1.5">
        {toc.map((entry) => (
          <li key={entry.id} style={{ paddingLeft: `${entry.level}rem` }}>
            <a
              href={`#${entry.id}`}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {entry.text}
            </a>
          </li>
        ))}
      </ul>
    </details>
  );
}
