# georgesung.github.io (Next.js & Tailwind CSS v4 Portfolio Blog)

Welcome to the Next.js port of my personal portfolio and technical blog. This site is built using **Next.js (v16)**, **React (v19)**, **Tailwind CSS (v4)**, and **shadcn/ui**, presenting a sleek, ultra-modern, and blazing-fast minimalist developer experience.

---

## 🛠️ Getting Started (How to Run)

To run, build, or preview the site locally, follow these steps:

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Development Server (with hot reloading)
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your web browser to view and interact with the site. Changes you make to files will immediately auto-reload.

### 3. Build the Optimized Static Site
Next.js statically compiles all pages and pre-renders your blog posts into optimized HTML files.
```bash
npm run build
```

### 4. Start the Local Production Preview
To serve and preview the compiled production build locally (highly recommended to verify exact static page generations):
```bash
npm run start
```

---

## 🏗️ Repository Structure & Architecture

The site transitions from an unmaintained Jekyll build to a lightweight, zero-magic **compile-time Markdown parser** designed to be framework-agnostic and resilient to future updates.

### Key Directories & Files:
* **`content/posts/`**: Holds all markdown articles. This is the source-of-truth directory for your blog posts.
* **`public/`**: Static assets, including CNAME records, standard icons, and blog diagram graphics (`public/assets/img/`).
* **`src/app/`**: Standard App Router directory.
  * **`src/app/page.tsx`**: The minimalist homepage showcasing a clean intro bio and chronological article list.
  * **`src/app/about/page.tsx`**: A beautifully laid-out React component for your personal biography and professional profile links.
  * **`src/app/[category]/[slug]/page.tsx`**: Dynamic route designed to preserve Jekyll's exact URL structures (`/:category/:slug/`), securing SEO rankings and link continuity with static pre-rendering via `generateStaticParams()`.
  * **`src/app/globals.css`**: Tailwind v4 stylesheet containing theme configurations and custom `.prose` utility classes for styling raw HTML translated from Markdown.
* **`src/lib/posts.ts`**: The content loader. It scans `content/posts/`, parses metadata using `gray-matter`, extracts filename slug/dates, and orders articles chronologically.
* **`src/components/ThemeToggle.tsx`**: A FOUC-free (Flash of Unstyled Content) dark/light theme switch utilizing a blocking `<head>` inline script and browser local storage.
* **`_legacy_jekyll/`**: Fully preserved archive of the original Jekyll blog configuration and post files.

---

## ✍️ Writer's & Developer's Guide

### 1. How to Add a New Article
All articles live in `content/posts/`. To write a new post:

1. **Create a markdown file** in `content/posts/`. The filename **must** use the following exact date-and-slug naming format:
   ```bash
   YYYY-MM-DD-your-article-slug.md
   # Example: 2026-06-20-building-agentic-rag.md
   ```
2. **Add the YAML front-matter** metadata block at the very top of the file:
   ```yaml
   ---
   layout: post
   title: "Building Agentic RAG: Practical Patterns"
   date: 2026-06-20 12:00:00 +0000
   categories: AI
   ---
   ```
   * *Note*: The `categories` property will determine its URL directory slug (e.g., `/ai/building-agentic-rag/`). Keep it simple and alphanumeric.

3. **Incorporate diagrams/images**:
   * Drop any image files in `public/assets/img/`.
   * Reference them in your Markdown file using a relative public path:
     ```markdown
     ![Diagram Description](/assets/img/your-diagram.svg)
     ```

### 2. How to Edit an Article
* Simply open and modify any Markdown file in `content/posts/`.
* **Excerpts / Article TL;DR**: The content loader is designed to automatically extract a post summary. It first looks for a `## TLDR` section in your article and uses its content. If not found, it falls back to parsing the first non-header paragraph of your content, cleaning markdown links and formatting to construct a polished plain-text snippet.

### 3. How to Update the About Me Page
The About page is styled inside `src/app/about/page.tsx`. 
* **Edit Biography**: Open the file and modify the React text blocks directly inside the biography container.
* **Update Profile Photo**: Replace the image file at `public/assets/img/profile_photo.png` or modify the `<img src="...">` tag in the code.
* **Adjust Social Handles**: The quick-links buttons use our local optimized vector components (from `@/components/icons`) and standard Lucide icons (`Brain`, `Mail`, `ExternalLink`). You can change URL href destinations or add new buttons easily within the profile column container.

### 4. Custom Domain configuration
If you need to change your custom GitHub Pages domain name, update the file:
* **`public/CNAME`**

Next.js copies this file into your static production build folder automatically, ensuring Github Pages continues hosting your custom URL seamlessly.

---

## 🚀 Deployment to GitHub Pages

Previously, GitHub Pages automatically built your Jekyll site in the cloud. For this modern Next.js static site, we utilize a automated, zero-downtime **GitHub Actions** compilation and deployment workflow.

### 📦 Automatic Deployment via GitHub Actions (Recommended)

We have created an automated deployment workflow under **`.github/workflows/deploy.yml`**. 

To activate it on GitHub:

1. Push your changes and merge this migration branch into your main branch (e.g., `master`).
2. Go to your GitHub repository in your web browser.
3. Click on the **Settings** tab.
4. On the left sidebar, click **Pages** (under the "Code and automation" section).
5. Under **Build and deployment** -> **Source**, click the dropdown and select **GitHub Actions** (instead of "Deploy from a branch").
6. That's it! Every time you push a change or publish an article on your main branch, GitHub Actions will automatically spin up, install dependencies, run `npm run build`, and deploy the resulting static `out/` folder to GitHub Pages with zero downtime.

---

### 💻 Manual Deployment (Alternative)

If you ever need to manually deploy or build without GitHub Actions:

1. Run the local build command to export the static site:
   ```bash
   npm run build
   ```
2. This creates a `/out/` folder at the root of your directory, containing pure statically generated HTML/CSS/JS and assets.
3. You can copy or push the *contents* of this `/out/` folder directly to your deployment branch (e.g., `gh-pages` or the root of a deployment repository). Note that the `/out/` directory itself is ignored by Git, ensuring your source branch stays pristine and un-cluttered.
