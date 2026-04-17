# Window menu
The Window menu allows users to manage, organize, and navigate an application's open windows.

> **Important**
> The Window menu is not intended for customizing window appearance or closing windows. To adjust a window's look, use commands found in the [View menu](#View-menu); to close a window, select Close within the [File menu](#File-menu).

- **Provide a Window menu even if your application only utilizes a single window.** Include the Minimize and Zoom items to enable users with Full Keyboard Access to invoke these functions via keyboard commands.
- **Consider including menu items for displaying and concealing panels.** A [Panels](panels.md) component offers information, configuration options, or tools for interacting with content in the main window and usually appears only when required. Since the Format menu lists these panels, there is no need to include access for the font panel or text color panel.

The Window menu typically includes the following top-level items, presented in this specific sequence.

|Menu item|Action|Guidance|
|---|---|---|
|Minimize|Minimizes the currently active window into the Dock. Pressing the Option key changes this item to Minimize All.||
|Zoom|Switches between a predefined size appropriate for the window's content and the user-defined window size. Pressing the Option key changes this item to Zoom All.|Avoid using Zoom to enter or exit full-screen mode. The [View menu](#View-menu) handles these functions.|
|Show Previous Tab|Displays the tab preceding the current tab in a tabbed window.||
|Show Next Tab|Displays the tab following the current tab in a tabbed window.||
|Move Tab to New Window|Opens the selected tab within a new window.||
|Merge All Windows|Combines all currently open windows into one single tabbed window.||
|Enter/Exit Full Screen|In an application that supports [Going full screen](going-full-screen.md), opens the window at its full-screen dimension in a new space.|Include this item in the Window menu only if your app lacks a View menu. If this is the case, you must still provide separate Minimize and Zoom items.|
|Bring All to Front|Brings all of the application's open windows into view, preserving their onscreen location, size, and layering order. (This action is identical to clicking the app icon in the Dock.) Pressing the Option key changes this item to Arrange in Front, which brings an app’s windows into the foreground using a neatly tiled arrangement.||
|*Name of an open app-specific window*|Brings the selected window to the front.|List all currently open windows in alphabetical order for easy scanning. Do not list panels or other modal views.|
