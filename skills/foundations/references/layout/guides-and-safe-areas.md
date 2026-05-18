# Guides and safe areas
A *layout guide* establishes a rectangular region used to position, align, and manage the spacing of content on the screen. The operating system provides default layout guides that facilitate applying standard margins and limiting text width for optimal readability. Developers also have the option to define custom layout guides. For technical details, consult [UILayoutGuide](apple:UIKit/UILayoutGuide) and [NSLayoutGuide](apple:AppKit/NSLayoutGuide).

A *safe area* refers to the portion of a view that remains uncovered by system elements such as toolbars, tab bars, or other window overlays. Safe areas are crucial for ensuring content avoids device-specific interactive and display components, such as the Dynamic Island on iPhones or camera housings found on certain Mac models. For guidance specific to developers, refer to [SafeAreaRegions](apple:SwiftUI/SafeAreaRegions) and [Positioning content relative to the safe area](apple:UIKit/positioning-content-relative-to-the-safe-area).

**Respect key display and system features in each platform.** If an application or game fails to account for these platform characteristics, it may feel out of place and become difficult for users. Beyond helping to navigate display and system constraints, safe areas also assist in accounting for interactive elements like bars, allowing content to dynamically adjust its placement when sizes change.

Templates that incorporate the guides and safe areas for each platform are available at [Apple Design Resources](https://developer.apple.com/design/resources/).
