"use client";

import { useEffect, useState } from "react";
import type { TocEntry } from "@/lib/headings";
import { cn } from "@/lib/utils";

/** How far below the viewport top a heading has to be to count as current. */
const ACTIVE_LINE_PX = 96;

/**
 * The sticky "On this page" rail beside a post, with the current section
 * highlighted as you scroll. Rendered only on screens wide enough to have
 * gutter space for it; narrower screens get TableOfContentsDetails instead.
 */
export function TableOfContents({ toc }: { toc: TocEntry[] }) {
  const [activeId, setActiveId] = useState(toc[0]?.id ?? "");

  // Depend on a primitive so the effect doesn't re-subscribe on every render.
  const headingIds = toc.map((entry) => entry.id).join("\n");

  useEffect(() => {
    const headings = headingIds
      .split("\n")
      .map((id) => document.getElementById(id))
      .filter((element): element is HTMLElement => element !== null);

    if (headings.length === 0) return;

    let frame = 0;

    const update = () => {
      frame = 0;

      // Some sections run longer than the viewport, so "the last heading that
      // has scrolled past the line" is more reliable than asking which heading
      // is currently visible — often none of them is.
      let current = headings[0];
      for (const heading of headings) {
        if (heading.getBoundingClientRect().top > ACTIVE_LINE_PX) break;
        current = heading;
      }

      // Once the page bottoms out no further heading can cross the line, which
      // would strand the highlight mid-post on a short final section.
      const atBottom =
        window.scrollY + window.innerHeight >=
        document.documentElement.scrollHeight - 2;

      setActiveId(atBottom ? headings[headings.length - 1].id : current.id);
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [headingIds]);

  return (
    <nav
      aria-label="Table of contents"
      className="sticky top-20 max-h-[calc(100vh-7rem)] overflow-y-auto"
    >
      <p className="mb-3 text-sm font-semibold text-foreground">On this page</p>
      <ul className="border-l border-border">
        {toc.map((entry) => (
          <li key={entry.id}>
            <a
              href={`#${entry.id}`}
              aria-current={entry.id === activeId ? "location" : undefined}
              style={{ paddingLeft: `${0.75 + entry.level * 0.75}rem` }}
              className={cn(
                "-ml-px line-clamp-2 border-l py-1 pr-2 text-sm leading-snug transition-colors",
                entry.id === activeId
                  ? "border-foreground font-medium text-foreground"
                  : "border-transparent text-muted-foreground hover:border-border hover:text-foreground",
              )}
            >
              {entry.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
