# Website

Public-facing site — marketing pages, blogs, landing pages. Built with Astro (not Next.js).

## Setup

1. Scaffold: `bun create astro@latest packages/web -- --template minimal --typescript strict --no-git`
2. Set `"name": "@scope/web"` in package.json
3. Install: `bunx astro add tailwind sitemap`
4. Add `@astrojs/mdx` if content uses MDX
5. Configure `astro.config.ts`:
   - `output: "static"` for content/marketing, `"server"` for SSR, `"hybrid"` for a mix
   - `site:` for sitemap and canonical URLs
   - `@astrojs/cloudflare` adapter for SSR or hybrid deployment

## Directory structure

```
packages/web/
  src/
    pages/             # File-based routing
      index.astro
      blog/
        [...slug].astro
      api/             # API endpoints (server routes)
    layouts/
      Base.astro       # Root layout (head, SEO, OG tags)
    components/        # Astro and React components
    content/
      blog/            # Content collection entries (Markdown/MDX)
      config.ts        # Collection schemas
    lib/               # Business logic and data fetching helpers
    styles/
      globals.css
  astro.config.ts
  tailwind.config.ts
```

## Pages and layouts

- Pages in `src/pages/` — file name = URL path
- Layouts in `src/layouts/` — `Base.astro` is the root layout with `<head>`, SEO, OG tags
- Never put business logic in pages — extract to `src/lib/`

```astro
---
// src/layouts/Base.astro
interface Props {
  title: string;
  description?: string;
  ogImage?: string;
}
const { title, description, ogImage } = Astro.props;
const canonicalURL = new URL(Astro.url.pathname, Astro.site);
---
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{title} | My Site</title>
    {description && <meta name="description" content={description} />}
    <link rel="canonical" href={canonicalURL} />
    <meta property="og:title" content={title} />
    {description && <meta property="og:description" content={description} />}
    {ogImage && <meta property="og:image" content={ogImage} />}
    <meta name="robots" content="index, follow" />
  </head>
  <body>
    <slot />
  </body>
</html>
```

## Content collections

Define schemas in `src/content/config.ts`:

```ts
import { defineCollection, z } from "astro:content";

const blog = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    pubDate: z.coerce.date(),
    description: z.string(),
    author: z.string().optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog };
```

Querying collections:

```astro
---
import { getCollection } from "astro:content";

// All published posts, newest first
const posts = (await getCollection("blog", ({ data }) => !data.draft))
  .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
---
```

Dynamic routes with `getStaticPaths`:

```astro
---
// src/pages/blog/[...slug].astro
import { getCollection, render } from "astro:content";

export async function getStaticPaths() {
  const posts = await getCollection("blog");
  return posts.map((post) => ({
    params: { slug: post.slug },
    props: { post },
  }));
}

const { post } = Astro.props;
const { Content } = await render(post);
---
<article>
  <h1>{post.data.title}</h1>
  <Content />
</article>
```

## Rendering modes

Choose per-page or globally in `astro.config.ts`:

```ts
// astro.config.ts
export default defineConfig({
  output: "hybrid",  // default: static; individual pages can opt into SSR
  adapter: cloudflare(),
});
```

Mark a page as server-rendered by exporting `const prerender = false`:

```astro
---
// This page renders on every request, not at build time
export const prerender = false;

const data = await fetchLiveData();
---
```

Use `output: "static"` for content-only sites (no SSR needed). Use `"hybrid"` when most pages are static but a few need live data (contact forms, dashboards). Use `"server"` when the majority of pages are dynamic.

## Astro Actions (form handling)

Astro Actions provide type-safe server functions for form submissions and mutations. Requires `output: "server"` or `"hybrid"`.

Define actions in `src/actions/index.ts`:

```ts
import { defineAction } from "astro:actions";
import { z } from "astro:schema";

export const server = {
  contact: defineAction({
    accept: "form",
    input: z.object({
      name: z.string().min(1, "Name is required"),
      email: z.string().email("Invalid email"),
      message: z.string().min(10, "Message is too short"),
    }),
    handler: async (input) => {
      await sendEmail(input);
      return { sent: true };
    },
  }),
};
```

Use in a page with progressive enhancement — works without JavaScript, enhanced with JS:

```astro
---
import { actions, isInputError } from "astro:actions";

const result = Astro.getActionResult(actions.contact);
const inputError = isInputError(result?.error) ? result.error : null;
---

<form method="POST" action={actions.contact}>
  <div>
    <input name="name" type="text" />
    {inputError?.fields.name && <p class="error">{inputError.fields.name[0]}</p>}
  </div>
  <div>
    <input name="email" type="email" />
    {inputError?.fields.email && <p class="error">{inputError.fields.email[0]}</p>}
  </div>
  <div>
    <textarea name="message"></textarea>
    {inputError?.fields.message && <p class="error">{inputError.fields.message[0]}</p>}
  </div>
  <button type="submit">Send</button>
  {result?.data?.sent && <p class="success">Message sent!</p>}
</form>
```

For client-side form submission (React islands), call actions directly:

```tsx
import { actions } from "astro:actions";

async function handleSubmit(formData: FormData) {
  const { data, error } = await actions.contact(formData);
  if (error) { /* handle */ }
}
```

## Interactive islands

Use React components only where interactivity is needed. Install: `bunx astro add react`

```astro
---
import SearchBar from "../components/SearchBar.tsx";
import StaticHeader from "../components/Header.astro";
---

<StaticHeader />
<!-- Only SearchBar ships JS to the browser -->
<SearchBar client:load />
```

Client directives:
- `client:load` — hydrate immediately on page load (use sparingly)
- `client:idle` — hydrate when the browser is idle (good for non-critical UI)
- `client:visible` — hydrate when the component enters the viewport (good for below-the-fold)
- `client:only="react"` — render only client-side, no server-side HTML (use for auth-gated UI)

Keep islands small and isolated. Pass only serializable props (no functions, no class instances).

## View transitions

Astro's built-in View Transitions API enables smooth page-to-page navigation:

```astro
---
// src/layouts/Base.astro
import { ViewTransitions } from "astro:transitions";
---
<head>
  <!-- ... -->
  <ViewTransitions />
</head>
```

Customize transitions per element with `transition:name`:

```astro
<!-- List page -->
<img src={post.cover} transition:name={`cover-${post.slug}`} />

<!-- Detail page — same transition:name creates a morph animation -->
<img src={post.cover} transition:name={`cover-${post.slug}`} />
```

## SEO defaults

Set in Base layout, allow per-page overrides:
- `<title>` — `{title} | {siteName}`
- `<meta name="description">`, OG tags, canonical URL
- `<meta name="robots" content="index, follow">`

For dynamic OG images, use `@vercel/og` or generate static images at build time.

## Integrations

| Integration | When to add |
|---|---|
| `@astrojs/tailwind` | Always |
| `@astrojs/sitemap` | Always for public sites |
| `@astrojs/mdx` | When content uses MDX |
| `@astrojs/react` | Only for interactive islands |
| `@astrojs/cloudflare` | SSR or hybrid deployment to Cloudflare Workers |

## Cloudflare Workers deployment

With `@astrojs/cloudflare` and `output: "server"` or `"hybrid"`:

```ts
// astro.config.ts
import { defineConfig } from "astro/config";
import cloudflare from "@astrojs/cloudflare";
import tailwind from "@astrojs/tailwind";

export default defineConfig({
  output: "hybrid",
  adapter: cloudflare({ platformProxy: { enabled: true } }),
  integrations: [tailwind()],
  site: "https://example.com",
});
```

Access Cloudflare bindings (D1, KV, R2) from `Astro.locals.runtime.env`:

```astro
---
export const prerender = false;
const { env } = Astro.locals.runtime;
const result = await env.DB.prepare("SELECT * FROM posts").all();
---
```

Deploy: `bunx wrangler pages deploy ./dist`.

## Tools

| Tool | Purpose |
|---|---|
| `tools/page-list.ts` | All pages with routes and layout assignments |
| `tools/collection-check.ts` | Validate collection schemas against entries |
| `tools/integration-audit.ts` | Installed integrations and config status |
