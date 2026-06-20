# Next.js & shadcn/ui Blog Migration Plan

This document captures the context, research, and step-by-step roadmap for migrating the legacy Jekyll blog to the newly scaffolded Next.js (v16) + React (v19) setup. Use this to pick up and execute the migration in the next session.

---

## 1. Current Workspace Context
* **Current Stack**: 
  * Next.js: `16.2.9`
  * React: `19.2.4`
  * Tailwind CSS: `^4` (configured in `src/app/globals.css` with `@import "tailwindcss";`)
  * UI Library: `shadcn-ui` (fully initialized, custom styles in `src/app/globals.css`)
* **Legacy Jekyll State**:
  * Deleted from root, currently backed up under `_legacy_jekyll/` (tracked in Git but modified/deleted in root).
  * **Core content to migrate**:
    * **4 Blog Posts**: Located in `_legacy_jekyll/_posts/`
      * `2023-04-22-autogpt-arch.md` (Category: `AI`)
      * `2023-05-06-llm-qa-eval-wikipedia.md` (Category: `AI`)
      * `2023-07-02-qlora-ift.md` (Category: `AI`)
      * `2026-01-26-tracing-claude-codes-llm-traffic.md` (Category: `AI`)
    * **About page**: Located in `_legacy_jekyll/about.markdown`
    * **Assets**: Blog diagrams, images, and profile photos in `_legacy_jekyll/assets/img/`
    * **Metadata**: Personal info, email, GitHub/Twitter handles, title in `_legacy_jekyll/_config.yml`
    * **CNAME**: Contains the custom domain for GitHub Pages.

---

## 2. Research & Architecture Decisions

### Why the Previous Session Got Stuck
* The previous agent proposed **Contentlayer**. This package is **unmaintained** and has severe incompatibilities with **React 19 / Next.js 16**.
* Trying to force peer dependency resolution for Contentlayer on this stack leads to build-time or runtime bundler crashes.

### The Robust, Zero-Magic Solution
Rather than relying on unmaintained build-time schema wrappers, we will build a **lightweight, compile-time Markdown parser** using pure-JS libraries:
1. **`gray-matter`**: Parses the front-matter of Markdown posts (title, layout, categories, date).
2. **`marked`**: Parses the Markdown content into standard HTML at compile/build time.
3. This approach is framework-agnostic, has 0 risk of breaking during Next.js updates, and is extremely fast.

### Routing & URL Structure Preservation (Critical for SEO)
* Jekyll's permalinks are defined as: `/:categories/:title/` (e.g. `/ai/autogpt-arch/`).
* In Next.js, we will replicate this exact URL structure using dynamic route parameters: `src/app/[category]/[slug]/page.tsx`.
* This will ensure all incoming links and previous SEO indices remain fully functional with zero broken links!

---

## 3. Step-by-Step Migration Roadmap

### Phase 1: File Setup & Assets
1. **Create Posts Directory**: Create `content/posts/` in the root of the repository.
2. **Copy Markdown Posts**: Move the 4 files from `_legacy_jekyll/_posts/` into `content/posts/`.
3. **Move Asset Images**: Copy the contents of `_legacy_jekyll/assets/img/` to `public/assets/img/` so that existing blog image references (e.g., `![diagram](/assets/img/auto_gpt.svg)`) continue to work seamlessly.
4. **Custom Domain**: Copy `_legacy_jekyll/CNAME` to `public/CNAME` to keep the custom domain setup.

### Phase 2: Dependencies Installation
Run the following command to install the required pure-JS parsers:
```bash
npm install gray-matter marked
npm install -D @types/marked
```

### Phase 3: The Content Loader (`src/lib/posts.ts`)
Create a helper utility to read and parse the markdown files. It should:
1. Scan `content/posts/` using Node's `fs` and `path`.
2. Extract the slug and date from the filename (e.g., `2023-04-22-autogpt-arch.md` -> Date: `2023-04-22`, Slug: `autogpt-arch`).
3. Use `gray-matter` to parse metadata.
4. Provide standard functions:
   * `getAllPosts()`: Returns sorted list of post summaries (title, date, slug, category, excerpt).
   * `getPostBySlug(category, slug)`: Returns full parsed post metadata + raw content.

### Phase 4: Build Page Views
1. **Post Page (`src/app/[category]/[slug]/page.tsx`)**:
   * Uses `getPostBySlug(category, slug)` to retrieve the post.
   * Parses Markdown content to HTML using `marked`.
   * Integrates a clean styling system for prose (either custom styles in `globals.css` or the `@tailwindcss/typography` plugin).
   * Defines `generateStaticParams()` to pre-render all posts statically at build time.
2. **About Page (`src/app/about/page.tsx`)**:
   * Port the markdown content from `_legacy_jekyll/about.markdown` to a beautifully styled React component.
   * Incorporate your profile photo (`/assets/img/profile_photo.png`), bio, and link buttons to LinkedIn, GitHub, and HuggingFace.
3. **Homepage (`src/app/page.tsx`)**:
   * Build a beautiful minimalist hero section with a bio.
   * Dynamically fetch and display all posts using `getAllPosts()`, sorted chronologically.
   * Display metadata (date, category tag) alongside post titles.

### Phase 5: Header, Footer, and Theme (`src/app/layout.tsx`)
* Wrap the app layout with a responsive navigation header (Home, About, Github, LinkedIn) and a clean footer.
* Set up a Toggle/Mode Switch for Light/Dark themes using shadcn/ui patterns or custom variables.

### Phase 6: Verification
* Run `npm run build` to verify there are no TypeScript compile-time errors or Next.js static rendering failures.
