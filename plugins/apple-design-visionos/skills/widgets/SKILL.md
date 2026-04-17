---
name: widgets
description: "A widget offers users rapid access to critical data and focused interactions from your application or game when viewed in different contexts. Use when designing widgets for visionOS, auditing widgets against Apple's visionOS guidelines, or when the user says things like \"design widgets for Apple Vision Pro\", \"widgets on visionOS\", \"how should widgets work on Apple Vision Pro\"."
allowed-tools: Read Grep Glob
---

# Widgets
A widget offers users rapid access to critical data and focused interactions from your application or game when viewed in different contexts

## When to use
- User asks about **widgets** on visionOS (e.g. `"how do I design widgets for Apple Vision Pro"`).
- User is building an Apple Vision Pro UI that needs widgets and wants to follow Apple's guidelines.
- User asks to audit or review widgets in a visionOS design.
- User mentions widgets in the context of an Apple Vision Pro app, game, or interface.

## Quick principles
- **Keep your widget up to date** — Determining the proper refresh interval for your widget requires understanding how frequently the underlying data changes and estimating when users need to…
- **Use system functionality to refresh dates and times in your widget** — Since widget update frequency is constrained, allow the system to automatically manage date and time refreshes to maximize update opportunities
- **Use animated transitions to bring attention to data updates** — By default, many SwiftUI views animate content changes
- **Offer simple, relevant functionality and reserve complexity for your app** — A valuable widget provides users with a straightforward method to perform an action or complete a task directly related to its content
- **Ensure that a widget interaction opens your app at the right location** — Deep link into details and actions relevant to the widget's content, rather than requiring users to navigate through the app to reach…
- **Offer interactivity while remaining glanceable and uncluttered** — While multiple interaction targets—such as SwiftUI links, buttons, and toggles—may be appropriate for your content, avoid designing widgets that mimic the full…
- **Generally, maintain standard margins for optimal readability** — Utilize the conventional margin width—16 points for most widgets—to prevent crowding along the edges and maintain a clean appearance
- **Align the corner radius of your content with that of the widget** — To ensure your content integrates seamlessly within the widget's rounded boundaries, employ a SwiftUI container to apply the proper corner radius
- **Prefer using the system font, text styles, and SF Symbols** — Utilizing the native system font assists your widget in appearing cohesive across all platforms while simultaneously enabling you to render high-quality text…
- **Avoid very small font sizes** — Generally, display text using fonts that are 11 points or larger
- **Avoid rasterizing text** — Always utilize native text elements and styles; this guarantees proper scaling of your content and enables VoiceOver to accurately announce it
- **Employ color to elevate a widget's aesthetic without distracting from its content** — While vibrant hues capture attention, they are most effective when they do not impede a user's ability to quickly grasp the widget's…

## Full guidance
Read the referenced files for the complete Apple guidance on this topic:
- @references/overview.md
- @references/anatomy.md
- @references/best-practices-overview.md
- @references/best-practices-updating-widget-content.md
- @references/best-practices-adding-interactivity.md
- @references/best-practices-choosing-margins-and-padding.md
- @references/best-practices-displaying-text-in-widgets.md
- @references/best-practices-using-color.md
- @references/rendering-modes.md
- @references/previews-and-placeholders.md
- @references/platform-guidance-visionos-overview.md
- @references/platform-guidance-visionos-thresholds-and-sizes.md
- @references/platform-guidance-visionos-mounting-styles.md
- @references/platform-guidance-visionos-treatment-styles.md
- @references/specifications.md
