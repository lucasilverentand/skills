# In-game menus
In-game menus allow players to manage gameplay controls and configure [settings](settings.md) for the entire application.

- **Players must navigate in-game menus using the platform’s standard interaction methods.** Users anticipate that navigating your game menus will utilize the same interactions they use for other device menus. For instance, players expect to move through game menus using touch on iOS and iPadOS, and employing direct or indirect gestures in visionOS.
- **Ensure your menus are readily accessible and legible across all supported platforms.** Each platform has specific dimensions optimized for interaction targets and font sizes. If scaling your game content to fit different screens—particularly mobile devices—results in menus that are too small for users to read or interact with, you must adjust the size of the tap targets and consider alternative methods for conveying menu content. Refer to [Typography](typography.md) and [Touch controls](game-controls.md#Touch-controls) for guidance.

## Platform guidance — iOS & iPadOS
In iOS and iPadOS, a menu can present its contents using one of these three arrangements:

- **Small.** The menu features a top row containing four items, followed by a list of the rest. For each item in this upper row, the menu shows only a symbol or icon, without any accompanying label.
- **Medium.** The menu displays a top row of three items, followed by the main list. For each item in this initial row, the menu presents a symbol or icon positioned above a brief label.
- **Large (the default).** All items are presented within a standard list format.

For development guidance, refer to [preferredElementSize](apple:UIKit/UIMenu/preferredElementSize).

**Select a small or medium menu layout if it contributes to simplifying users' selections.** Consider employing the medium arrangement if your application includes three critical actions that users frequently wish to execute. For instance, Notes utilizes the medium layout to allow quick access to Scan, Lock, and Pin functionalities. Reserve the small layout exclusively for actions that are closely related and typically appear as a group, such as Bold, Italic, Underline, and Strikethrough. For every action, employ a recognizable symbol that enables users to identify the function without needing a label.
