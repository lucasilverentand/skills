# Sidebars
A sidebar is a view element that appears on the leading edge of a screen, enabling users to move between different sections within your application or game

## Platform guidance — iOS & iPadOS

### iOS
Do not implement a sidebar. Sidebars consume substantial screen space when in landscape orientation and are unavailable in portrait mode. Instead, consider utilizing [Tab bars](tab-bars.md), which is more space-efficient and remains accessible across both orientations.

### iPadOS
When utilizing the `sidebarAdaptable` style of a tab view to display a sidebar, you decide whether your application launches with either a sidebar or a tab bar. Both configurations include controls that allow users to switch between the two views. This style also dynamically adjusts to rotation and window resizing, presenting a view control appropriate for the available screen width.

> **Developer note**
> To display only a sidebar, use `NavigationSplitView` to present the sidebar within the primary pane of a split view, or utilize `UISplitViewController`.

- **Consider using a tab bar initially.** A tab bar affords greater screen real estate for content and offers sufficient flexibility to manage navigation across numerous main application areas. If your application requires exposing more sections than fit within a tab bar, the convertible sidebar appearance of the tab bar can provide access to less frequently used content. For detailed guidance, refer to [Tab bars](tab-bars.md).
- **If necessary, apply the correct appearance to a sidebar.** If you are not building a sidebar using SwiftUI, you can employ the `sidebar` appearance found in `UICollectionLayoutListConfiguration.Appearance` when using a collection view list layout. For developer resources, consult [UICollectionLayoutListConfiguration.Appearance](apple:UIKit/UICollectionLayoutListConfiguration-swift.struct/Appearance-swift.enum).
