---
name: materials
description: "A material is a visual effect that establishes depth, layering, and hierarchy between foreground and background elements. Use when designing materials for visionOS, auditing materials against Apple's visionOS guidelines, or when the user says things like \"design materials for Apple Vision Pro\", \"materials on visionOS\", \"how should materials work on Apple Vision Pro\"."
allowed-tools: Read Grep Glob
---

# Materials
A material is a visual effect that establishes depth, layering, and hierarchy between foreground and background elements

## When to use
- User asks about **materials** on visionOS (e.g. `"how do I design materials for Apple Vision Pro"`).
- User is building an Apple Vision Pro UI that needs materials and wants to follow Apple's guidelines.
- User asks to audit or review materials in a visionOS design.
- User mentions materials in the context of an Apple Vision Pro app, game, or interface.

## Quick principles
- **Do not apply Liquid Glass to the content layer** — Liquid Glass functions optimally when it clearly separates interactive elements from content; including it in the content layer can introduce unnecessary complexity…
- **Use Liquid Glass effects judiciously** — Standard system framework components automatically adopt the appearance and behavior of this material
- **Only use clear Liquid Glass for components layered over visually rich backgrounds** — Liquid Glass offers two variants—[regular](apple:SwiftUI/Glass/regular) and [clear](apple:SwiftUI/Glass/clear)—which you select when building custom components or styling system components
- **Select materials and effects based on their semantic meaning and intended application** — Do not choose a material or effect based on the apparent color it imparts to your interface, as system settings can alter…
- **Ensure readability by applying vibrant colors over materials** — When utilizing system-defined vibrant colors, you do not need to concern yourself with whether the color appears too dark, bright, saturated, or…
- **Prioritize translucency over solid, opaque colors in windows** — Areas of opacity can obstruct the user's view, leading to a feeling of constraint and diminishing awareness of the virtual and physical…

## Full guidance
Read the referenced files for the complete Apple guidance on this topic:
- @references/guidelines.md
