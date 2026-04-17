---
name: keyboards
description: "A physical keyboard serves as a critical input device for different functions, including text entry, gaming, and application control. Use when designing keyboards for visionOS, auditing keyboards against Apple's visionOS guidelines, or when the user says things like \"design keyboards for Apple Vision Pro\", \"keyboards on visionOS\", \"how should keyboards work on Apple Vision Pro\"."
allowed-tools: Read Grep Glob
---

# Keyboards
A physical keyboard serves as a critical input device for different functions, including text entry, gaming, and application control

## When to use
- User asks about **keyboards** on visionOS (e.g. `"how do I design keyboards for Apple Vision Pro"`).
- User is building an Apple Vision Pro UI that needs keyboards and wants to follow Apple's guidelines.
- User asks to audit or review keyboards in a visionOS design.
- User mentions keyboards in the context of an Apple Vision Pro app, game, or interface.

## Quick principles
- **Ensure comprehensive keyboard accessibility when feasible** — Available across iOS, iPadOS, macOS, and visionOS, Full Keyboard Access enables users to navigate and trigger windows, menus, controls, and system functions…
- **Adhere to conventional keyboard shortcuts** — Most users expect that when using different applications, they can rely on the standard keyboard shortcuts common across the system and other…
- **Generally, avoid repurposing standard keyboard shortcuts for custom functions** — Users may become confused if the actions of familiar shortcuts differ within your application or game
- **Define custom keyboard shortcuts only for commands that are most frequently used within your app** — Users value keyboard shortcuts for actions they perform often, but introducing too many new combinations can make your application seem difficult to…
- **Utilize modifier keys in ways that align with user expectations** — For instance, pressing Command while dragging groups items together, and holding Shift during drag-resizing constrains the scaling to maintain the item’s aspect…
- **List modifier keys in the correct sequence** — If a custom shortcut requires more than one modifier key, they must always be listed in this specific order: Control, Option, Shift…
- **Do not add Shift to a shortcut that already uses the uppercase character of a two-character key** — Users are already aware they must hold Shift to input an upper case character from a two-character key, making it clearer simply…
- **Allow the system to localize and mirror your keyboard shortcuts as necessary** — The operating system automatically adapts a shortcut’s primary and modifier keys to match the currently connected keyboard; if your application or game…
- **Do not create a new shortcut by adding a modifier to an existing shortcut for an unrelated function** — For example, since users are accustomed to using Command-Z to reverse an action, it would be confusing to assign Shift-Command-Z to a…
- **Write descriptive shortcut titles** — Since the shortcut interface presents a flat list of all items within each category, you cannot use submenu titles to provide context…
- **Recognize that users see an overlay when they use a physical keyboard with your visionOS app or game** — When a physical keyboard is connected while using your visionOS application or game, the system displays a virtual keyboard overlay that offers…

## Full guidance
Read the referenced files for the complete Apple guidance on this topic:
- @references/overview.md
- @references/best-practices.md
- @references/standard-keyboard-shortcuts.md
- @references/custom-keyboard-shortcuts.md
- @references/platform-guidance-visionos.md
