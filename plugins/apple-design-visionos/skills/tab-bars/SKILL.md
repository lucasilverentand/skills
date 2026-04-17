---
name: tab-bars
description: "A tab bar enables users to navigate between the application's highest-level sections. Use when designing tab bars for visionOS, auditing tab bars against Apple's visionOS guidelines, or when the user says things like \"design tab bars for Apple Vision Pro\", \"tab bars on visionOS\", \"how should tab bars work on Apple Vision Pro\"."
allowed-tools: Read Grep Glob
---

# Tab bars
A tab bar enables users to navigate between the application's highest-level sections

## When to use
- User asks about **tab bars** on visionOS (e.g. `"how do I design tab bars for Apple Vision Pro"`).
- User is building an Apple Vision Pro UI that needs tab bars and wants to follow Apple's guidelines.
- User asks to audit or review tab bars in a visionOS design.
- User mentions tab bars in the context of an Apple Vision Pro app, game, or interface.

Tab bars assist users in grasping the different types of information or functionality the app offers. Additionally, they allow users to switch between view sections quickly while preserving the current navigation state within each section.

### Best practices
- **Utilize a tab bar for navigation between sections, not for providing actions.** A tab bar allows users to move between distinct parts of an application, similar to the Alarm, Stopwatch, and Timer views in the Clock app. If controls are needed that affect elements within the current view, use a [Toolbars](toolbars.md) instead.
- **Ensure the tab bar remains visible when users transition between sections of your app.** If you conceal the tab bar, users may lose track of their location within the application. The exception is when a modal view overlays the tab bar, as modals are temporary and self-contained.
- **Select the appropriate number of tabs necessary to facilitate app navigation.** Since the tab bar represents your app's hierarchy, you must balance the complexity introduced by extra tabs against the need for users to frequently access each section; remember that fewer tabs generally lead to easier navigation. For apps with complex information structures, consider a sidebar or an adaptive tab bar as an alternative when applicable.
- **Prevent overflow tabs.** Depending on the device size and orientation, the number of visible tabs may be less than the total count. If horizontal space restricts visibility, the final tab becomes a More tab in iOS and iPadOS, which displays the remaining items in a separate list. Since the More tab makes it more difficult for users to locate and notice content on hidden tabs, limit scenarios where this situation occurs in your app.
- **Do not disable or hide tab bar buttons, even if their content is temporarily unavailable.** Having some tab bar buttons functional while others are not gives the impression that your app's interface is unstable and unpredictable. If a section is empty, you must explain why its content cannot be accessed.
- **Include tab labels to aid navigation.** A tab label appears either below or beside a tab bar icon and assists navigation by clearly describing the content type or functionality of that tab. Whenever possible, use single-word labels.
- **Consider using SF Symbols to provide recognizable and scalable tab bar icons.** When you use [SF Symbols](sf-symbols.md), the tab bar icons automatically adjust to different contexts. For instance, the tab bar can be either regular or compact depending on the device and orientation. In compact views, tab bar icons appear above their labels, whereas in regular views, the icons and labels are displayed side by side. Prefer filled symbols or icons for consistency with the platform.

If you are creating custom tab bar icons, consult [Apple Design Resources](https://developer.apple.com/design/resources/) regarding tab bar icon dimensions.

- **Use a badge to indicate the availability of critical information.** You can display a badge—a red oval containing white text and either a number or an exclamation point—on a tab to signal that new or updated information resides in that section and requires the user's attention. Reserve badges exclusively for critical information to maintain their impact and meaning; see [Notifications](notifications.md) for guidance.
- **Avoid using similar colors for tab labels and content layer backgrounds.** If your app already features bright, colorful content in the content layer, opt for a monochromatic appearance for the tab bars, or select an accent color that provides sufficient visual contrast. For further guidance, refer to [Liquid Glass color](color.md#Liquid-Glass-color).

## Platform guidance — visionOS
In visionOS, a tab bar is always vertical and floats in a position fixed relative to the window's leading edge. When users view it, the tab bar automatically expands; tapping on a tab opens it. Note that when expanded, the tab bar may temporarily cover content behind it.

- **Provide a symbol and a text label for every tab.** The tab’s symbol remains visible in the tab bar at all times. When users view the tab bar, the system also displays the tab labels. Even though the tab bar expands, ensure that the tab labels are concise enough for users to read them quickly.
- **If it makes sense in your application, consider incorporating a sidebar within a tab.** If your app has a deep hierarchy, you may wish to use [Sidebars](sidebars.md) to manage secondary navigation within a tab. If you implement this, ensure that selections made in the sidebar do not alter which tab is currently active.
