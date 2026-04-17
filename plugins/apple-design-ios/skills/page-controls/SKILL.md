---
name: page-controls
description: "A page control presents a horizontal row of indicator images, with each image representing a specific page in a linear list. Use when designing page controls for iOS and iPadOS, auditing page controls against Apple's iOS and iPadOS guidelines, or when the user says things like \"design page controls for iPhone\", \"page controls on iOS and iPadOS\", \"how should page controls work on iPhone\"."
allowed-tools: Read Grep Glob
---

# Page controls
A page control presents a horizontal row of indicator images, with each image representing a specific page in a linear list

## When to use
- User asks about **page controls** on iOS and iPadOS (e.g. `"how do I design page controls for iPhone"`).
- User is building an iPhone UI that needs page controls and wants to follow Apple's guidelines.
- User asks to audit or review page controls in an iOS and iPadOS design.
- User mentions page controls in the context of an iPhone app, game, or interface.

This scrollable sequence of indicators aids users in navigating the list to locate desired pages. Because page controls support an indefinite number of pages, they are particularly useful when users construct custom lists.

By default, page controls display as a series of small indicator dots corresponding to all available pages. A solid dot signifies the currently active page. Visually, these dots are always equally spaced and will be clipped if too many exist to fit within the display window.

### Best practices
- **Use page controls to represent movement between an ordered list of pages.** Page controls must only indicate sequential progression; they should not imply hierarchical or non-sequential relationships. For navigation requiring greater complexity, consider implementing a sidebar or split view instead.
- **Center a page control at the bottom of the view or window.** To ensure users can always locate it, position the page control horizontally centered and near the bottom edge of the view.

**Although page controls can handle any number of pages, don’t display too many**. Since tracking more than roughly 10 indicators is difficult at a glance, if your application must display over 10 pages as peers, consider using an alternative arrangement, such as a grid, that allows users to navigate the content in any order.

### Customizing indicators
By default, a page control utilizes the system's dot image for all indicators; however, it supports displaying a distinct image to help users identify a specific page. For instance, Weather employs the `location.fill` symbol to denote the current location's page.

If providing a custom image improves your app or game, you may supply an image to serve as the default indicator for all pages, and you can also provide a unique image for individual pages. For developer guidance, refer to [preferredIndicatorImage](apple:UIKit/UIPageControl/preferredIndicatorImage) and [setIndicatorImage(_:forPage:)](apple:UIKit/UIPageControl/setIndicatorImage(_:forPage:)).

- **Ensure custom indicator images are simple and unambiguous.** Avoid intricate shapes, negative space, text, or internal lines, as these details can render an icon muddy and illegible when scaled down. Consider using straightforward [SF Symbols](sf-symbols.md) or designing your own icons. For design guidance, consult [Icons](icons.md).
- **Only customize the default indicator image if it enhances the page control's overall meaning.** For example, if every page listed includes bookmarks, you might use the `bookmark.fill` symbol as the default indicator image.
- **Limit the page control to no more than two different indicator images.** If your list includes one page with special significance—such as the current-location page in Weather—you can make it easily locatable by assigning a unique indicator image. Conversely, attempting to use multiple unique images to signify several important pages makes the control difficult to operate because users must memorize each image's meaning. A page control displaying more than two types of indicator images tends to appear disorganized and arbitrary, even if each image is clear. **Do not apply color to indicator images.** Custom colors can decrease the contrast needed to differentiate the current page from others, potentially making the page control difficult to see. To ensure optimal usability and visual consistency across different contexts, allow the system to handle indicator coloring automatically.

## Platform guidance — iOS & iPadOS
A page control allows indicators to display additional information about the list. For instance, it highlights the indicator corresponding to the current page, enabling users to gauge their relative position within the list. If there are more indicators than can fit in the available space, the control can compress the indicators on both sides to indicate that additional pages exist.

Users interact with page controls by tapping or scrubbing (to *scrub*, users drag the control left or right after touching it). Tapping either the leading or trailing edge of the current-page indicator advances to the next or previous page; additionally, on iPadOS, users can use a pointer to select a specific indicator. Scrubbing advances pages sequentially, and scrubbing beyond the leading or trailing edge allows users to rapidly reach the first or last page.

> **Developer note**
> In the API, *tapping* represents a *discrete interaction*, whereas *scrubbing* is a *continuous interaction*; for developer guidance, refer to [UIPageControl.InteractionState](apple:UIKit/UIPageControl/InteractionState-swift.enum).

**Do not animate page transitions while scrubbing.** Since users can scrub very rapidly, applying the scrolling animation to every transition may cause your app to lag or produce distracting visual flashes. Reserve the animated scrolling transition solely for tapping actions.

A page control can feature a translucent, rounded-rectangle background appearance that provides visual contrast for the indicators. You may select one of these background styles:

- Automatic — The background appears only when the user interacts with the control. Use this style if the page control is not the primary navigational element in the UI.
- Prominent — The background is always visible. Use this style exclusively when the control serves as the primary navigational element on the screen.
- Minimal — The background never appears. Use this style if you only intend to show the current page's position in the list and do not need visual feedback during scrubbing.

For guidance on this feature, see [backgroundStyle](apple:UIKit/UIPageControl/backgroundStyle-swift.property).

**Do not support scrubbing when you utilize the minimal background style.** The minimal style does not offer visual feedback during scrubbing. If you intend for users to scrub through a list of pages in your application, use either the automatic or prominent background styles.
