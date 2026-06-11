# Split views
A split view manages the simultaneous presentation of multiple adjacent content panes. Each pane can host different components, such as tables, collections, images, or custom views

## Platform guidance — iOS & iPadOS

### iOS
**Utilize split view in a standard environment, not a compact one.** A split view demands horizontal space to properly display multiple panes. In constrained environments, such as an iPhone held in portrait orientation, displaying numerous panes becomes challenging without causing content to wrap or truncate, thereby reducing legibility and hindering interaction.

### iPadOS
In iPadOS, a split view may consist of two vertical panes, as seen in Mail, or three vertical panes, such as in Keynote.

**Account for narrow, compact, and intermediate window widths.** Given that iPad windows are fluidly resizable, it is crucial to consider how the split view layout behaves across different widths. Specifically, guarantee that users can navigate between all panes in a coherent manner. For design advice, refer to **Layout**. For developer implementation details, consult [NavigationSplitView](apple:SwiftUI/NavigationSplitView) and [UISplitViewController](apple:UIKit/UISplitViewController).
