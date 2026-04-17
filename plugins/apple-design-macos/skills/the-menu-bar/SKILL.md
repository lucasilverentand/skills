---
name: the-menu-bar
description: "On Mac or iPad, the menu bar at the top of the screen displays your app's or game's primary menus. Use when designing the menu bar for macOS, auditing the menu bar against Apple's macOS guidelines, or when the user says things like \"design the menu bar for Mac\", \"the menu bar on macOS\", \"how should the menu bar work on Mac\"."
allowed-tools: Read Grep Glob
---

# The menu bar
On Mac or iPad, the menu bar at the top of the screen displays your app's or game's primary menus

## When to use
- User asks about **the menu bar** on macOS (e.g. `"how do I design the menu bar for Mac"`).
- User is building a Mac UI that needs the menu bar and wants to follow Apple's guidelines.
- User asks to audit or review the menu bar in a macOS design.
- User mentions the menu bar in the context of a Mac app, game, or interface.

## Quick principles
- **Support the default system-defined menus and their ordering** — Users anticipate finding menu items arranged in a familiar sequence
- **Always show the same set of menu items** — Maintaining visibility of menu options assists users in understanding all actions your application supports, even if those actions are currently unavailable within…
- **Represent menu item actions with familiar icons** — Icons help users quickly identify common functions across your application
- **Support the keyboard shortcuts defined for the standard menu items you include** — Users expect to utilize the keyboard combinations they are accustomed to for common commands such as Copy, Cut, Paste, Save, and Print
- **Prefer short, one-word menu titles** — different elements—including display size variations and the presence of extra menu bar items—can impact the spacing and visual presentation of your menus
- **Place the About menu item first** — Include a separator following the About menu item so that it appears as its own distinct group
- **Determine whether Find menu items belong in the Edit menu** — For instance, if your application supports searching for files or other types of objects, Find menu items might be better suited in…
- **Include a View menu even if your application only implements a subset of the standard view functionalities** — For instance, if your app lacks a tab bar, toolbar, or sidebar but supports full-screen mode, the View menu should contain only…
- **Ensure that every show or hide item title accurately reflects the current state of the corresponding view** — For example, if the toolbar is currently hidden, provide a Show Toolbar menu item; conversely, if it is visible, provide a Hide…
- **Include dedicated menus for commands unique to your application** — Users instinctively check the menu bar when searching for app-specific functions, particularly upon their initial use of the application
- **To the greatest extent possible, mirror your application’s internal hierarchy within these app-specific menus** — For example, Mail arranges its Mailbox, Message, and Format menus in a sequence that reflects the underlying relationships: mailboxes hold messages, and…
- **Organize app-specific menus starting with the most specialized or frequently used commands** — Users generally anticipate that items listed at the beginning of a sequence are more specific than those found toward the end

## Full guidance
Read the referenced files for the complete Apple guidance on this topic:
- @references/overview.md
- @references/anatomy.md
- @references/best-practices.md
- @references/app-menu.md
- @references/file-menu.md
- @references/edit-menu.md
- @references/format-menu.md
- @references/view-menu.md
- @references/app-specific-menus.md
- @references/window-menu.md
- @references/help-menu.md
- @references/dynamic-menu-items.md
- @references/platform-guidance-macos.md
