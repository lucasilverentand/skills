# Using system fonts
Apple offers two typeface families that support a wide array of weights, sizes, styles, and languages.

**San Francisco (SF)** is a sans serif typeface family that includes the SF Pro, SF Compact, SF Arabic, SF Armenian, SF Georgian, and SF Hebrew variants.

The system also provides SF Pro, SF Compact, SF Arabic, SF Armenian, SF Georgian, and SF Hebrew in rounded versions. These can be used to match the appearance of soft or rounded UI elements, or to provide an alternative typographic voice.

**New York (NY)** is a serif typeface family designed to function effectively both independently and alongside the SF fonts.

You can download the San Francisco and New York fonts [here](https://developer.apple.com/fonts/).

The system supplies the SF and NY fonts in the *variable* font format. This format combines different font styles into a single file and supports interpolation between those styles to generate intermediate ones.

> **Note**
> Variable fonts support *optical sizing*, which refers to adjusting different typographic designs to suit different sizes. On all platforms, the system fonts feature *dynamic optical sizes*. These merge discrete optical sizes (like Text and Display) and weights into one continuous design, allowing the system to interpolate each glyph or letterform to produce a structure precisely adapted to the point size. With dynamic optical sizes, you only need to utilize discrete optical sizes if your design tool does not support all features of the variable font format.

To assist in establishing visual hierarchies and creating clear, legible designs across diverse sizes and contexts, the system fonts are available across many weights, ranging from Ultralight to Black. Furthermore, SF includes several widths, including Condensed and Expanded. Because SF Symbols utilize equivalent weights, you can achieve precise weight matching between symbols and adjacent text, regardless of the chosen size or style.

> **Note**
> **SF Symbols** offers a complete library of symbols that integrate seamlessly with the San Francisco system font, automatically aligning with text across all weights and sizes. Consider using symbols when you need to represent an object or convey a concept, especially within body text.

The system defines a set of typographic attributes—known as text styles—that function with both typeface families. A *text style* dictates a specific combination of font weight, point size, and leading values for each text size. For instance, the *body* text style uses values that facilitate comfortable reading over multiple lines, while the *headline* style assigns a font size and weight intended to differentiate a heading from surrounding content. Collectively, these text styles establish a typographic hierarchy you can use to express the varying levels of importance in your content. Text styles also enable text to scale proportionally when users adjust the system’s text size or apply accessibility modifications, such as enabling Larger Text in Accessibility settings.

- **Consider using the built-in text styles.** The system-defined text styles offer a consistent and convenient method for conveying your information hierarchy through font size and weight. Additionally, using text styles with the system fonts guarantees support for Dynamic Type and larger accessibility type sizes (where available). For guidance, see [Supporting Dynamic Type](#Supporting-Dynamic-Type).
- **Modify the built-in text styles if necessary.** System APIs define font adjustments—called *symbolic traits*—that allow you to modify certain aspects of a text style. For example, the bold trait increases the weight of the text, allowing you to establish another level of hierarchy. You can also employ symbolic traits to adjust leading if needed to improve readability or conserve space. For example, when displaying text in wide columns or extended passages, increased line spacing (*loose leading*) can help readers maintain their place while moving from one line to the next. Conversely, if you must display multiple lines of text in a constrained height area—such as a list row—decreasing the line spacing (*tight leading*) can help fit the text appropriately. If your display requires three or more lines of text, avoid tight leading even when space is limited. For developer guidance, see [leading(_:)](apple:SwiftUI/Font/leading(_:)).

> **Developer note**
> You can utilize the constants defined in [Font.Design](apple:SwiftUI/Font/Design) to access all system fonts—do not embed system fonts within your app or game. For example, use [Font.Design.default](apple:SwiftUI/Font/Design/default) to retrieve the system font across all platforms; use [Font.Design.serif](apple:SwiftUI/Font/Design/serif) to obtain the New York font.

**If necessary, adjust tracking in interface mockups.** In a live application, the system font dynamically adjusts tracking at every point size. To create an accurate interface mockup of an interface utilizing the variable system fonts, you don’t have to select a discrete optical size at specific point sizes, but you may need to adjust the tracking. For guidance, see [Tracking values](#Tracking-values).
