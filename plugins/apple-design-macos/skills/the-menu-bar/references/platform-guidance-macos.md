# Platform guidance — macOS
The macOS menu bar contains the Apple menu, which is invariably the first item on the leading edge. This menu holds system-defined items that are always present and cannot be modified or removed. If there is sufficient room, the system may also display menu bar extras on the trailing side. For information, consult [Menu bar extras](#Menu-bar-extras).

When menu bar space is limited, the system prioritizes displaying menus and essential menu bar extras. To ensure that menus remain legible, the system may decrease the spacing between titles or truncate them if necessary.

When users enter full-screen mode, the menu bar typically hides until it is brought back into view by moving the pointer to the top of the screen. See [Going full screen](going-full-screen.md) for guidance on this behavior.

##### Menu bar extras
A menu bar extra allows your application to expose app-specific functionality through an icon that resides in the menu bar while your app is running, even if it is not currently active. These extras appear on the side of the menu bar opposite your application's main menus. For detailed developer instructions, refer to [MenuBarExtra](apple:SwiftUI/MenuBarExtra).

The operating system may conceal menu bar extras when it needs space for application menus. Similarly, if too many menu bar extras are present, the system might hide some to prevent crowding the application menus.

- **Consider using a symbol to represent your menu bar extra.** You have the option of creating custom [Icons](icons.md) or utilizing one of the [SF Symbols](sf-symbols.md), either as is or customized to fit your needs. Both interface icons and symbols utilize black and clear colors to define their shapes; the system handles applying additional colors to the black areas in each image, ensuring proper appearance on both dark and light menu bars and when your menu bar extra is selected. The standard height of the menu bar is 24 pt.
- **Display a menu — not a popover — when users click your menu bar extra.** Unless the functionality you wish to expose is excessively complex for a menu, avoid presenting it within a [Popovers](popovers.md).
- **Let people — not your app — decide whether to include your menu bar extra in the menu bar.** Typically, users enable a menu bar extra by adjusting a setting within your app's settings window. However, to maximize discoverability, consider allowing users the option to enable it during initial setup.
- **Avoid depending on the presence of menu bar extras.** The system manages the display and hiding of these extras dynamically, and you cannot guarantee which menu bar extras users have chosen to show or predict the exact location of your own.
- **Consider exposing app-specific functionality in other ways, too.** For instance, you can provide a [Dock menu](dock-menus.md) that appears when users Control-click your app's Dock icon. While users can choose to hide or forgo using your menu bar extra, a Dock menu remains accessible as long as your app is running.
