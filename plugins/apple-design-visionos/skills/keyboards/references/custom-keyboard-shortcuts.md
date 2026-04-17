# Custom keyboard shortcuts
- **Define custom keyboard shortcuts only for commands that are most frequently used within your app.** Users value keyboard shortcuts for actions they perform often, but introducing too many new combinations can make your application seem difficult to master.
- **Utilize modifier keys in ways that align with user expectations.** For instance, pressing Command while dragging groups items together, and holding Shift during drag-resizing constrains the scaling to maintain the item’s aspect ratio. Furthermore, holding an arrow key moves the selected element by the smallest app-defined increment until the key is released.

The following table outlines modifier keys and their associated symbols:

|Modifier key|Symbol|Recommended usage|
|---|---|---|
|Command||Use the Command key as the primary modifier when defining a custom keyboard shortcut.|
|Shift||Prefer Shift as a secondary modifier that complements an existing, related shortcut.|
|Option||Employ the Option modifier sparingly for less common commands or advanced features.|
|Control||Avoid using the Control key as a modifier. The operating system uses Control extensively in system-wide features and shortcuts, such as focus movement or screenshot capture.|

> **Tip**
> Certain languages require modifier keys to generate specific characters. For example, on a French keyboard, Option-5 produces the “{“ character. While using Command as a modifier is generally safe, avoid pairing an additional modifier with characters that may not be available across all keyboards. If you must use a non-Command modifier, restrict its pairing to alphabetic characters only.

- **List modifier keys in the correct sequence.** If a custom shortcut requires more than one modifier key, they must always be listed in this specific order: Control, Option, Shift, Command.
- **Do not add Shift to a shortcut that already uses the uppercase character of a two-character key.** Users are already aware they must hold Shift to input an upper case character from a two-character key, making it clearer simply to list the uppercase character in the shortcut. For example, the keyboard command for Hide Status Bar is Command-Slash, whereas the command for Help should be Command-Question mark, not Shift-Command-Slash.
- **Allow the system to localize and mirror your keyboard shortcuts as necessary.** The operating system automatically adapts a shortcut’s primary and modifier keys to match the currently connected keyboard; if your application or game switches to a right-to-left layout, the system mirrors the shortcut accordingly. For detailed instructions, consult [Right to left](right-to-left.md).
- **Do not create a new shortcut by adding a modifier to an existing shortcut for an unrelated function.** For example, since users are accustomed to using Command-Z to reverse an action, it would be confusing to assign Shift-Command-Z to a command that is not related to undo or redo.
