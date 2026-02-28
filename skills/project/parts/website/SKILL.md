---
name: website
description: Sets up and maintains the website workspace package for marketing sites, content sites, landing pages, and blogs. Handles pages, layouts, content collections, MDX, SEO metadata, integrations, and static asset optimization. Use when creating a website package, adding pages or layouts, configuring integrations, or managing content collections.
allowed-tools: Read Write Edit Glob Grep Bash
---

# Website

The `website` part is the public-facing site for the project — marketing pages, content hubs, landing pages, and blogs. Built with Astro (not Next.js). Use Astro for all public-facing content pages.

## Decision Tree

- What are you doing?
  - **Setting up a new website package** → what kind of site?
    - **Marketing or landing pages** → see "Initial setup" below, use `output: "static"`
    - **Blog or content-heavy site** → see "Initial setup" below, add `@astrojs/mdx` and set up content collections
    - **Hybrid with server-rendered pages** → see "Initial setup" below, use `output: "server"` with Cloudflare adapter
  - **Adding a page or layout** → see "Pages and layouts" below
  - **Adding or editing content collections** → see "Content collections" below
  - **Adding an integration** → see "Integrations" below
  - **Auditing SEO or image setup** → run `tools/integration-audit.ts`
  - **Listing pages and routes** → run `tools/page-list.ts`
  - **Validating collection schemas** → run `tools/collection-check.ts`

## Initial setup

1. Scaffold with `bun create astro@latest packages/web -- --template minimal --typescript strict --no-git`
2. Update `package.json` — set `"name": "@scope/web"`, add to workspace
3. Install standard integrations:
   ```
   bunx astro add tailwind sitemap
   ```
4. Add `@astrojs/mdx` if content uses MDX
5. Configure `astro.config.ts`:
   - Set `output: "static"` for pure content/marketing sites, `"server"` if SSR needed
   - Add `site:` for sitemap and canonical URLs
   - Import and register integrations
   - For SSR: add `@astrojs/cloudflare` adapter
6. Set up `src/layouts/Base.astro` with `<head>` meta, OG tags, and font loading
7. Add `public/` for static assets; use Astro's `<Image>` component for optimized images

## Pages and layouts

- Pages live in `src/pages/` — file name = URL path
- Layouts live in `src/layouts/` — used via frontmatter `layout:` or explicit import
- `Base.astro` is the root layout: `<html>`, `<head>` with SEO, `<body>` slot
- Never put business logic in pages — extract to `src/lib/`

## Content collections

- Define schemas in `src/content/config.ts` using Zod
- Collections live in `src/content/<collection>/`
- Access via `getCollection()` and `getEntry()` from `astro:content`
- Run `tools/collection-check.ts` after schema changes to verify existing entries match

```ts
// src/content/config.ts
import { defineCollection, z } from "astro:content";

const blog = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    pubDate: z.coerce.date(),
    description: z.string(),
  }),
});

export const collections = { blog };
```

## SEO defaults

Set these in the Base layout — allow per-page overrides via props:

- `<title>` — `{title} | {siteName}`
- `<meta name="description">`
- `<meta property="og:title">`, `og:description`, `og:image`
- `<link rel="canonical">`
- `<meta name="robots" content="index, follow">` unless noindex

## Integrations

| Integration | When to add |
|---|---|
| `@astrojs/tailwind` | Always — use Tailwind for all styling |
| `@astrojs/sitemap` | Always for public sites |
| `@astrojs/mdx` | When content uses MDX components |
| `@astrojs/react` | Only when interactive islands need React |
| `@astrojs/cloudflare` | When deploying SSR to Cloudflare |

Run `tools/integration-audit.ts` to check installed integrations and their config status.

## Key references

| File | What it covers |
|---|---|
| `tools/page-list.ts` | All pages with routes and layout assignments |
| `tools/collection-check.ts` | Validates collection schemas against entries |
| `tools/integration-audit.ts` | Installed integrations and configuration status |
