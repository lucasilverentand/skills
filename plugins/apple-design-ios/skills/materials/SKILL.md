---
name: materials
description: "A material is a visual effect that establishes depth, layering, and hierarchy between foreground and background elements. Use when designing materials for iOS and iPadOS, auditing materials against Apple's iOS and iPadOS guidelines, or when the user says things like \"design materials for iPhone\", \"materials on iOS and iPadOS\", \"how should materials work on iPhone\"."
allowed-tools: Read Grep Glob
---

# Materials
A material is a visual effect that establishes depth, layering, and hierarchy between foreground and background elements

## When to use
- User asks about **materials** on iOS and iPadOS (e.g. `"how do I design materials for iPhone"`).
- User is building an iPhone UI that needs materials and wants to follow Apple's guidelines.
- User asks to audit or review materials in an iOS and iPadOS design.
- User mentions materials in the context of an iPhone app, game, or interface.

## Quick principles
- **Do not apply Liquid Glass to the content layer** — Liquid Glass functions optimally when it clearly separates interactive elements from content; including it in the content layer can introduce unnecessary complexity…
- **Use Liquid Glass effects judiciously** — Standard system framework components automatically adopt the appearance and behavior of this material
- **Only use clear Liquid Glass for components layered over visually rich backgrounds** — Liquid Glass offers two variants—[regular](apple:SwiftUI/Glass/regular) and [clear](apple:SwiftUI/Glass/clear)—which you select when building custom components or styling system components
- **Select materials and effects based on their semantic meaning and intended application** — Do not choose a material or effect based on the apparent color it imparts to your interface, as system settings can alter…
- **Ensure readability by applying vibrant colors over materials** — When utilizing system-defined vibrant colors, you do not need to concern yourself with whether the color appears too dark, bright, saturated, or…

## Full guidance
Read the referenced files for the complete Apple guidance on this topic:
- @references/guidelines.md
