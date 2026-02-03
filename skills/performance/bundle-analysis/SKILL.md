---
name: bundle-analysis
description: Analyzes and optimizes JavaScript bundle sizes. Use when reducing load times, identifying large dependencies, or improving build output.
argument-hint:
allowed-tools: [Read, Bash, Glob, Grep]
---

# Bundle Analysis

Analyzes and optimizes JavaScript bundle sizes.

## Your Task

1. **Analyze bundle**: Generate size report
2. **Identify issues**: Find large dependencies
3. **Optimize**: Apply size reduction techniques
4. **Measure**: Compare before and after
5. **Monitor**: Set up size tracking

## Analysis Tools

```bash
# Webpack
npx webpack-bundle-analyzer stats.json

# Vite
npx vite-bundle-visualizer

# Next.js
ANALYZE=true npm run build

# Generic
npx source-map-explorer dist/*.js
```

## Bundle Size Report

```bash
# Install
npm install -D @next/bundle-analyzer

# next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});
module.exports = withBundleAnalyzer({});
```

## Optimization Techniques

### Code Splitting

```typescript
// Dynamic import
const HeavyComponent = lazy(() => import('./HeavyComponent'));

// Route-based splitting (Next.js automatic)
// pages/dashboard.tsx is automatically split
```

### Tree Shaking

```typescript
// Bad - imports entire library
import _ from 'lodash';

// Good - imports only what's needed
import debounce from 'lodash/debounce';

// Or use lodash-es
import { debounce } from 'lodash-es';
```

### Replace Heavy Dependencies

| Heavy | Lighter Alternative |
|-------|---------------------|
| moment.js (300KB) | date-fns (30KB) or dayjs (7KB) |
| lodash (70KB) | lodash-es or native methods |
| chart.js (200KB) | lightweight-charts (40KB) |

### Compression

```javascript
// vite.config.ts
import viteCompression from 'vite-plugin-compression';

export default {
  plugins: [
    viteCompression({ algorithm: 'gzip' }),
    viteCompression({ algorithm: 'brotliCompress' }),
  ],
};
```

## Size Budgets

```json
// package.json
{
  "bundlewatch": {
    "files": [
      { "path": "dist/*.js", "maxSize": "150kB" }
    ]
  }
}
```

## Tips

- Aim for <200KB initial JS (gzipped)
- Use dynamic imports for routes
- Analyze dependencies before adding
- Monitor size in CI
