---
name: scroll-views
description: "A scroll view enables users to examine content that exceeds the display boundaries by shifting the content along a vertical or horizontal axis. Use when designing scroll views for macOS, auditing scroll views against Apple's macOS guidelines, or when the user says things like \"design scroll views for Mac\", \"scroll views on macOS\", \"how should scroll views work on Mac\"."
allowed-tools: Read Grep Glob
---

# Scroll views
A scroll view enables users to examine content that exceeds the display boundaries by shifting the content along a vertical or horizontal axis

## When to use
- User asks about **scroll views** on macOS (e.g. `"how do I design scroll views for Mac"`).
- User is building a Mac UI that needs scroll views and wants to follow Apple's guidelines.
- User asks to audit or review scroll views in a macOS design.
- User mentions scroll views in the context of a Mac app, game, or interface.

The scroll view itself is visually neutral, but it may display a translucent *scroll indicator* once users initiate scrolling within the view. While the appearance and behavior of these indicators differ across platforms, they universally offer visual confirmation regarding the scrolling activity. For instance, on iOS, iPadOS, macOS, visionOS, and watchOS, the indicator communicates whether the currently visible content is approaching the start, middle, or end of the view.

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
In iOS, iPadOS, and macOS, a *scroll edge effect* is a dynamic blur that mediates the boundary between content and controls like [Toolbars](toolbars.md) which utilize [Liquid Glass](materials.md#Liquid-Glass). Typically, the system automatically applies this effect when a pinned element overlaps scrolling content. If custom controls or layouts are used, the effect may not appear and might require manual implementation. For developer reference, consult [ScrollEdgeEffectStyle](apple:SwiftUI/ScrollEdgeEffectStyle) and [UIScrollEdgeEffect](apple:UIKit/UIScrollEdgeEffect).

There are two types of scroll edge effects: soft and hard.

- Use a [soft](apple:SwiftUI/ScrollEdgeEffectStyle/soft) edge effect in most scenarios, particularly on iOS and iPadOS, to offer a subtle transition suitable for toolbars and interactive components such as buttons.
- Use a [hard](apple:SwiftUI/ScrollEdgeEffectStyle/hard) edge effect mainly in macOS for a stronger, more opaque boundary that is optimal for interactive text, controls without borders, or pinned table headers requiring enhanced visual separation.
- **Only implement a scroll edge effect when a scroll view borders floating interface elements.** Scroll edge effects are not decorative. They do not function like overlays that darken or obscure; rather, they serve to clarify the junction between content and controls.
- **Apply a single scroll edge effect per view.** In split view configurations on iPad and Mac, each pane may utilize its own scroll edge effect; if this is the case, ensure they maintain consistent height for proper alignment.

## Platform guidance — macOS
In macOS, a *scroll indicator* is often referred to as a *scroll bar*.

**If necessary, use small or mini scroll bars in a panel.** When screen space is constrained, smaller scroll bars may be employed within panels that must operate concurrently with other windows. It is mandatory to maintain uniform sizing across all controls within such a panel.
