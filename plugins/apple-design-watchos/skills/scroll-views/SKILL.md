---
name: scroll-views
description: "A scroll view enables users to examine content that exceeds the display boundaries by shifting the content along a vertical or horizontal axis. Use when designing scroll views for watchOS, auditing scroll views against Apple's watchOS guidelines, or when the user says things like \"design scroll views for Apple Watch\", \"scroll views on watchOS\", \"how should scroll views work on Apple Watch\"."
allowed-tools: Read Grep Glob
---

# Scroll views
A scroll view enables users to examine content that exceeds the display boundaries by shifting the content along a vertical or horizontal axis

## When to use
- User asks about **scroll views** on watchOS (e.g. `"how do I design scroll views for Apple Watch"`).
- User is building an Apple Watch UI that needs scroll views and wants to follow Apple's guidelines.
- User asks to audit or review scroll views in a watchOS design.
- User mentions scroll views in the context of an Apple Watch app, game, or interface.

## Quick principles
- **Support default scrolling gestures and keyboard shortcuts** — Users are accustomed to system-level scrolling behavior and expect it to function universally
- **Make it apparent when content is scrollable** — Since scroll indicators are not always visible, it can be beneficial to clearly signal when content extends beyond the view boundaries
- **Avoid putting a scroll view inside another scroll view with the same orientation** — Nesting scroll views sharing the same orientation can lead to an unpredictable interface that is difficult to manage
- **Consider supporting page-by-page scrolling if it makes sense for your content** — In certain scenarios, users prefer interacting with fixed chunks of content rather than continuous scrolling
- **In some cases, scroll automatically to help people find their place** — Although users initiate nearly all scrolling actions, automatic scrolling can be beneficial when relevant content moves out of view, such as:
- **If you support zoom, set appropriate maximum and minimum scale values** — For example, zooming into text until a single character fills the entire screen is usually impractical
- **Only implement a scroll edge effect when a scroll view borders floating interface elements** — Scroll edge effects are not decorative
- **Apply a single scroll edge effect per view** — In split view configurations on iPad and Mac, each pane may utilize its own scroll edge effect; if this is the case…
- **Prefer vertical scrolling content** — Users are accustomed to navigating within and between apps on Apple Watch using the Digital Crown
- **Use tab views for page-by-page transitions** — watchOS renders tab views as distinct pages
- **When presenting paged content, consider restricting individual pages to the height of a single screen** — Adhering to this guideline clarifies the function of each page and assists in developing a more glanceable experience

## Full guidance
Read the referenced files for the complete Apple guidance on this topic:
- @references/guidelines.md
