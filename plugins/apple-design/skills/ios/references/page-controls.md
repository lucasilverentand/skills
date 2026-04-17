# Page controls
A page control presents a horizontal row of indicator images, with each image representing a specific page in a linear list

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
