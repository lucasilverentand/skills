---
name: toolbars
description: "A toolbar provides users with convenient access to frequently used commands, controls, navigation options, and search features. Use when designing toolbars for tvOS, auditing toolbars against Apple's tvOS guidelines, or when the user says things like \"design toolbars for Apple TV\", \"toolbars on tvOS\", \"how should toolbars work on Apple TV\"."
allowed-tools: Read Grep Glob
---

# Toolbars
A toolbar provides users with convenient access to frequently used commands, controls, navigation options, and search features

## When to use
- User asks about **toolbars** on tvOS (e.g. `"how do I design toolbars for Apple TV"`).
- User is building an Apple TV UI that needs toolbars and wants to follow Apple's guidelines.
- User asks to audit or review toolbars in a tvOS design.
- User mentions toolbars in the context of an Apple TV app, game, or interface.

## Quick principles
- **Select items intentionally to prevent clutter** — Users must be able to clearly distinguish and activate each item, so limit the number of items in the toolbar
- **Include a More menu for supplementary actions** — Place less critical functions within the More menu
- **In iPadOS and macOS applications, consider allowing users to personalize the toolbar with their most frequently used items** — Toolbar customization is particularly beneficial for apps that contain a large number of controls, or those offering advanced features that may not…
- **Minimize the use of toolbar backgrounds and tinted controls** — Any custom appearances or backgrounds you apply might conflict with background effects provided by the system
- **Avoid matching toolbar item label colors with those of the content layer backgrounds** — If your application already features bright or colorful content in the content layer, it is preferable to use the default monochromatic appearance…
- **Prefer using standard components within a toolbar** — By default, standard buttons, text fields, headers, and footers feature corner radii that align concentrically with the bar's corners
- **Consider temporarily concealing toolbars for a distraction-free experience** — Sometimes, users appreciate a minimal interface to reduce distractions or reveal more content
- **Ensure each window has a descriptive title** — A title assists users in confirming their current location within the application and distinguishes between multiple concurrently open windows
- **Avoid using your application name for window titles** — Since your app's name does not convey useful information regarding the content hierarchy or any specific window within your application, it makes…
- **Keep titles brief and focused** — Aim for a single word or short phrase that encapsulates the view's purpose, ensuring the title remains under 15 characters to accommodate…
- **Use the standard Back and Close buttons** — Users expect the conventional Back button to allow them to reverse navigation steps within a hierarchy, and the standard Close button is…
- **Provide actions that support the main tasks people perform** — Generally, prioritize commands based on how likely users are to want them

## Full guidance
Read the referenced files for the complete Apple guidance on this topic:
- @references/guidelines-overview.md
- @references/guidelines-best-practices.md
- @references/guidelines-titles.md
- @references/guidelines-navigation.md
- @references/guidelines-actions.md
- @references/guidelines-item-groupings.md
