# Platform guidance — watchOS
Maps on Apple Watch function as static snapshots of specific geographic locations. You must place the map within your interface during design and display the appropriate region at runtime. The displayed area is non-interactive; tapping it launches the Maps application on Apple Watch. You may include up to five annotations to highlight points of interest or other relevant data. For developer guidance, consult [WKInterfaceMap](apple:WatchKit/WKInterfaceMap).

- **Fit the map interface element to the screen.** The entirety of this component must be visible on the Apple Watch display without necessitating scrolling.
- **Show the smallest region that encompasses the points of interest.** Because content within a map interface element does not scroll, all crucial information must be contained within the displayed view.

For developer guidance, see [WKInterfaceMap](apple:WatchKit/WKInterfaceMap).
