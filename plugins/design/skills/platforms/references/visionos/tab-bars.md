# Tab bars
A tab bar enables users to navigate between the application's highest-level sections

## Platform guidance — visionOS
In visionOS, a tab bar is always vertical and floats in a position fixed relative to the window's leading edge. When users view it, the tab bar automatically expands; tapping on a tab opens it. Note that when expanded, the tab bar may temporarily cover content behind it.

- **Provide a symbol and a text label for every tab.** The tab’s symbol remains visible in the tab bar at all times. When users view the tab bar, the system also displays the tab labels. Even though the tab bar expands, ensure that the tab labels are concise enough for users to read them quickly.
- **If it makes sense in your application, consider incorporating a sidebar within a tab.** If your app has a deep hierarchy, you may wish to use [Sidebars](sidebars.md) to manage secondary navigation within a tab. If you implement this, ensure that selections made in the sidebar do not alter which tab is currently active.
