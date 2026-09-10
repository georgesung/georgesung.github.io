# AGENTS.md

Orientation for coding agents working in this repo. Human-facing docs (how to write a post, how to
edit the About page) live in [README.md](README.md) — this file covers constraints, gotchas, and
conventions that aren't obvious from reading the code.

## What this is

George Sung's personal blog at **www.georgesung.com**. A Next.js 16 / React 19 / Tailwind v4 site
that is statically exported (`output: "export"`) and served by GitHub Pages. No server, no database,
no CMS — posts are markdown files on disk, rendered to HTML at build time.

It replaced a Jekyll blog in 2026. The old site is archived, unused, in `_legacy_jekyll/`.

## Commands

```bash
npm install       # deps
npm run dev       # dev server on :3000, hot reload
npm run build     # static export -> out/
npm run lint      # eslint
```

There is no test suite. `npm run build` is the check that matters: it type-checks, renders every
post, and fails on broken markdown or bad config. Run it before claiming a change works.

`npm run start` is in package.json but is not meaningful for a static export — serve `out/` instead.

`.claude/launch.json` defines a `dev` configuration, so an agent with browser tooling can start the
dev server by name and drive a real browser against it (screenshots, clicking, reading the console
and network, running JS in the page). Prefer that over launching `npm run dev` as a bare background
process — it reuses an already-running server and can be stopped cleanly.

Caveat: the dev server is **not** a faithful stand-in for production here. This site is a static
export served by GitHub Pages, and URL-shape bugs (see below) do not reproduce under `next dev`.
For anything routing-related, build and inspect `out/`.

## Layout

| Path | What |
|---|---|
| `content/posts/*.md` | All blog posts. Source of truth for content. |
| `src/lib/posts.ts` | Content loader: reads the markdown, parses front matter, derives slug/date/category, builds excerpts. |
| `src/app/[category]/[slug]/page.tsx` | The only post route. Renders markdown via `marked` + `shiki`, pre-rendered by `generateStaticParams()`. |
| `src/app/page.tsx` | Homepage — hero + reverse-chronological post list. |
| `src/app/about/page.tsx` | About page. Bio and job history are hardcoded JSX, not markdown. |
| `src/app/sitemap.ts` | Generates `sitemap.xml`. Add new static routes here. |
| `src/app/globals.css` | Tailwind v4 theme + the `.prose` classes that style rendered post HTML. |
| `public/` | Static assets. `CNAME` sets the custom domain; `assets/img/<post-slug>/` holds post images. |
| `_legacy_jekyll/` | **Archive. Do not edit or build.** Kept for reference only. |

`out/`, `.next/`, `node_modules/`, and `gsung_stash/` are gitignored — never commit them.

## Hard constraint: don't break the URL shape

URLs must stay **`/<category>/<slug>/` with a trailing slash**. This is not cosmetic.

The Jekyll site used `permalink: /:categories/:title/`, so every URL Google indexed and every link
shared before 2026 has a trailing slash. When the Next export briefly dropped it (writing
`out/ai/foo.html` instead of `out/ai/foo/index.html`), **every legacy inbound link 404'd** — visible
as a spike of 404s in Google Analytics.

What keeps this working:

- `trailingSlash: true` in [next.config.ts](next.config.ts). **Do not remove it.**
- A correct build produces `out/<category>/<slug>/index.html` — never `out/<category>/<slug>.html`.

After any routing or config change, verify:

```bash
npm run build && find out -name '*.html' | sort
```

Every post must appear as `.../index.html` inside its own directory.

A post's category comes from the `categories:` front-matter field, lowercased. **Changing
`categories:` on an existing post changes its URL and breaks inbound links** — treat it as a
breaking change, not an edit.

## Posts

Filename must be `YYYY-MM-DD-slug.md`; the slug half becomes the URL slug. Front matter:

```yaml
---
layout: post          # vestigial, from Jekyll; harmless
title: "Post title"
date: 2026-08-17
categories: AI        # -> /ai/<slug>/
---
```

The homepage excerpt is auto-derived by `src/lib/posts.ts`: it uses the `# TLDR` section if present,
otherwise the first non-heading paragraph, truncated to 280 chars. Every current post opens with a
`# TLDR` — keep that convention, it's what makes the homepage readable.

Images go in `public/assets/img/<post-slug>/` and are referenced as `/assets/img/<post-slug>/x.png`.
Posts mix markdown (`![alt](/path)`) and raw HTML `<img>` tags — the latter when width control is
needed. Both work.

## Gotchas

**Syntax highlighting has a language allowlist.** `src/app/[category]/[slug]/page.tsx` registers
only `python, bash, json, yaml, markdown, plaintext, html, xml` with Shiki. Any other language in a
code fence **silently falls back to plaintext** — no error, no warning, just unstyled code. Adding a
` ```ts ` or ` ```rust ` block means adding that language to the list (in two places in that file:
the `createHighlighter` langs array and the `supportedLangs` check).

**Post markdown is rendered with `dangerouslySetInnerHTML`.** That's fine for first-party content,
but it means any HTML in a post is live. Don't pipe untrusted content through this path.

**Dark mode is set by a blocking inline script** in `src/app/layout.tsx`, before paint, reading
`localStorage`. It's deliberate — it prevents a theme flash. Don't "clean it up" into a React effect.

**Image paths are root-relative**, which is correct for the site but breaks anywhere content is
consumed off-site. If you ever render post content outside the site, rewrite `src="/..."` to absolute
URLs first.

## Deploy

Push to `master` → `.github/workflows/nextjs.yml` builds and publishes to GitHub Pages. Typical run
is ~1 minute (build is ~8s; the rest is setup and the Pages deploy step).

**Known unresolved issue:** the workflow passes `static_site_generator: next` to
`actions/configure-pages`, which injects its own Next.js config. This appears to override
`next.config.ts` — a build that produces correct trailing-slash output locally produced flat
`about.html`-style output in CI. If the live site is serving `/about.html` rather than
`/about/index.html`, this is why. Suspected fix is dropping `static_site_generator: next` (this is a
user site at a domain root, so the `basePath` injection it provides is unnecessary), but that has
not been verified yet.

To check what's actually live:

```bash
curl -s -o /dev/null -w "%{http_code}\n" "https://www.georgesung.com/ai/autogpt-arch/"
```

`200` = trailing-slash URLs are working. `404` = the CI config problem above is still in effect.

## Conventions

- **Never add `Co-Authored-By: Claude` or similar AI-attribution trailers to commits or PRs.**
- Commit messages: short imperative subject, then a body explaining *why* when the reason isn't
  obvious from the diff.
- Match the surrounding code style. It's plain, dependency-light, and deliberately un-clever —
  keep it that way rather than introducing abstractions for their own sake.
- Don't add dependencies without a clear need; the whole content pipeline is ~100 lines on top of
  `gray-matter`, `marked`, and `shiki`.
