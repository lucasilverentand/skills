# Scroll views — full guidelines

### Best practices
- **Support default scrolling gestures and keyboard shortcuts.** Users are accustomed to system-level scrolling behavior and expect it to function universally. If you implement custom scrolling for a view, ensure that your scroll indicators utilize the elastic behavior users anticipate.
- **Make it apparent when content is scrollable.** Since scroll indicators are not always visible, it can be beneficial to clearly signal when content extends beyond the view boundaries. For instance, displaying partial content at a view's edge indicates that more content exists in that direction. While most users instinctively attempt to scroll a view to check for additional content, it is considerate practice to draw their attention to this possibility.
- **Avoid putting a scroll view inside another scroll view with the same orientation.** Nesting scroll views sharing the same orientation can lead to an unpredictable interface that is difficult to manage. However, placing a horizontal scroll view within a vertical one (or vice versa) is acceptable.
- **Consider supporting page-by-page scrolling if it makes sense for your content.** In certain scenarios, users prefer interacting with fixed chunks of content rather than continuous scrolling. On most platforms, you can define the size of such a *page*—typically matching the current height or width of the view—and define an interaction that scrolls one page at a time. To maintain context during page-by-page scrolling, you can define an overlap unit (such as a line of text, a row of glyphs, or part of an image) and subtract this unit from the page size. For developer guidance, refer to [PagingScrollTargetBehavior](apple:SwiftUI/PagingScrollTargetBehavior).
- **In some cases, scroll automatically to help people find their place.** Although users initiate nearly all scrolling actions, automatic scrolling can be beneficial when relevant content moves out of view, such as:
- Your app executes an operation that selects content or places the insertion point in a currently hidden area. For example, if your app locates text matching a search query, scroll the content to bring the new selection into view.
- Users begin entering information in a location that is not currently visible. For example, if the insertion point resides on one page and users navigate to another, scroll back to the insertion point as soon as they start typing.
- The pointer moves past the view edge during a selection process. In this scenario, follow the pointer by scrolling in its direction of movement.
- Users select content and scroll to a new location before taking action on the selection. In this case, scroll until the selection is visible before executing the operation.

In all instances, automatically scroll only as much as necessary to assist users in maintaining context. For example, if a portion of the selection is already visible, you do not need to scroll the entire selection into view.

**If you support zoom, set appropriate maximum and minimum scale values.** For example, zooming into text until a single character fills the entire screen is usually impractical.

### Scroll edge effects
In iOS, iPadOS, and macOS, a *scroll edge effect* is a dynamic blur that mediates the boundary between content and controls like **Toolbars** which utilize **Liquid Glass**. Typically, the system automatically applies this effect when a pinned element overlaps scrolling content. If custom controls or layouts are used, the effect may not appear and might require manual implementation. For developer reference, consult [ScrollEdgeEffectStyle](apple:SwiftUI/ScrollEdgeEffectStyle) and [UIScrollEdgeEffect](apple:UIKit/UIScrollEdgeEffect).

There are two types of scroll edge effects: soft and hard.

- Use a [soft](apple:SwiftUI/ScrollEdgeEffectStyle/soft) edge effect in most scenarios, particularly on iOS and iPadOS, to offer a subtle transition suitable for toolbars and interactive components such as buttons.
- Use a [hard](apple:SwiftUI/ScrollEdgeEffectStyle/hard) edge effect mainly in macOS for a stronger, more opaque boundary that is optimal for interactive text, controls without borders, or pinned table headers requiring enhanced visual separation.
- **Only implement a scroll edge effect when a scroll view borders floating interface elements.** Scroll edge effects are not decorative. They do not function like overlays that darken or obscure; rather, they serve to clarify the junction between content and controls.
- **Apply a single scroll edge effect per view.** In split view configurations on iPad and Mac, each pane may utilize its own scroll edge effect; if this is the case, ensure they maintain consistent height for proper alignment.

## Platform guidance — watchOS
- **Prefer vertical scrolling content.** Users are accustomed to navigating within and between apps on Apple Watch using the Digital Crown. If your app features a single content view or list, rotating the Digital Crown will enable vertical scrolling once the content exceeds the display height.
- **Use tab views for page-by-page transitions.** watchOS renders tab views as distinct pages. When these tab views are arranged in a vertical stack, users can rotate the Digital Crown to move through full-screen pages. In this setup, the system displays a page indicator near the Digital Crown, indicating both the user's location within the current page and their position among all available pages. Refer to [Tab views](tab-views.md) for detailed guidance.
- **When presenting paged content, consider restricting individual pages to the height of a single screen.** Adhering to this guideline clarifies the function of each page and assists in developing a more glanceable experience. Nevertheless, if your application includes extended pages, users can still employ the Digital Crown to navigate between shorter pages or scroll content within a longer page, as the page indicator transforms into a scroll indicator when required. Employ variable-height pages cautiously and position them after fixed-height pages whenever feasible.
