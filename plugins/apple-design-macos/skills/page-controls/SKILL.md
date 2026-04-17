---
name: page-controls
description: "A page control presents a horizontal row of indicator images, with each image representing a specific page in a linear list. Use when designing page controls for macOS, auditing page controls against Apple's macOS guidelines, or when the user says things like \"design page controls for Mac\", \"page controls on macOS\", \"how should page controls work on Mac\"."
allowed-tools: Read Grep Glob
---

# Page controls
A page control presents a horizontal row of indicator images, with each image representing a specific page in a linear list

## When to use
- User asks about **page controls** on macOS (e.g. `"how do I design page controls for Mac"`).
- User is building a Mac UI that needs page controls and wants to follow Apple's guidelines.
- User asks to audit or review page controls in a macOS design.
- User mentions page controls in the context of a Mac app, game, or interface.

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
