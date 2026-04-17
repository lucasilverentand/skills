---
name: context-menus
description: "A context menu grants access to item-specific functionality without adding visual clutter to the interface. Use when designing context menus for macOS, auditing context menus against Apple's macOS guidelines, or when the user says things like \"design context menus for Mac\", \"context menus on macOS\", \"how should context menus work on Mac\"."
allowed-tools: Read Grep Glob
---

# Context menus
A context menu grants access to item-specific functionality without adding visual clutter to the interface

## When to use
- User asks about **context menus** on macOS (e.g. `"how do I design context menus for Mac"`).
- User is building a Mac UI that needs context menus and wants to follow Apple's guidelines.
- User asks to audit or review context menus in a macOS design.
- User mentions context menus in the context of a Mac app, game, or interface.

Although a context menu offers convenient access to frequently used options, it is hidden by default, meaning users may not immediately realize its presence. To display a context menu, users generally select content or view and then perform an action using the input methods supported by their current setup. For example:

- The system-defined touch or pinch and hold gesture in visionOS, iOS, and iPadOS
- Pressing the Control key while clicking a pointing device in macOS and iPadOS
- Using a secondary click on a Magic Trackpad in macOS or iPadOS

### Best practices
- **Prioritize relevancy when choosing items to include in a context menu.** A context menu is not intended for advanced or rarely used options; rather, its purpose is to enable users to quickly access the commands most likely needed for their current task. For instance, a Mail message in the Inbox context menu includes commands like replying and moving, but excludes options for editing content, managing mailboxes, or filtering.
- **Aim for a small number of menu items.** Context menus that are excessively long become difficult to scan and scroll through.
- **Support context menus consistently throughout your app.** If you implement context menus for certain items but omit them from others, users may be confused about where the feature applies or might believe there is a bug.
- **Always make context menu items available in the main interface, too.** For example, in iOS and iPadOS Mail, context menu items available for an Inbox message are also present in the message view's toolbar. In macOS, the app’s menu bar menus list all commands, including those found across many context menus.
- **If you need to use submenus to manage a menu’s complexity, keep them to one level.** A submenu is a menu item that reveals a secondary menu containing logically related commands. While submenus can shorten and clarify a context menu, exceeding one level complicates the user experience and makes navigation difficult. If you must include a submenu, title it intuitively so users can predict its contents without opening it. For guidance, refer to [Submenus](menus.md#Submenus).
- **Hide unavailable menu items, don’t dim them.** Unlike standard menus, which help users discover available actions even when an action is unavailable, a context menu should only display actions relevant to the currently selected view or content. In macOS, Cut, Copy, and Paste menu items are exceptions and may appear unavailable if they do not apply to the current context.
- **Aim to place the most frequently used menu items where people are likely to encounter them first.** When a context menu appears, users often begin reading from the location closest to where their finger or pointer triggered it. Depending on the selected content's position, a context menu may open above or below it, requiring you to potentially reverse the item order to match the menu's orientation.
- **Show keyboard shortcuts in your app’s main menus, not in context menus.** Context menus already provide a shortcut for task-specific commands, making it redundant to also display keyboard shortcuts there.
- **Follow best practices for using separators.** Similar to other menu types, you can use separators in a context menu to group items and improve scanning speed. Generally, limit the number of groups within a context menu to about three. For guidance, see [Menus](menus.md).
- **In iOS, iPadOS, and visionOS, warn people about context menu items that can destroy data.** If you include potentially destructive actions in your context menu—such as Delete or Remove—list them at the end of the menu and mark them as destructive (see [destructive] for developer guidance on how the system displays a destructive menu item using red text).

### Content
Context menus rarely feature a main title. However, every item within the menu must have a brief label that accurately describes its function. For detailed guidance, refer to [Menus > Labels](menus.md#Labels).

- **Include a title in a context menu only if doing so clarifies the menu’s effect.** For example, when users select multiple Mail messages and tap the Mark toolbar button on iOS and iPadOS, the resulting context menu displays a title indicating the count of selected messages. This serves as a reminder that the chosen command applies to all selected items.
- **Represent menu item actions with familiar icons.** Icons help users recognize common actions throughout your application. Use the same system icons to represent operations such as Copy, Share, and Delete wherever they appear. For a list of these common action icons, see [Standard icons](icons.md#Standard-icons). Additional guidance can be found in [Menus](menus.md).

## Platform guidance — macOS
On macOS, a context menu may occasionally be referred to as a *contextual* menu.
