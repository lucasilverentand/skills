# Page controls
A page control presents a horizontal row of indicator images, with each image representing a specific page in a linear list

## Platform guidance — watchOS
In watchOS, page controls appear at the bottom of the screen for horizontal pagination, or adjacent to the Digital Crown when implementing a vertical **tab view**. When employing vertical tab views, the page indicator informs users of their location within both the current page and the collection of pages. The page control manages transitions between scrolling through a page's content and navigating to different pages.

- **Employ vertical pagination when dividing multiple views into separate, intentional pages.** Ensure every page has a defined function, and allow users to cycle through the pages using the Digital Crown. For watchOS, this approach proves superior to horizontal pagination or deep hierarchical navigation.
- **Evaluate constraining an individual page's content to occupy a single screen height.** Adhering to this limitation promotes that each page serves a unique and distinct goal, leading to a more quickly scannable experience. Use pages with variable heights cautiously, and if possible, sequence them after fixed-height pages in your application design.
