# Design variants
SF Symbols offers different design states—such as `fill`, `slash`, and `enclosed`—to ensure visual consistency while clearly communicating precise states and actions within your UI. For instance, using the slash variant can denote unavailability of an item or action, while the fill variant indicates selection.

The outline style is the most frequently used in SF Symbols. An outlined symbol lacks solid areas, visually mimicking text. Most symbols are also available in a fill variant, where internal shapes possess solid areas.

Beyond outline and fill, SF Symbols also include variants that incorporate a slash or enclose the symbol within a shape (e.g., circle, square, rectangle). Often, enclosed and slash variants can be combined with either outline or fill styles.

SF Symbols provides numerous variants catering to specific languages and writing systems, including Latin, Arabic, Hebrew, Hindi, Thai, Chinese, Japanese, Korean, Cyrillic, Devanagari, and different Indic numeral systems. These language- and script-specific variants adjust automatically based on the device's current language setting. Refer to [Images](right-to-left.md#Images) for guidance.

Symbol variants support diverse design objectives:

- The outline variant is suitable for toolbars, lists, and other contexts where the symbol appears alongside text.
- Symbols utilizing an enclosing shape (like a square or circle) enhance legibility when displayed at small sizes.
- The solid areas of a fill variant provide greater visual emphasis to the symbol, making it ideal for iOS tab bars, swipe actions, or when using an accent color to denote selection.

In many scenarios, the display context determines whether outline or fill is appropriate, negating the need to explicitly specify a variant. For example, an iOS tab bar naturally favors the fill variant, whereas a toolbar typically uses the outline variant.
