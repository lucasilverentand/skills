# Tab bars
A tab bar enables users to navigate between the application's highest-level sections

## Platform guidance — tvOS
A tab bar offers extensive customization options, allowing you to:

- Define a tint, color, or image for the tab bar background.
- Select a font for the tab items, including a distinct font for the currently selected item.
- Specify unique tints for both selected and unselected items.
- Incorporate button icons, such as search or settings indicators.

By default, the tab bar is translucent, and only the active tab appears opaque. When a user focuses on the tab bar using the remote, the selected tab displays a drop shadow that visually reinforces its active state. The tab bar maintains a fixed height of 68 points, and its top edge is positioned 46 points from the screen's upper boundary; neither of these values can be modified.

If the number of items exceeds what fits within the tab bar, the system applies a fade effect starting from the right side to truncate the trailing item. Should there be sufficient items to necessitate scrolling, the system also applies a truncating fade effect originating from the left side.

- **Be aware of tab bar scrolling behaviors.** By default, users can scroll the tab bar off-screen if the current tab consists of a single main view. Examples of this behavior can be found in the TV app's Watch Now, Movies, TV Show, Sports, and Kids tabs. The exception applies when a screen utilizes a split view, such as the TV app's Library tab or an application's Settings screen. In these cases, the tab bar remains anchored at the top of the view while users scroll the content within the primary and secondary panes of the split view. Regardless of the tab's specific contents, pressing Menu on the remote always returns focus to the tab bar at the top of the page.
- **In a live-viewing app, maintain consistent tab organization.** For optimal user experience in live-streaming applications, arrange the content using tabs in this sequence:
- Live content
- Cloud DVR or other recorded content
- Other content

For further guidance, consult **Live-viewing apps**.
