---
name: edit-menus
description: "An edit menu allows users to modify selected content within the current view, alongside offering associated actions such as Copy, Select, Translate, and Look Up. Use when designing edit menus for iOS and iPadOS, auditing edit menus against Apple's iOS and iPadOS guidelines, or when the user says things like \"design edit menus for iPhone\", \"edit menus on iOS and iPadOS\", \"how should edit menus work on iPhone\"."
allowed-tools: Read Grep Glob
---

# Edit menus
An edit menu allows users to modify selected content within the current view, alongside offering associated actions such as Copy, Select, Translate, and Look Up

## When to use
- User asks about **edit menus** on iOS and iPadOS (e.g. `"how do I design edit menus for iPhone"`).
- User is building an iPhone UI that needs edit menus and wants to follow Apple's guidelines.
- User asks to audit or review edit menus in an iOS and iPadOS design.
- User mentions edit menus in the context of an iPhone app, game, or interface.

Beyond text, an edit menu's commands can apply to different types of selectable content, including images, files, and structured objects like contact cards, charts, or map locations. On iOS, iPadOS, and visionOS, the system automatically determines the data type of a selected item, which may result in adding a relevant action to the edit menu. For instance, selecting an address might add *Get directions* to the menu.

The appearance and behavior of edit menus vary across platforms.

- In iOS, the edit menu presents commands in a compact, horizontal list that appears when content is selected via touch and hold or double-tap. Users can tap a chevron on the trailing edge to expand it into a [Context menus](context-menus.md).
- In iPadOS, the edit menu differs based on how it is invoked. When revealed through touch interactions, it uses a compact, horizontal display. Conversely, when accessed using a keyboard or pointing device, the edit menu opens as a full context menu.
- In macOS, users can access editing commands through a context menu they reveal during an editing task, as well as via the app’s [Edit menu](the-menu-bar.md#Edit-menu) in the menu bar.
- In visionOS, users can open the edit menu as a horizontal bar using the standard [Standard gestures](gestures.md#Standard-gestures) gesture, or they can open it in a context menu.

Since editing is uncommon in tvOS and watchOS experiences, the system does not provide an edit menu for these platforms.

### Best practices
- **Prioritize the system's built-in edit menu.** Since users are already familiar with the contents and behavior of the system component, creating a custom menu that replicates these commands is unnecessary and likely to cause confusion. Refer to [UIResponderStandardEditActions](apple:UIKit/UIResponderStandardEditActions) for a complete list of standard edit menu commands.
- **Allow users to reveal an edit menu using established system interactions.** For instance, on a touchscreen, this might involve touch and hold; in visionOS, pinch and hold; or using a secondary click with an attached trackpad or keyboard. While the specific interactions vary by platform, users should not be forced to learn a unique interaction simply to execute a standard task.
- **Present commands relevant to the current context, hiding or dimming inapplicable options.** For example, if no content is selected, commands requiring a selection (like Copy or Cut) should be suppressed. Similarly, do not display Paste if there is no content available to paste.
- **Position custom commands near analogous system-provided options.** If you introduce custom formatting commands, listing them immediately following the system-provided equivalents (e.g., in the format section) helps maintain user expectations regarding command ordering. Furthermore, restrict the number of custom commands to prevent overwhelming the user.
- **Enable selection and copying of noneditable text when appropriate.** Users value the ability to paste static content—such as a social media caption or image description—into an application message, note, or search query. Generally, allow users to copy text content, but restrict the copying of control labels.
- **Support undo and redo functionality whenever feasible.** Like all menus, an edit menu does not require confirmation to execute actions, allowing users to easily employ undo and redo to revert to a previous state. Consult [Undo and redo](undo-and-redo.md) for guidance on implementation.
- **Generally, avoid implementing controls that duplicate edit menu functions.** Users typically expect to find standard edit commands within the edit menu or via conventional keyboard shortcuts. Offering redundant controls can clutter the interface, reducing available space for actions users may not yet be aware of.
- **Distinguish between different types of deletion commands when necessary.** For example, a Delete menu item functions identically to pressing the Delete key, whereas a Cut menu item copies the selected content to the system pasteboard before removing it.

### Content
**Develop concise labels for custom commands.** Employ verbs or brief verb phrases that accurately summarize the command's function. Refer to [Labels](labels.md) for examples and guidance.

## Platform guidance — iOS & iPadOS
- **Ensure your edit menu functions correctly in both display modes.** The system presents the compact, horizontal layout when Multi-Touch gestures are used to invoke the menu, and the vertical style appears when a keyboard or pointing device is utilized. For guidance on the vertical menu arrangement, please consult [iOS, iPadOS](menus.md#iOS-iPadOS).
- **Adjust an edit menu's placement, if required.** The default location of the menu—above or below the insertion point or selection—is determined by available screen real estate. The system also displays a visual indicator pointing to the targeted content. Although you cannot alter the menu's shape or its pointer, its position is customizable. For example, moving the menu may be necessary to prevent it from covering important content or parts of your interface.
