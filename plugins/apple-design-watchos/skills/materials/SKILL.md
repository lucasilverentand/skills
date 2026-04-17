---
name: materials
description: "A material is a visual effect that establishes depth, layering, and hierarchy between foreground and background elements. Use when designing materials for watchOS, auditing materials against Apple's watchOS guidelines, or when the user says things like \"design materials for Apple Watch\", \"materials on watchOS\", \"how should materials work on Apple Watch\"."
allowed-tools: Read Grep Glob
---

# Materials
A material is a visual effect that establishes depth, layering, and hierarchy between foreground and background elements

## When to use
- User asks about **materials** on watchOS (e.g. `"how do I design materials for Apple Watch"`).
- User is building an Apple Watch UI that needs materials and wants to follow Apple's guidelines.
- User asks to audit or review materials in a watchOS design.
- User mentions materials in the context of an Apple Watch app, game, or interface.

## Quick principles
- **Do not apply Liquid Glass to the content layer** — Liquid Glass functions optimally when it clearly separates interactive elements from content; including it in the content layer can introduce unnecessary complexity…
- **Use Liquid Glass effects judiciously** — Standard system framework components automatically adopt the appearance and behavior of this material
- **Only use clear Liquid Glass for components layered over visually rich backgrounds** — Liquid Glass offers two variants—[regular](apple:SwiftUI/Glass/regular) and [clear](apple:SwiftUI/Glass/clear)—which you select when building custom components or styling system components
- **Select materials and effects based on their semantic meaning and intended application** — Do not choose a material or effect based on the apparent color it imparts to your interface, as system settings can alter…
- **Ensure readability by applying vibrant colors over materials** — When utilizing system-defined vibrant colors, you do not need to concern yourself with whether the color appears too dark, bright, saturated, or…

## Full guidance
Read the referenced files for the complete Apple guidance on this topic:
- @references/guidelines.md
