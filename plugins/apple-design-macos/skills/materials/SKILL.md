---
name: materials
description: "A material is a visual effect that establishes depth, layering, and hierarchy between foreground and background elements. Use when designing materials for macOS, auditing materials against Apple's macOS guidelines, or when the user says things like \"design materials for Mac\", \"materials on macOS\", \"how should materials work on Mac\"."
allowed-tools: Read Grep Glob
---

# Materials
A material is a visual effect that establishes depth, layering, and hierarchy between foreground and background elements

## When to use
- User asks about **materials** on macOS (e.g. `"how do I design materials for Mac"`).
- User is building a Mac UI that needs materials and wants to follow Apple's guidelines.
- User asks to audit or review materials in a macOS design.
- User mentions materials in the context of a Mac app, game, or interface.

## Quick principles
- **Do not apply Liquid Glass to the content layer** — Liquid Glass functions optimally when it clearly separates interactive elements from content; including it in the content layer can introduce unnecessary complexity…
- **Use Liquid Glass effects judiciously** — Standard system framework components automatically adopt the appearance and behavior of this material
- **Only use clear Liquid Glass for components layered over visually rich backgrounds** — Liquid Glass offers two variants—[regular](apple:SwiftUI/Glass/regular) and [clear](apple:SwiftUI/Glass/clear)—which you select when building custom components or styling system components
- **Select materials and effects based on their semantic meaning and intended application** — Do not choose a material or effect based on the apparent color it imparts to your interface, as system settings can alter…
- **Ensure readability by applying vibrant colors over materials** — When utilizing system-defined vibrant colors, you do not need to concern yourself with whether the color appears too dark, bright, saturated, or…
- **Choose when to allow vibrancy in custom views and controls** — System views and controls utilize vibrancy, based on configuration and system settings, to ensure foreground content remains prominent regardless of the background
- **Choose a background blending mode that complements your interface design** — macOS defines two modes for blending background content: behind window and within window

## Full guidance
Read the referenced files for the complete Apple guidance on this topic:
- @references/guidelines.md
