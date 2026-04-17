---
name: app-icons
description: "The app icon serves as a unique, memorable visual identifier that communicates your application's or game's purpose and personality, allowing users to recognize it instantly. Use when designing app icons for macOS, auditing app icons against Apple's macOS guidelines, or when the user says things like \"design app icons for Mac\", \"app icons on macOS\", \"how should app icons work on Mac\"."
allowed-tools: Read Grep Glob
---

# App icons
The app icon serves as a unique, memorable visual identifier that communicates your application's or game's purpose and personality, allowing users to recognize it instantly

## When to use
- User asks about **app icons** on macOS (e.g. `"how do I design app icons for Mac"`).
- User is building a Mac UI that needs app icons and wants to follow Apple's guidelines.
- User asks to audit or review app icons in a macOS design.
- User mentions app icons in the context of a Mac app, game, or interface.

## Quick principles
- **Use clearly defined edges in foreground layers** — To ensure that system-rendered highlights and shadows appear optimal, avoid soft or feathered edges on foreground layer shapes
- **Vary opacity in foreground layers to enhance depth and liveliness** — For instance, the Photos icon divides its centerpiece into multiple translucent layers, adding greater dynamism to the design
- **Design a background that both stands out and emphasizes foreground content** — Subtle gradients, transitioning from top to bottom or light to dark, tend to interact well with system lighting effects
- **Prefer vector graphics when bringing layers into Icon Composer** — Unlike raster images, vector formats (such as SVG or PDF) scale cleanly and maintain sharpness at any size
- **Produce appropriately shaped, unmasked layers** — The final icon shape is generated when the system masks all layer edges
- **Keep primary content centered to prevent truncation when the system adjusts corners or applies masking** — Pay close attention to proper content alignment within visionOS and watchOS icons
- **Maintain a visually consistent icon design across all supported platforms** — A unified design helps users locate your app quickly and prevents confusion regarding multiple versions
- **Consider basing your icon design on filled, overlapping shapes** — Foreground solid overlaps, particularly when combined with transparency and blurring effects, can lend a sense of depth to the icon
- **Include text only if it is crucial to your brand or experience** — Text within icons presents challenges regarding accessibility and localization, often becomes illegible due to small size, and can contribute to visual clutter
- **Prefer illustrations over photographs and avoid replicating UI components** — Photographs contain numerous details that perform poorly across different displays, at small scales, or when layered
- **Do not use replicas of Apple hardware products** — Reproducing Apple products is prohibited due to copyright restrictions
- **Let the system handle blurring and other visual effects** — The operating system applies dynamic visual treatments to your app icon layers, rendering it unnecessary to include elements like blurs, glows, beveled…

## Full guidance
Read the referenced files for the complete Apple guidance on this topic:
- @references/guidelines-overview.md
- @references/guidelines-icon-shape.md
- @references/guidelines-design.md
- @references/guidelines-visual-effects.md
- @references/guidelines-appearances.md
- @references/guidelines-specifications.md
