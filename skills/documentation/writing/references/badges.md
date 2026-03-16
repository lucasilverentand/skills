# Badge Reference

Badges provide at-a-glance project status using shields.io.

## Common Badges

### CI / Build Status

```markdown
![CI](https://img.shields.io/github/actions/workflow/status/org/repo/ci.yml?branch=main&label=CI)
```

### Package Version

```markdown
<!-- npm -->
![npm](https://img.shields.io/npm/v/package-name)

<!-- crates.io -->
![crates.io](https://img.shields.io/crates/v/crate-name)

<!-- PyPI -->
![PyPI](https://img.shields.io/pypi/v/package-name)
```

### License

```markdown
![License](https://img.shields.io/github/license/org/repo)
```

### Downloads

```markdown
<!-- npm monthly -->
![Downloads](https://img.shields.io/npm/dm/package-name)

<!-- crates.io total -->
![Downloads](https://img.shields.io/crates/d/crate-name)
```

### Bundle Size

```markdown
![Bundle Size](https://img.shields.io/bundlephobia/minzip/package-name)
```

### Coverage

```markdown
![Coverage](https://img.shields.io/codecov/c/github/org/repo)
```

### Language / Runtime

```markdown
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)
![Rust](https://img.shields.io/badge/Rust-1.82-orange)
![Swift](https://img.shields.io/badge/Swift-6.2-orange)
![Python](https://img.shields.io/badge/Python-3.12-blue)
```

### Platform

```markdown
![Platform](https://img.shields.io/badge/platform-iOS%2026-blue)
![Platform](https://img.shields.io/badge/platform-macOS%20%7C%20Linux-blue)
![Platform](https://img.shields.io/badge/platform-iOS%20%7C%20Android-blue)
```

## Custom shields.io Badges

Pattern: `https://img.shields.io/badge/<label>-<message>-<color>`

URL-encode spaces as `%20`, pipes as `%7C`.

### Stack badges

```markdown
![Bun](https://img.shields.io/badge/runtime-Bun-f9f1e1)
![Hono](https://img.shields.io/badge/framework-Hono-ff6b35)
![Biome](https://img.shields.io/badge/lint-Biome-60a5fa)
![Drizzle](https://img.shields.io/badge/ORM-Drizzle-c5f74f)
![Cloudflare](https://img.shields.io/badge/deploy-Cloudflare-f38020)
![Railway](https://img.shields.io/badge/deploy-Railway-0B0D0E)
```

### Status badges

```markdown
![Status](https://img.shields.io/badge/status-alpha-orange)
![Status](https://img.shields.io/badge/status-beta-yellow)
![Status](https://img.shields.io/badge/status-stable-green)
![Status](https://img.shields.io/badge/status-deprecated-red)
```

## Badge Placement Rules

- Place badges directly below the project title/tagline, before the first section
- Order: CI status, version, license, then optional (downloads, bundle size, coverage)
- Do not add badges for internal services or workspace packages — they add noise
- Only include badges for services you actually use (no coverage badge without coverage configured)
- Keep to one line of badges — two lines max for feature-rich libraries

## Badge Colors

Common hex colors for custom badges:

| Color | Hex | Use |
|---|---|---|
| Blue | `007ec6` | Default informational |
| Green | `97ca00` | Success, stable |
| Yellow | `dfb317` | Warning, beta |
| Orange | `fe7d37` | Alpha, experimental |
| Red | `e05d44` | Critical, deprecated |
| Light grey | `9f9f9f` | Neutral |
| Bright green | `44cc11` | Passing, active |

## Dynamic Badges (JSON endpoint)

For custom metrics, use shields.io's endpoint badge:

```markdown
![Custom](https://img.shields.io/endpoint?url=https://your-api.com/badge.json)
```

The endpoint must return:

```json
{
  "schemaVersion": 1,
  "label": "metric",
  "message": "42",
  "color": "green"
}
```
