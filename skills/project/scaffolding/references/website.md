# Website

Public-facing site — marketing pages, blogs, landing pages. Built with Astro (not Next.js).

## Setup

1. Scaffold: `bun create astro@latest packages/web -- --template minimal --typescript strict --no-git`
2. Set `"name": "@scope/web"` in package.json
3. Install: `bunx astro add tailwind sitemap`
4. Add `@astrojs/mdx` if content uses MDX
5. Configure `astro.config.ts`:
   - `output: "static"` for content/marketing, `"server"` for SSR
   - `site:` for sitemap and canonical URLs
   - `@astrojs/cloudflare` adapter for SSR

## Pages and layouts

- Pages in `src/pages/` — file name = URL path
- Layouts in `src/layouts/` — `Base.astro` is the root layout with `<head>`, SEO, OG tags
- Never put business logic in pages — extract to `src/lib/`

## Content collections

Define schemas in `src/content/config.ts` using Zod:

```ts
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

Access via `getCollection()` and `getEntry()` from `astro:content`.

## SEO defaults

Set in Base layout, allow per-page overrides:
- `<title>` — `{title} | {siteName}`
- `<meta name="description">`, OG tags, canonical URL
- `<meta name="robots" content="index, follow">`

## Integrations

| Integration | When to add |
|---|---|
| `@astrojs/tailwind` | Always |
| `@astrojs/sitemap` | Always for public sites |
| `@astrojs/mdx` | When content uses MDX |
| `@astrojs/react` | Only for interactive islands |
| `@astrojs/cloudflare` | SSR deployment |

## Tools

| Tool | Purpose |
|---|---|
| `tools/page-list.ts` | All pages with routes and layout assignments |
| `tools/collection-check.ts` | Validate collection schemas against entries |
| `tools/integration-audit.ts` | Installed integrations and config status |
