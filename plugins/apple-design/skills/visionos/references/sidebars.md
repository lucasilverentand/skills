# Sidebars
A sidebar is a view element that appears on the leading edge of a screen, enabling users to move between different sections within your application or game

## Platform guidance — visionOS
**If your application structure is deeply hierarchical, consider implementing a sidebar within a tab view managed by the tab bar.** In this scenario, the sidebar serves to provide secondary navigation specific to that tab. If you implement this pattern, it is essential to ensure that selecting an item in the sidebar does not change the currently active tab.
