---
name: dock-menus
description: "On macOS, a secondary click on an application or game icon in the Dock displays a menu that includes both system-provided and custom options. Use when designing dock menus for macOS, auditing dock menus against Apple's macOS guidelines, or when the user says things like \"design dock menus for Mac\", \"dock menus on macOS\", \"how should dock menus work on Mac\"."
allowed-tools: Read Grep Glob
---

# Dock menus
On macOS, a secondary click on an application or game icon in the Dock displays a menu that includes both system-provided and custom options

## When to use
- User asks about **dock menus** on macOS (e.g. `"how do I design dock menus for Mac"`).
- User is building a Mac UI that needs dock menus and wants to follow Apple's guidelines.
- User asks to audit or review dock menus in a macOS design.
- User mentions dock menus in the context of a Mac app, game, or interface.

The items provided by the system within the Dock menu will vary depending on whether the application is currently running. For example, the Safari Dock menu includes commands for actions such as viewing an active window or creating a new one.

> **Note**
> Although iOS and iPadOS do not support a Dock menu, users can reveal a comparable collection of system-provided and custom options—called Home Screen quick actions—by long pressing an app icon on the Home Screen or in the Dock. For guidance, see [Home Screen quick actions](home-screen-quick-actions.md).

### Best practices
All menus require that Dock menu items are labeled concisely and arranged logically. Refer to [Menus](menus.md) for detailed guidance.

- **Ensure custom Dock menu items are accessible in other locations as well.** Since not all users rely solely on the Dock menu, it is crucial to provide identical commands elsewhere, such as within your main menu bar or throughout the application interface.
- **Prioritize high-utility custom items for your Dock menu.** For instance, a Dock menu could list all currently or recently active windows, providing users with an easy way to switch between them. Additionally, consider including key actions that are most likely needed when the application is backgrounded or if no windows are currently open. For example, Mail includes options for retrieving new mail and composing a new message alongside the list of open windows.
