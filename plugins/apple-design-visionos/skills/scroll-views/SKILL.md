---
name: scroll-views
description: "A scroll view enables users to examine content that exceeds the display boundaries by shifting the content along a vertical or horizontal axis. Use when designing scroll views for visionOS, auditing scroll views against Apple's visionOS guidelines, or when the user says things like \"design scroll views for Apple Vision Pro\", \"scroll views on visionOS\", \"how should scroll views work on Apple Vision Pro\"."
allowed-tools: Read Grep Glob
---

# Scroll views
A scroll view enables users to examine content that exceeds the display boundaries by shifting the content along a vertical or horizontal axis

## When to use
- User asks about **scroll views** on visionOS (e.g. `"how do I design scroll views for Apple Vision Pro"`).
- User is building an Apple Vision Pro UI that needs scroll views and wants to follow Apple's guidelines.
- User asks to audit or review scroll views in a visionOS design.
- User mentions scroll views in the context of an Apple Vision Pro app, game, or interface.

## Quick principles
- **Support default scrolling gestures and keyboard shortcuts** — Users are accustomed to system-level scrolling behavior and expect it to function universally
- **Make it apparent when content is scrollable** — Since scroll indicators are not always visible, it can be beneficial to clearly signal when content extends beyond the view boundaries
- **Avoid putting a scroll view inside another scroll view with the same orientation** — Nesting scroll views sharing the same orientation can lead to an unpredictable interface that is difficult to manage
- **Consider supporting page-by-page scrolling if it makes sense for your content** — In certain scenarios, users prefer interacting with fixed chunks of content rather than continuous scrolling
- **In some cases, scroll automatically to help people find their place** — Although users initiate nearly all scrolling actions, automatic scrolling can be beneficial when relevant content moves out of view, such as:
- **If you support zoom, set appropriate maximum and minimum scale values** — For example, zooming into text until a single character fills the entire screen is usually impractical
- **Only implement a scroll edge effect when a scroll view borders floating interface elements** — Scroll edge effects are not decorative
- **Apply a single scroll edge effect per view** — In split view configurations on iPad and Mac, each pane may utilize its own scroll edge effect; if this is the case…
- **If necessary, account for the size of the scroll indicator** — While the indicator itself is small overall, it possesses a greater thickness compared to its iOS counterpart
- **Support Look to Scroll for reading or browsing views** — Since Look to Scroll is not enabled by default, you must explicitly add support for it in each individual scroll view
- **Avoid using Look to Scroll for secondary content** — Generally, rely on standard gestures rather than Look to Scroll in views that contain UI controls or dense information requiring rapid, accurate…
- **Maintain consistency across content** — If you implement Look to Scroll in one view within your app, ensure it is supported across all comparable views

## Full guidance
Read the referenced files for the complete Apple guidance on this topic:
- @references/guidelines-overview.md
- @references/guidelines-scroll-edge-effects.md
