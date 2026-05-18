# View menu
The View menu allows users to adjust the appearance of any application window, regardless of its specific type.

> **Important**
> The View menu is not used for commands related to navigating between or managing individual windows; those functions are found in the [Window menu](#Window-menu).

- **Include a View menu even if your application only implements a subset of the standard view functionalities.** For instance, if your app lacks a tab bar, toolbar, or sidebar but supports full-screen mode, the View menu should contain only the Enter/Exit Full Screen option.
- **Ensure that every show or hide item title accurately reflects the current state of the corresponding view.** For example, if the toolbar is currently hidden, provide a Show Toolbar menu item; conversely, if it is visible, provide a Hide Toolbar menu item.

The View menu typically includes the following top-level items, presented in this specific sequence:

|Menu item|Action|
|---|---|
|Show/Hide Tab Bar|Controls the visibility of the **Tab bars** located above the main content area in a tabbed window.|
|Show All Tabs/Exit Tab Overview|Enters or exits a view (analogous to Mission Control) that displays an overview of all open tabs in a tab-based window.|
|Show/Hide Toolbar|In a window that utilizes **Toolbars**, this item toggles the toolbar's visibility.|
|Customize Toolbar|In a window containing a toolbar, this option opens a view that allows users to personalize toolbar items.|
|Show/Hide Sidebar|In a window that includes **Sidebars**, this item toggles the sidebar's visibility.|
|Enter/Exit Full Screen|In an application that supports **Going full screen**, this opens the window at its maximum size within a new display space.|
