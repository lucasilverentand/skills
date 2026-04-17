---
name: layout
description: "A layout that remains consistent while adapting to diverse contexts improves approachability and allows users to enjoy their favorite applications and games regardless of the device they are using. Use when designing layout for visionOS, auditing layout against Apple's visionOS guidelines, or when the user says things like \"design layout for Apple Vision Pro\", \"layout on visionOS\", \"how should layout work on Apple Vision Pro\"."
allowed-tools: Read Grep Glob
---

# Layout
A layout that remains consistent while adapting to diverse contexts improves approachability and allows users to enjoy their favorite applications and games regardless of the device they are using

## When to use
- User asks about **layout** on visionOS (e.g. `"how do I design layout for Apple Vision Pro"`).
- User is building an Apple Vision Pro UI that needs layout and wants to follow Apple's guidelines.
- User asks to audit or review layout in a visionOS design.
- User mentions layout in the context of an Apple Vision Pro app, game, or interface.

## Quick principles
- **Group related items to aid users in locating desired information** — For instance, you might employ negative space, background shapes, colors, materials, or dividing lines to indicate relationships between elements and segment information…
- **Ensure essential information is easily discoverable by allocating it adequate space** — Since users expect to view the most critical details immediately, do not overwhelm them by crowding important information with secondary details
- **Allow content to extend across the entire screen or window** — Verify that backgrounds and full-screen artwork stretch to cover all edges of the display
- **Differentiate controls from content** — Utilize the Liquid Glass material to provide a visually distinct appearance for controls that remains consistent across iOS, iPadOS, and macOS
- **Place items to convey their relative importance** — Since users typically scan information in reading order—from top to bottom and leading edge to trailing edge—it is generally effective to position…
- **Align components with one another to make them easier to scan and to communicate organization and hierarchy** — Proper alignment contributes to a clean, organized appearance in an application and assists users in tracking content while scrolling or moving their…
- **Take advantage of progressive disclosure to help people discover content that’s currently hidden** — If a large collection cannot be displayed entirely at once, you must indicate the presence of additional unseen items
- **Make controls easier to use by providing enough space around them and grouping them in logical sections** — When unrelated controls are placed too closely together, or when they are crowded by other content, users may struggle to distinguish them…
- **Design a layout that adapts gracefully to context changes while remaining recognizably consistent** — Users expect your experience to function correctly and feel familiar whether they rotate their device, resize a window, add another display, or…
- **Be prepared for text-size changes** — Users appreciate apps and games that respond when they select a different text size
- **Preview your app on multiple devices, using different orientations, localizations, and text sizes** — You can accelerate the testing phase by initially verifying versions of your experience using both the largest and smallest layouts
- **When necessary, scale artwork in response to display changes** — For example, viewing your app or game in a different context—such as on a screen with a varying aspect ratio—might cause your…

## Full guidance
Read the referenced files for the complete Apple guidance on this topic:
- @references/overview.md
- @references/best-practices.md
- @references/visual-hierarchy.md
- @references/adaptability.md
- @references/guides-and-safe-areas.md
- @references/platform-guidance-visionos.md
- @references/specifications.md
