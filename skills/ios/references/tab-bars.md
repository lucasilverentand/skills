# Tab bars — full guidelines

### Best practices
- **Utilize a tab bar for navigation between sections, not for providing actions.** A tab bar allows users to move between distinct parts of an application, similar to the Alarm, Stopwatch, and Timer views in the Clock app. If controls are needed that affect elements within the current view, use a **Toolbars** instead.
- **Ensure the tab bar remains visible when users transition between sections of your app.** If you conceal the tab bar, users may lose track of their location within the application. The exception is when a modal view overlays the tab bar, as modals are temporary and self-contained.
- **Select the appropriate number of tabs necessary to facilitate app navigation.** Since the tab bar represents your app's hierarchy, you must balance the complexity introduced by extra tabs against the need for users to frequently access each section; remember that fewer tabs generally lead to easier navigation. For apps with complex information structures, consider a sidebar or an adaptive tab bar as an alternative when applicable.
- **Prevent overflow tabs.** Depending on the device size and orientation, the number of visible tabs may be less than the total count. If horizontal space restricts visibility, the final tab becomes a More tab in iOS and iPadOS, which displays the remaining items in a separate list. Since the More tab makes it more difficult for users to locate and notice content on hidden tabs, limit scenarios where this situation occurs in your app.
- **Do not disable or hide tab bar buttons, even if their content is temporarily unavailable.** Having some tab bar buttons functional while others are not gives the impression that your app's interface is unstable and unpredictable. If a section is empty, you must explain why its content cannot be accessed.
- **Include tab labels to aid navigation.** A tab label appears either below or beside a tab bar icon and assists navigation by clearly describing the content type or functionality of that tab. Whenever possible, use single-word labels.
- **Consider using SF Symbols to provide recognizable and scalable tab bar icons.** When you use **SF Symbols**, the tab bar icons automatically adjust to different contexts. For instance, the tab bar can be either regular or compact depending on the device and orientation. In compact views, tab bar icons appear above their labels, whereas in regular views, the icons and labels are displayed side by side. Prefer filled symbols or icons for consistency with the platform.

If you are creating custom tab bar icons, consult [Apple Design Resources](https://developer.apple.com/design/resources/) regarding tab bar icon dimensions.

- **Use a badge to indicate the availability of critical information.** You can display a badge—a red oval containing white text and either a number or an exclamation point—on a tab to signal that new or updated information resides in that section and requires the user's attention. Reserve badges exclusively for critical information to maintain their impact and meaning; see **Notifications** for guidance.
- **Avoid using similar colors for tab labels and content layer backgrounds.** If your app already features bright, colorful content in the content layer, opt for a monochromatic appearance for the tab bars, or select an accent color that provides sufficient visual contrast. For further guidance, refer to **Liquid Glass color**.

## Platform guidance — iOS & iPadOS

### iOS
The tab bar floats above the screen content at the bottom edge. Its elements are displayed on a **Liquid Glass** background, enabling content underneath to be partially visible.

For tab bars that feature an attached accessory (such as the MiniPlayer in Music), you have the option to minimize the tab bar and align the accessory with it when scrolling downward. A user can restore the non-minimized state by tapping a tab or scrolling back up through the view. Developers should refer to [TabBarMinimizeBehavior] and [UITabBarController.MinimizeBehavior] for implementation guidance.

A dedicated search item may be included at the trailing edge of a tab bar. Consult [Search fields] for detailed instructions.

### iPadOS
The system displays a tab bar near the top of the screen. Developers can choose whether this tab bar remains fixed or includes a button that allows it to transition into a sidebar. For technical implementation details, refer to [tabBarOnly](apple:SwiftUI/TabViewStyle/tabBarOnly) and [sidebarAdaptable](apple:SwiftUI/TabViewStyle/sidebarAdaptable).

> **Note**
> If you wish to present a sidebar without offering the option to convert it into a tab bar, utilize a [navigation split view](apple:swiftui/navigationsplitview) instead of a tab view. For further guidance, consult [Sidebars](sidebars.md).

- **Use a tab bar for navigation.** A tab bar grants users access to the most frequently used sections of your application. If your app is highly complex, you may offer the option to convert the tab bar into a sidebar to provide access to a broader range of navigation options.
- **Allow users to customize the tab bar.** In applications with numerous sections that users may wish to access, it is beneficial to enable users to select and add frequently used items to the tab bar or remove less-used ones. For instance, in the Music app, a user can select a favorite playlist to display within the tab bar. If you allow users to define their own tabs, maintain a default list of five or fewer items to ensure continuity between compact and regular view sizes. For developer guidance, see [TabViewCustomization](apple:SwiftUI/TabViewCustomization) and [UITab.Placement](apple:UIKit/UITab/Placement).
