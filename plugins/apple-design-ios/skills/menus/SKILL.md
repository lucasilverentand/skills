---
name: menus
description: "A menu displays its available choices when users interact with it, offering a space-efficient method for presenting commands within your application or game. Use when designing menus for iOS and iPadOS, auditing menus against Apple's iOS and iPadOS guidelines, or when the user says things like \"design menus for iPhone\", \"menus on iOS and iPadOS\", \"how should menus work on iPhone\"."
allowed-tools: Read Grep Glob
---

# Menus
A menu displays its available choices when users interact with it, offering a space-efficient method for presenting commands within your application or game

## When to use
- User asks about **menus** on iOS and iPadOS (e.g. `"how do I design menus for iPhone"`).
- User is building an iPhone UI that needs menus and wants to follow Apple's guidelines.
- User asks to audit or review menus in an iOS and iPadOS design.
- User mentions menus in the context of an iPhone app, game, or interface.

## Quick principles
- **Ensure that each menu item has a label that is both clear and concise** — Generally, if a menu item triggers an action, label it using a verb or verb phrase that describes that action (e.g., View…
- **To maintain consistency with platform experiences, use title-style capitalization** — While a game might employ a different writing convention, generally favor title-style capitalization
- **Indicate when a menu item is unavailable** — An unavailable menu item often appears dimmed and will not respond to user interaction
- **Append an ellipsis (…) to a menu item’s label when the action requires further information before completion** — The ellipsis signals that users must input data or make additional choices, typically within a subsequent view
- **Represent menu item actions with familiar icons** — Icons assist users in recognizing common functions throughout the application
- **Don’t display an icon if you can’t find one that clearly represents the menu item** — Not all menu options require an icon
- **Prioritize placing the most important or frequently accessed menu items first** — Since users typically begin scanning a menu from the top, leading with high-priority options allows them to locate desired items quickly without…
- **Group commands that are logically related** — For instance, grouping editing functions like Copy, Cut, and Paste, or camera controls such as Look Up, Look Down, and Look Left…
- **Maintain all logically connected commands within the same group, even if they vary in usage frequency** — For example, while Paste and Match Style might be used less often than Paste, users anticipate finding both commands alongside the more…
- **Pay attention to menu length** — Longer menus require more time and focus from the user, increasing the likelihood they might miss their desired command
- **Use submenus sparingly** — Each submenu introduces interface complexity and conceals the items it holds
- **Limit the depth and length of submenus** — Since revealing multiple levels of hierarchical menus can be difficult for users, it is usually best to restrict them to a single…

## Full guidance
Read the referenced files for the complete Apple guidance on this topic:
- @references/guidelines-overview.md
- @references/guidelines-labels.md
- @references/guidelines-icons.md
- @references/guidelines-organization.md
- @references/guidelines-submenus.md
- @references/guidelines-toggled-items.md
- @references/guidelines-in-game-menus.md
