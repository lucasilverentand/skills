# Platform guidance — visionOS
In visionOS, the system-provided toolbar is situated along the bottom edge of a window, positioned above the window management controls and in a parallel plane slightly forward along the z-axis.

To ensure toolbar items remain legible while content scrolls behind them, visionOS employs a variable blur in the bar's background. This variable blur keeps the bar anchored above the scrolling content while allowing the view’s glass material to maintain a uniform, undivided appearance.

In visionOS, you have the option to supply either a symbol or a text label for each toolbar item. When a toolbar item features a symbol, visionOS displays the associated text label upon inspection, offering supplementary information.

- **Prefer using a system-provided toolbar.** The standard toolbar offers a consistent and familiar appearance, optimized for both eye and hand input. Furthermore, the system automatically positions a standard toolbar correctly relative to its window.
- **Avoid creating a vertical toolbar.** Since [Tab bars](tab-bars.md) are inherently vertical in visionOS, presenting a vertical toolbar may confuse users.
- **Try to prevent windows from resizing below the width of the toolbar.** Because visionOS does not include a menu bar listing all app actions, it is vital that the toolbar provides dependable access to essential controls regardless of the window's dimensions.
- **If your app can enter a modal state, consider offering contextually relevant toolbar controls.** For instance, a photo-editing application might enter a modal state to assist users with a multi-step editing task. In such cases, the controls within the modal editing view differ from those in the main window. Ensure that you restore the window’s standard toolbar controls when the app exits the modal state.
- **Avoid using a pull-down menu in a toolbar.** While a pull-down menu allows you to offer supplementary actions related to a toolbar item, it can be difficult for users to discover and may clutter the interface. Given that the toolbar resides at the bottom edge of a visionOS window, a pull-down menu risks obscuring the standard window controls located below that bottom edge. Refer to [Pull-down buttons](pull-down-buttons.md) for guidance.
