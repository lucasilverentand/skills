# Mounting styles
The visual presentation of a widget on a surface significantly influences user perception. To make it appear intentional and integrated into the environment, users place widgets using specific mounting styles:

- **[elevated](apple:WidgetKit/WidgetMountingStyle/elevated) style**. When placed on a horizontal surface (e.g., a desk), the widget always appears lifted and gently tilted backward, offering a subtle viewing angle that enhances readability while casting a soft shadow to ground it on the surface. On vertical surfaces (e.g., a wall), the widget appears elevated, flush against the surface, similar to mounting a picture frame.
- **[recessed](apple:WidgetKit/WidgetMountingStyle/recessed) style**. On vertical surfaces (e.g., a wall), the widget can appear recessed, with its content set back into the surface to create depth and mimic a cutout. This mounting style is not supported on horizontal surfaces.

By default, widgets utilize the elevated mounting style because it functions correctly across both horizontal and vertical surfaces.

**Select the mounting style that matches your content and desired user experience.** By default, visionOS widgets use the elevated mounting style, which is best suited for content intended to stand out and be highly visible, such as reminders, media players, or glanceable data. Recessed widgets are best suited for ambient or immersive content, like editorial pieces or weather information, and they can only be placed on a vertical surface. If a style does not suit your widget, you have the option to disable it for each individual widget. If you choose to only support the recessed mounting style, users will be unable to place the widget on a horizontal surface. For instance, a weather application might restrict its large and extra-large system family widgets to the recessed style to simulate looking through a window, while only supporting the elevated style for its small system family widget.

> **Developer note**
> Use the `supportedMountingStyles(_:)` property of your `WidgetConfiguration` to declare whether a widget supports elevated, recessed, or both mounting styles. To provide a widget that only supports one style alongside other widgets that support both, create distinct widget configurations. For example, establish one configuration for the widget limited to recessed mounting and a second configuration for widgets supporting both styles.

**Test your elevated widget designs against every system-provided frame width.** Users can select from different system-defined frame widths for widgets using the elevated mounting style. Since you cannot alter your layout based on the chosen frame width, ensure your widget design remains visually balanced across all supported widths.
