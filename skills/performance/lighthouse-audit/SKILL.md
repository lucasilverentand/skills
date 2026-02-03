---
name: lighthouse-audit
description: Improves Lighthouse scores and Core Web Vitals. Use when optimizing page performance, accessibility, or SEO scores.
argument-hint: [url]
allowed-tools: [Read, Write, Edit, Bash, Glob, Grep]
---

# Lighthouse Audit

Improves Lighthouse scores and Core Web Vitals.

## Your Task

1. **Run audit**: Generate Lighthouse report
2. **Analyze scores**: Review each category
3. **Prioritize fixes**: Focus on high-impact items
4. **Implement**: Apply optimizations
5. **Re-test**: Verify improvements

## Run Lighthouse

```bash
# CLI
npx lighthouse https://example.com --output html --output-path ./report.html

# Chrome DevTools
# 1. Open DevTools (F12)
# 2. Go to Lighthouse tab
# 3. Click "Analyze page load"
```

## Core Web Vitals

| Metric | Good | Needs Improvement |
|--------|------|-------------------|
| LCP (Largest Contentful Paint) | < 2.5s | 2.5s - 4s |
| INP (Interaction to Next Paint) | < 200ms | 200ms - 500ms |
| CLS (Cumulative Layout Shift) | < 0.1 | 0.1 - 0.25 |

## Common Fixes

### Improve LCP

```tsx
// Preload critical images
<link rel="preload" as="image" href="/hero.jpg" />

// Use priority for above-fold images (Next.js)
<Image src="/hero.jpg" priority />

// Optimize server response time
// - Use CDN
// - Enable caching
// - Optimize database queries
```

### Reduce CLS

```css
/* Reserve space for images */
img {
  aspect-ratio: 16 / 9;
  width: 100%;
  height: auto;
}

/* Reserve space for ads/embeds */
.ad-container {
  min-height: 250px;
}
```

### Improve INP

```typescript
// Break up long tasks
function processItems(items: Item[]) {
  // Bad: blocks main thread
  items.forEach(processItem);

  // Good: yield to main thread
  for (const item of items) {
    await processItem(item);
    await new Promise(r => setTimeout(r, 0));
  }
}

// Use web workers for heavy computation
const worker = new Worker('/worker.js');
worker.postMessage(data);
```

### General Optimizations

```tsx
// Defer non-critical JS
<script src="analytics.js" defer />

// Lazy load below-fold content
<img loading="lazy" src="below-fold.jpg" />

// Preconnect to required origins
<link rel="preconnect" href="https://api.example.com" />
```

## Tips

- Test on mobile with throttling
- Focus on Core Web Vitals first
- Use real user monitoring (RUM)
- Set performance budgets
