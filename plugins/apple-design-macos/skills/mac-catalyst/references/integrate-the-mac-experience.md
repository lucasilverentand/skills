# Integrate the Mac experience
When leveraging Mac Catalyst to build a macOS version of your iPad application, it is crucial that the resulting Mac app provides users with an authentic Mac experience. Regardless of the chosen implementation approach, simply displaying your iPadOS layout within a macOS window is insufficient.

iPadOS and macOS establish distinct patterns and conventions based on how users interact with each operating system. Before beginning the process of updating specific controls and views, familiarize yourself thoroughly with the core differences between the two platforms to ensure you build a successful Mac application.

#### Navigation
Many iPad and Mac applications organize data similarly, but they employ distinct controls and visual cues to assist users in understanding and moving through that information.

Typically, iPad applications utilize the following components for content and feature organization:

- [Split views](split-views.md). A split view supports hierarchical navigation, which involves a two- or three-column layout presenting a primary column, an optional secondary column, and a content pane. Often, apps employ the primary column to establish a sidebar-based interface where selections in the sidebar dictate changes in the optional secondary column, which subsequently affects the content displayed.
- [Tab bars](tab-bars.md). A tab bar facilitates flat navigation by displaying high-level categories within a persistent bar located at the bottom of the screen.
- [Page controls](page-controls.md). A page control uses dots at the bottom of the screen to indicate the current position within a linear sequence of pages.

If your iPad application incorporates a tab bar, consider pairing it with either a split view featuring a sidebar or a segmented control. Both options mirror macOS navigation conventions. When deciding between a split view and a segmented control, consider the following:

- A split view with a sidebar presents a list of primary items, each capable of revealing a submenu of child items. Utilizing a sidebar streamlines navigation because the contents of each tab are accessible within that sidebar. By implementing a sidebar on both iPad and Mac, you establish a consistent layout, making it easier for iPad users to transition to the Mac version of your app.
- A segmented control and a tab bar both handle comparable interactions, such as mutually exclusive selection. Generally, using a split view instead of a tab bar proves more effective than employing a segmented control. However, a segmented control can function well on Mac if your app maintains a flat navigation structure.
- **Ensure users maintain access to critical tab-bar items in the Mac version of your application.** Regardless of whether you substitute a tab bar with a split view or a segmented control in your iPad app, provide users with rapid access to top-level items by listing them within the macOS View menu.
- **Provide multiple methods for moving between pages.** Mac users—particularly those navigating with a pointing device or keyboard alone—value Next and Previous buttons in addition to the iPad or trackpad gestures that allow swiping between pages.

#### Inputs
While both iPad and Mac support input from different devices (like mice, keyboards, and trackpads), touch interactions form the foundation of iPadOS conventions. Conversely, macOS conventions are primarily informed by keyboard and mouse inputs.

When developing your Mac app using Mac Catalyst, most iPadOS gestures translate automatically:

|iPadOS gesture…|Translates to mouse interaction|
|---|---|
|Tap|Left or right click|
|Touch and hold|Click and hold|
|Pan|Left click and drag|
|iPadOS gesture…|Translates to trackpad gesture|
|---|---|
|Tap|Click|
|Touch and hold|Click and hold|
|Pan|Click and drag|
|Pinch|Pinch|
|Rotate|Rotate|

> **Developer note**
> The system transmits the two touches used in pinch and rotate gestures to the view located beneath the pointer, rather than the view under each individual touch.

#### App icons
Develop a dedicated macOS version for your application icon. High-quality macOS icons should feature the lifelike rendering style users expect within the OS while ensuring visual consistency across all platforms.

#### Layout
To optimize the layout for the wider Mac screen and ensure a positive user experience, consider these updates:

- Break down a single-column layout of content and actions into multiple columns.
- Utilize `regular-width` and `regular-height` size classes, and consider arranging content elements side-by-side as the window is resized.
- Display an inspector UI adjacent to the primary content rather than using a popover.
- **Consider migrating controls from the main UI of your iPad application to the toolbar within your Mac application.** Ensure that these controls are also listed in the menus of the Mac app's menu bar.
- **Adopt a top-down flow whenever feasible.** Since Mac applications position the most critical actions and content toward the top of the window, if your iPad app uses a toolbar for controls, place those same controls in the macOS version's window toolbar.
- **Relocate buttons that are currently on the side or bottom edges of the screen.** While placing controls on these edges aids reachability on iPad, this ergonomic benefit does not translate to Mac. You should consider moving these controls elsewhere or placing them in the macOS window toolbar.

#### Menus
Mac users are accustomed to the persistent menu bar and anticipate finding all application commands there. Conversely, iPadOS lacks a persistent menu bar, and iPad users expect to locate app commands either within the application's UI or in the shortcut interface that appears when they hold the Command key on a connected keyboard.

> **Developer note**
> To enable keyboard shortcuts for menu commands, utilize [UIKeyCommand](apple:UIKit/UIKeyCommand). For guidance on this process, refer to [Adding menus and shortcuts to the menu bar and user interface](apple:UIKit/adding-menus-and-shortcuts-to-the-menu-bar-and-user-interface).

If your iPad app provides [pop-up buttons](pop-up-buttons.md) or [pull-down buttons](pull-down-buttons.md) that display a menu, this menu will automatically adopt a macOS appearance in the Mac app you build using Mac Catalyst.

> **Developer note**
> To implement and manage custom application menus, employ [UIMenuBuilder](apple:UIKit/UIMenuBuilder) and include menu items that correspond to your iPad app's commands using [UICommand](apple:UIKit/UICommand).

The system automatically translates the context menus from your iPad app into context menus within the macOS version of your application. As you develop the Mac counterpart, consider additional locations where context menus might be supported. It is worth noting that Mac users often expect every object in your app to offer a context menu with relevant actions. Keep in mind that on macOS, a context menu is sometimes referred to as a *contextual* menu.
