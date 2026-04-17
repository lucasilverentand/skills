---
name: context-menus
description: "A context menu grants access to item-specific functionality without adding visual clutter to the interface. Use when designing context menus for iOS and iPadOS, auditing context menus against Apple's iOS and iPadOS guidelines, or when the user says things like \"design context menus for iPhone\", \"context menus on iOS and iPadOS\", \"how should context menus work on iPhone\"."
allowed-tools: Read Grep Glob
---

# Context menus
A context menu grants access to item-specific functionality without adding visual clutter to the interface

## When to use
- User asks about **context menus** on iOS and iPadOS (e.g. `"how do I design context menus for iPhone"`).
- User is building an iPhone UI that needs context menus and wants to follow Apple's guidelines.
- User asks to audit or review context menus in an iOS and iPadOS design.
- User mentions context menus in the context of an iPhone app, game, or interface.

## Quick principles
- **Prioritize relevancy when choosing items to include in a context menu** — A context menu is not intended for advanced or rarely used options; rather, its purpose is to enable users to quickly access…
- **Aim for a small number of menu items** — Context menus that are excessively long become difficult to scan and scroll through
- **Support context menus consistently throughout your app** — If you implement context menus for certain items but omit them from others, users may be confused about where the feature applies…
- **Always make context menu items available in the main interface, too** — For example, in iOS and iPadOS Mail, context menu items available for an Inbox message are also present in the message view's…
- **If you need to use submenus to manage a menu’s complexity, keep them to one level** — A submenu is a menu item that reveals a secondary menu containing logically related commands
- **Hide unavailable menu items, don’t dim them** — Unlike standard menus, which help users discover available actions even when an action is unavailable, a context menu should only display actions…
- **Aim to place the most frequently used menu items where people are likely to encounter them first** — When a context menu appears, users often begin reading from the location closest to where their finger or pointer triggered it
- **Show keyboard shortcuts in your app’s main menus, not in context menus** — Context menus already provide a shortcut for task-specific commands, making it redundant to also display keyboard shortcuts there
- **Follow best practices for using separators** — Similar to other menu types, you can use separators in a context menu to group items and improve scanning speed
- **In iOS, iPadOS, and visionOS, warn people about context menu items that can destroy data** — If you include potentially destructive actions in your context menu—such as Delete or Remove—list them at the end of the menu and…
- **Include a title in a context menu only if doing so clarifies the menu’s effect** — For example, when users select multiple Mail messages and tap the Mark toolbar button on iOS and iPadOS, the resulting context menu…
- **Represent menu item actions with familiar icons** — Icons help users recognize common actions throughout your application

## Full guidance
Read the referenced files for the complete Apple guidance on this topic:
- @references/guidelines.md
