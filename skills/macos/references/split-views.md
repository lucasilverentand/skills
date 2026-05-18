# Split views
A split view manages the simultaneous presentation of multiple adjacent content panes. Each pane can host different components, such as tables, collections, images, or custom views

## Platform guidance — macOS
In macOS, users can arrange the panes within a split view either vertically, horizontally, or in both orientations. A split view includes dividers between panes that allow for resizing via dragging. For detailed developer guidance, refer to [VSplitView](apple:SwiftUI/VSplitView) and [HSplitView](apple:SwiftUI/HSplitView).

- **Establish sensible minimum and maximum sizes for panes.** If users can adjust the pane dimensions in your application's split view, ensure that you utilize sizes which maintain the visibility of the divider. If a pane becomes excessively small, the divider may appear to vanish, leading to usability issues.
- **Evaluate allowing users to conceal a pane when appropriate.** For instance, if your application incorporates an editing interface, consider enabling users to hide other panes to minimize distractions or dedicate more screen real estate to the editing task—as demonstrated in Keynote, users can hide the navigator and presenter notes panes while they edit slide content.
- **Offer several methods to restore hidden panes.** For example, you could implement a toolbar button or a menu command, including an associated keyboard shortcut, that users can employ to bring back a hidden pane.
- **Default to the thin divider appearance.** The thin divider measures one point in width, which maximizes content display area while remaining easily operable. Only use a thicker divider style if there is a specific requirement. For example, if both sides of the divider display table rows that utilize strong linear elements making a thin divider difficult to discern, a thicker style might be beneficial. See [NSSplitView.DividerStyle](apple:AppKit/NSSplitView/DividerStyle-swift.enum) for developer guidance.
