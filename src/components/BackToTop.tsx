"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Floating "back to top" button for posts. Some of these run tens of thousands
 * of pixels tall, where scrolling back by hand is genuinely tedious.
 */
export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let frame = 0;

    const update = () => {
      frame = 0;
      // Appear once the first screenful is behind you. Before that the top of
      // the page is a short flick away and the button is just clutter.
      setVisible(window.scrollY > window.innerHeight);
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
  }, []);

  const scrollToTop = () => {
    // Deliberately no behavior option: that makes this follow the CSS
    // scroll-behavior in globals.css, which is smooth except under
    // prefers-reduced-motion. Passing "smooth" here would override that.
    window.scrollTo({ top: 0 });

    // Drop any #section still in the URL, so reloading doesn't jump straight
    // back down to the place we just scrolled away from.
    if (window.location.hash) {
      history.replaceState(
        null,
        "",
        window.location.pathname + window.location.search,
      );
    }
  };

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Back to top"
      // Hidden but still in the DOM so it can transition, so it also has to be
      // taken out of the tab order and the accessibility tree while invisible.
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
      className={cn(
        "fixed bottom-6 right-6 z-40 rounded-full border border-border",
        "bg-background/80 p-3 text-muted-foreground shadow-sm backdrop-blur-sm",
        "transition-all hover:bg-secondary hover:text-foreground",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        visible ? "opacity-100" : "pointer-events-none translate-y-2 opacity-0",
      )}
    >
      <ArrowUp size={20} />
    </button>
  );
}
