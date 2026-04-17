---
name: eyes
description: "In visionOS, users identify a virtual object as an interactive target by looking at it. Use when designing eyes for visionOS, auditing eyes against Apple's visionOS guidelines, or when the user says things like \"design eyes for Apple Vision Pro\", \"eyes on visionOS\", \"how should eyes work on Apple Vision Pro\"."
allowed-tools: Read Grep Glob
---

# Eyes
In visionOS, users identify a virtual object as an interactive target by looking at it

## When to use
- User asks about **eyes** on visionOS (e.g. `"how do I design eyes for Apple Vision Pro"`).
- User is building an Apple Vision Pro UI that needs eyes and wants to follow Apple's guidelines.
- User asks to audit or review eyes in a visionOS design.
- User mentions eyes in the context of an Apple Vision Pro app, game, or interface.

## Quick principles
- **Always give people multiple ways to interact with your app** — Design your application to accommodate the accessibility features users employ to customize how they engage with their devices
- **Design for visual comfort** — Ensure users can achieve their primary goal by keeping necessary objects within their [Field of view](spatial-layout.md#Field-of-view)
- **Place content at a comfortable viewing distance** — For instance, to maintain user comfort during extended reading or engagement, aim to position content at least one meter away
- **Prefer using standard UI components** — System-provided elements respond predictably when viewed by users
- **Minimize visual distractions** — High levels of visual noise complicate users' ability to locate specific elements
- **Make it easy for people to look at an item by providing enough space around it** — Since eyes naturally make minor, rapid directional adjustments even while focused on a single point, grouping UI elements too closely makes it…
- **Avoid using a repeating pattern or texture that fills the field of view** — In certain instances, users' eyes may fixate on individual elements within a pattern or texture, leading to the perception that those elements…
- **Consider using subtle visual cues to encourage people to look at the item they’re most likely to want** — For instance, positioning the item near the center of the field of view or employing techniques such as gentle movement, heightened contrast…
- **In general, give an interactive item a rounded shape** — Since human vision naturally tends toward corners, maintaining focus on the center of a sharp-angled shape can be challenging
- **Use a custom hover effect to highlight or improve a specific moment in the user experience** — Users are accustomed to standard hover effects providing visual confirmation or supplementary details (such as in tooltips or tab bars), making a…
- **Select the appropriate delay** — The custom hover effect can appear immediately, after a brief pause, or after a longer interval, depending on the expected user interaction…
- **No delay (default)** — A custom hover effect that appears instantly is particularly effective when the animation is subtle or invites immediate interaction, such as a…

## Full guidance
Read the referenced files for the complete Apple guidance on this topic:
- @references/guidelines-overview.md
- @references/guidelines-best-practices.md
- @references/guidelines-making-items-easy-to-see.md
- @references/guidelines-encouraging-interaction.md
- @references/guidelines-custom-hover-effects.md
