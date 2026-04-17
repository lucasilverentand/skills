---
name: icons
description: "An effective icon is a graphic asset that expresses a single concept instantly recognizable to users. Use when designing icons for macOS, auditing icons against Apple's macOS guidelines, or when the user says things like \"design icons for Mac\", \"icons on macOS\", \"how should icons work on Mac\"."
allowed-tools: Read Grep Glob
---

# Icons
An effective icon is a graphic asset that expresses a single concept instantly recognizable to users

## When to use
- User asks about **icons** on macOS (e.g. `"how do I design icons for Mac"`).
- User is building a Mac UI that needs icons and wants to follow Apple's guidelines.
- User asks to audit or review icons in a macOS design.
- User mentions icons in the context of a Mac app, game, or interface.

## Quick principles
- **Design icons that are instantly recognizable and highly simplified** — Excessive detail can render an interface icon confusing or illegible
- **Ensure visual uniformity across all interface icons within your application** — Whether you exclusively use custom icons or combine them with system-provided ones, all interface icons in your app must maintain consistency in…
- **Generally, match the weights of interface icons and adjacent text** — Unless you intend to disproportionately emphasize either the icons or the accompanying text, using matching weights provides a cohesive appearance and consistent…
- **If necessary, add padding to a custom interface icon to achieve optical alignment** — Certain icons—particularly asymmetric ones—may appear unbalanced when geometrically centered rather than optically centered
- **Provide a selected-state version of an interface icon only when required** — You do not need to supply both selected and unselected appearances for an icon used within standard system components like tab bars…
- **Use inclusive imagery** — Consider how your icons can be understandable and welcoming to all users
- **Include text in your design only when it is critical for conveying meaning** — For example, using a character within an interface icon to denote text formatting is often the most direct way to communicate that…
- **If you create a custom interface icon, use a vector format such as PDF or SVG** — The system automatically scales a vector-based interface icon for high-resolution displays, eliminating the need to provide multiple versions
- **Provide alternative text labels for custom interface icons** — Alternative text labels, or accessibility descriptions, are not visible but allow VoiceOver to audibly describe the on-screen content, simplifying navigation for users…
- **Avoid replicating Apple hardware products** — Hardware designs are prone to frequent changes and can quickly make your interface icons or other content appear outdated
- **Design simple images that clearly communicate the document type** — Regardless of whether you use a background fill, a center image, or both, favor uncomplicated shapes and a limited palette of distinct…
- **Designing a single, expressive image for the background fill can be an effective way to help users understand and identify a document type** — For example, both Xcode and TextEdit employ rich background images without including a center image

## Full guidance
Read the referenced files for the complete Apple guidance on this topic:
- @references/guidelines-overview.md
- @references/guidelines-best-practices.md
- @references/guidelines-standard-icons.md
