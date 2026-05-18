# Platform guidance — watchOS
On the Apple Watch, notifications present in two formats: *short look* and *long look*. Users may also review alerts within Notification Center. On compatible hardware, double-tapping enables users to respond to notifications.

To optimize the notification experience, developers should design app-specific assets and actions that are appropriate for Apple Watch. If the watchOS application utilizes an iPhone companion that supports notifications, watchOS will automatically supply default short-look and long-look interfaces when required.

##### Short looks
A short look appears when the wearer’s wrist is raised and disappears when it’s lowered.

- **Avoid using a short look as the only way to communicate important information.** Since a short look displays for only a brief period, allowing users just enough time to identify the notification and its source app, critical information must be delivered through alternative channels as well.
- **Keep privacy in mind.** Because short looks are designed to be discreet, developers must provide only essential details. Do not include potentially sensitive data within the notification title.

##### Long looks
Long looks offer greater detail regarding a notification. Users can scroll through a long look vertically or utilize the Digital Crown if needed. After viewing a long look, users can dismiss it by tapping or simply lowering their wrist.

A custom long-look interface may be either static or dynamic. The *static* configuration allows you to display the notification’s message alongside supplementary static text and imagery. The *dynamic* configuration grants access to the notification's complete content and provides additional options for customizing the interface’s appearance.

While you can tailor the content area for both static and dynamic long looks, the overall interface structure remains fixed. The system-defined layout includes a *sash* at the top and a Dismiss button at the bottom, positioned beneath all custom buttons.

- **Consider using a rich, custom long-look notification to allow users to obtain necessary information without launching your application.** You may employ SwiftUI [Animations](apple:SwiftUI/Animations) to generate engaging, interruptible animations; alternatively, you can utilize [SpriteKit](apple:SpriteKit) or [SceneKit](apple:SceneKit).
- **At minimum, provide a static interface; ideally, include a dynamic interface as well.** The system defaults to the static view if the dynamic interface is unavailable (e.g., due to network loss or inability to reach the iPhone companion app). Ensure you create and package all resources for your static interface in advance.
- **Choose a background appearance for the sash.** The system-provided sash, located at the top of the long-look interface, displays your app’s name and icon. You have the option to customize the sash's color or apply a blurred effect. If you feature a photograph in the content area, using the blurred sash is recommended; this provides a light, translucent appearance that simulates overlapping the image.
- **Choose a background color for the content area.** By default, the long look’s background is transparent. If you wish to match the appearance of other system notifications, use white with 18% opacity; otherwise, you may select a custom color from your brand palette.
- **Provide up to four custom actions below the content area.** For each long look, the system uses the notification’s type to determine which of your custom actions are displayed as buttons in the notification UI. Furthermore, the system always displays a Dismiss button at the bottom of the long-look interface, below all custom buttons. If your watchOS app has an iPhone companion that supports notifications, the system shares the actionable notification types already registered by your iPhone app to configure these custom action buttons.

##### Double tap
Users on supported devices can respond to notifications by double-tapping. When a user responds with a double tap, the system executes the first nondestructive action available.

**Keep the double-tap behavior in mind when establishing the order of custom actions presented as notification responses.** Since a double tap triggers the first nondestructive action, ensure that the most frequently used option is positioned at the top of the list. For example, a parking application providing custom actions to extend paid time could offer options for 5 minutes, 15 minutes, or an hour, with the most common choice listed first.
