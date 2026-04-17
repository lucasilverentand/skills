---
name: maps
description: "A map presents geographical data, whether indoor or outdoor, within your application or website. Use when designing maps for watchOS, auditing maps against Apple's watchOS guidelines, or when the user says things like \"design maps for Apple Watch\", \"maps on watchOS\", \"how should maps work on Apple Watch\"."
allowed-tools: Read Grep Glob
---

# Maps
A map presents geographical data, whether indoor or outdoor, within your application or website

## When to use
- User asks about **maps** on watchOS (e.g. `"how do I design maps for Apple Watch"`).
- User is building an Apple Watch UI that needs maps and wants to follow Apple's guidelines.
- User asks to audit or review maps in a watchOS design.
- User mentions maps in the context of an Apple Watch app, game, or interface.

## Quick principles
- **In general, ensure your map is interactive** — Users expect to be able to zoom, pan, and otherwise manipulate maps using familiar controls
- **Select a map emphasis style appropriate for your application's needs** — There are two available styles:
- **Assist users in locating places within your map** — Consider incorporating a search function alongside a mechanism to filter locations by category
- **Clearly denote elements that users have selected** — When a user selects a specific area or element on the map, use distinct visual cues—such as an outline and color variation—to…
- **Group nearby points of interest into clusters to enhance map legibility** — A *cluster* uses a single marker to represent multiple points of interest located in close proximity
- **Ensure users can view the Apple logo and legal link** — While it is acceptable for parts of your interface to temporarily cover the logo and link, they should not be obscured all…
- **Use annotations that match the visual style of your app** — Annotations are used to identify specific points of interest you have added to the map
- **If you want to display custom information that’s related to standard map features, consider making them independently selectable** — When you enable selection for map features, the system treats Apple-provided elements (including physical features, territories, and points of interest) separately from…
- **Use overlays to define map areas with a specific relationship to your content**
- **Make sure there’s enough contrast between custom controls and the map** — Insufficient contrast makes controls difficult to perceive and risks them blending into the background map
- **Consider your map presentation when choosing a style** — While the full callout style provides users with the richest experience and the most detailed information about a location, you must select…
- **Make sure your place card looks great on different devices and window sizes** — If you choose to define a specific style, ensure that the content within your place card remains visible across different devices and…

## Full guidance
Read the referenced files for the complete Apple guidance on this topic:
- @references/best-practices.md
- @references/custom-information.md
- @references/place-cards.md
- @references/indoor-maps.md
- @references/platform-guidance-watchos.md
