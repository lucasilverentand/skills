# Platform guidance — iOS & iPadOS
Lock Screen widgets share functional similarities with watch complications, adhering to both widget and **Complications** design guidelines. Your Lock Screen widget should convey valuable information and not merely serve as an entry point to your application. Since complications designs often translate well to Lock Screen widgets (and vice versa), developing them concurrently is recommended.

Your application can present Lock Screen widgets in three formats: inline text displayed above the clock, or circular and rectangular shapes appearing below the clock.

**Support the Always-On display on iPhone.** When viewed on devices with the Always-On feature, Lock Screen widgets are rendered with reduced luminance. Ensure your content remains readable and uses shades of gray that maintain sufficient contrast in the Always-On display.

For developer instructions, refer to [Creating accessory widgets and watch complications](apple:WidgetKit/Creating-accessory-widgets-and-watch-complications).

**Offer Live Activities to show real-time updates.** Widgets are not designed for displaying information in real time. If your app enables users to monitor the status of an event or task with frequent updates over a defined period, consider implementing Live Activities. Both widgets and Live Activities utilize the same foundational frameworks and share design parallels; therefore, developing both features in parallel allows for code and design component reuse. For guidance on Live Activities, consult **Live Activities**; for developer instructions, see [ActivityKit](apple:ActivityKit).

##### StandBy and CarPlay
When viewed on iPhone in StandBy mode, the system presents two small family widgets side-by-side, scaled to occupy the entire Lock Screen. Implementing StandBy support also guarantees optimal performance in CarPlay. Both CarPlay and StandBy widgets utilize the small system family widget, stripped of its background and scaled to fit the Widgets screen grid. In CarPlay specifically, large text and easily digestible information are crucial for readability on a vehicle display.

**Restrict the use of rich images or color when conveying information in StandBy.** Instead, utilize the available space by scaling and arranging text so users can quickly grasp the widget content from afar. To blend smoothly with the black background, omit background colors when your widget is displayed in StandBy.

For guidance intended for developers, consult [Displaying the right widget background](apple:WidgetKit/Displaying-the-right-widget-background).

When viewed on iPhone in StandBy during low-light conditions, the system renders widgets using a monochromatic appearance with a red tint.
