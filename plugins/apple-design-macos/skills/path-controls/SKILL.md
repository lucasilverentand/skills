---
name: path-controls
description: "A path control displays the file system location of a chosen file or directory. Use when designing path controls for macOS, auditing path controls against Apple's macOS guidelines, or when the user says things like \"design path controls for Mac\", \"path controls on macOS\", \"how should path controls work on Mac\"."
allowed-tools: Read Grep Glob
---

# Path controls
A path control displays the file system location of a chosen file or directory

## When to use
- User asks about **path controls** on macOS (e.g. `"how do I design path controls for Mac"`).
- User is building a Mac UI that needs path controls and wants to follow Apple's guidelines.
- User asks to audit or review path controls in a macOS design.
- User mentions path controls in the context of a Mac app, game, or interface.

For instance, selecting View > Show Path Bar in the Finder reveals a path bar at the bottom of the window. This bar displays the location of the selected item, or if nothing is chosen, the path to the window’s directory.

There are two types of path controls:

- **Standard.** This is a linear list that includes the root drive, parent folders, and the selected item. Each entry features both an icon and a name. If the list exceeds the control's display capacity, it conceals names between the initial and final items. If the control is made editable, users can drag an item onto it to select it and show its path within the control.
- **Pop up.** This control functions similarly to a [pop-up button](pop-up-buttons.md), showing the icon and name of the selected item. Users can click this item to open a menu containing the root drive, parent folders, and selected item. If the control is made editable, the menu includes an additional Choose command that users can utilize to select and display an item in the control. They also have the option to drag an item onto the control for selection and path display.

### Best practices
Place the path control within the window body, rather than placing it in the window frame. These controls are not designed for use within toolbars or status bars. For example, the path control in Finder is located at the bottom of the window body, not within the status bar.
