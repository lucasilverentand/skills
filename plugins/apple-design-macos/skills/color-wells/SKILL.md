---
name: color-wells
description: "The color well enables users to modify the hue of text, shapes, guides, and other displayed components. Use when designing color wells for macOS, auditing color wells against Apple's macOS guidelines, or when the user says things like \"design color wells for Mac\", \"color wells on macOS\", \"how should color wells work on Mac\"."
allowed-tools: Read Grep Glob
---

# Color wells
The color well enables users to modify the hue of text, shapes, guides, and other displayed components

## When to use
- User asks about **color wells** on macOS (e.g. `"how do I design color wells for Mac"`).
- User is building a Mac UI that needs color wells and wants to follow Apple's guidelines.
- User asks to audit or review color wells in a macOS design.
- User mentions color wells in the context of a Mac app, game, or interface.

When a user taps or clicks the color well, it reveals a color picker. This picker may be the standard system implementation or a custom interface developed by you.

### Best practices
**Consider the system-provided color picker for a familiar experience.** Employing the native color picker ensures consistency and allows users to save predefined color sets that are accessible from any application. Additionally, utilizing the system-defined picker helps maintain a familiar experience when developing applications across iOS, iPadOS, and macOS.

## Platform guidance — macOS
When a color well is clicked, it receives a highlight to visually confirm its active state. This action then opens the color picker, allowing users to select a desired color. Once a selection has been made, the color well updates to display the new hue.

Furthermore, color wells support drag-and-drop operations, enabling users to transfer colors between two color wells or move a color from the picker into a well.
