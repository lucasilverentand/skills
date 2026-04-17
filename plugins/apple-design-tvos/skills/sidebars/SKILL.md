---
name: sidebars
description: "A sidebar is a view element that appears on the leading edge of a screen, enabling users to move between different sections within your application or game. Use when designing sidebars for tvOS, auditing sidebars against Apple's tvOS guidelines, or when the user says things like \"design sidebars for Apple TV\", \"sidebars on tvOS\", \"how should sidebars work on Apple TV\"."
allowed-tools: Read Grep Glob
---

# Sidebars
A sidebar is a view element that appears on the leading edge of a screen, enabling users to move between different sections within your application or game

## When to use
- User asks about **sidebars** on tvOS (e.g. `"how do I design sidebars for Apple TV"`).
- User is building an Apple TV UI that needs sidebars and wants to follow Apple's guidelines.
- User asks to audit or review sidebars in a tvOS design.
- User mentions sidebars in the context of an Apple TV app, game, or interface.

The sidebar floats above the main content without being fixed to the view's boundaries. It offers a comprehensive, flat representation of an application’s information architecture, allowing users simultaneous access to multiple peer content areas or modes.

A sidebar demands substantial vertical and horizontal screen real estate. If space is constrained, or if you intend to dedicate more of the display area to other information or features, a more compact control like [Tab bars](tab-bars.md) might offer a superior navigation experience. Refer to [Layout](layout.md) for implementation guidance.

### Best practices
- **Extend content beneath the sidebar.** In iOS, iPadOS, and macOS, sidebars float above the main content within the [Liquid Glass](materials.md#Liquid-Glass) layer, similar to other controls like tab bars and toolbars. To emphasize this separation and floating effect, extend the content underneath it by either allowing horizontal scrolling or applying a background extension view that mirrors adjacent content, simulating the sidebar stretching beneath it. Developers seeking guidance should refer to [backgroundExtensionEffect()](apple:SwiftUI/View/backgroundExtensionEffect()). **When possible, allow users to customize the sidebar's contents.** Since a sidebar guides users through your app’s key areas, it functions best when users can determine the most important sections and their display order.
- **Use group hierarchies with disclosure controls if your app contains extensive content.** Utilizing [Disclosure controls](disclosure-controls.md) helps maintain a manageable vertical footprint for the sidebar.
- **Consider using recognizable symbols to represent items in the sidebar.** [SF Symbols](sf-symbols.md) offers a vast selection of customizable symbols for representing app items. If you must use a custom icon, create a [Custom symbols](sf-symbols.md#Custom-symbols) rather than employing a bitmap image. You can download the SF Symbols app from [Apple Design Resources](https://developer.apple.com/design/resources/#sf-symbols).
- **Consider allowing users to hide the sidebar.** Users may wish to conceal the sidebar to dedicate more screen space to content details or minimize distraction. Whenever feasible, allow users to hide and display the sidebar using platform-specific interactions they are already familiar with. For instance, iPadOS users expect an edge swipe gesture; on macOS, you can include a dedicated show/hide button or add commands to the app’s View menu (Show Sidebar and Hide Sidebar). In visionOS, a window typically expands to accommodate the sidebar, making hiding it rarely necessary. Do not hide the sidebar by default to ensure its continued discoverability.
- **In general, limit the sidebar hierarchy to no more than two levels.** If your data structure exceeds two levels of depth, consider implementing a split view interface that includes a content list between the sidebar items and the detail view.
- **If you require two levels of hierarchy in a sidebar, use concise, descriptive labels for each group title.** To assist in keeping these labels brief, omit nonessential words.
