# Platform guidance — macOS
macOS defines the following dynamic system colors (these can also be viewed in the Developer palette of the standard Color panel):

|Color|Function/Purpose|AppKit API|
|---|---|---|
|Alternate selected control text color|The text displayed on a selected surface within a list or table.|[alternateSelectedControlTextColor](apple:AppKit/NSColor/alternateSelectedControlTextColor)|
|Alternating content background colors|The backgrounds used for alternating rows or columns in a list, table, or collection view.|[alternatingContentBackgroundColors](apple:AppKit/NSColor/alternatingContentBackgroundColors)|
|Control accent|The accent color chosen by the user in System Settings.|[controlAccentColor](apple:AppKit/NSColor/controlAccentColor)|
|Control background color|The background surface of a major interface element, such as a browser or table.|[controlBackgroundColor](apple:AppKit/NSColor/controlBackgroundColor)|
|Control color|The surface of a control.|[controlColor](apple:AppKit/NSColor/controlColor)|
|Control text color|The available text displayed on a control.|[controlTextColor](apple:AppKit/NSColor/controlTextColor)|
|Current control tint|The system-defined hue or tone for a control.|[currentControlTint](apple:AppKit/NSColor/currentControlTint)|
|Unavailable control text color|The text displayed on a control that is currently disabled or unavailable.|[disabledControlTextColor](apple:AppKit/NSColor/disabledControlTextColor)|
|Find highlight color|The color used for a find indicator.|[findHighlightColor](apple:AppKit/NSColor/findHighlightColor)|
|Grid color|The lines forming the grid of an interface element, such as a table.|[gridColor](apple:AppKit/NSColor/gridColor)|
|Header text color|The text within a table's header cell.|[headerTextColor](apple:AppKit/NSColor/headerTextColor)|
|Highlight color|The virtual light source rendered on the screen.|[highlightColor](apple:AppKit/NSColor/highlightColor)|
|Keyboard focus indicator color|The ring that appears around a control when it has keyboard focus during interface navigation.|[keyboardFocusIndicatorColor](apple:AppKit/NSColor/keyboardFocusIndicatorColor)|
|Label color|The text associated with a label containing primary content.|[labelColor](apple:AppKit/NSColor/labelColor)|
|Link color|The visual representation of a link to other content.|[linkColor](apple:AppKit/NSColor/linkColor)|
|Placeholder text color|The color of a placeholder string within a control or text view.|[placeholderTextColor](apple:AppKit/NSColor/placeholderTextColor)|
|Quaternary label color|The text of a label that carries less importance than a tertiary label, such as watermark text.|[quaternaryLabelColor](apple:AppKit/NSColor/quaternaryLabelColor)|
|Secondary label color|The text of a label that is less important than a primary label, such as a subheading or supplementary information.|[secondaryLabelColor](apple:AppKit/NSColor/secondaryLabelColor)|
|Selected content background color|The background for selected content within a key window or view.|[selectedContentBackgroundColor](apple:AppKit/NSColor/selectedContentBackgroundColor)|
|Selected control color|The surface of a selected control.|[selectedControlColor](apple:AppKit/NSColor/selectedControlColor)|
|Selected control text color|The text of a selected control.|[selectedControlTextColor](apple:AppKit/NSColor/selectedControlTextColor)|
|Selected menu item text color|The text of a selected menu entry.|[selectedMenuItemTextColor](apple:AppKit/NSColor/selectedMenuItemTextColor)|
|Selected text background color|The background behind selected text.|[selectedTextBackgroundColor](apple:AppKit/NSColor/selectedTextBackgroundColor)|
|Selected text color|The color used for selected text.|[selectedTextColor](apple:AppKit/NSColor/selectedTextColor)|
|Separator color|The visual element separating different sections of content.|[separatorColor](apple:AppKit/NSColor/separatorColor)|
|Shadow color|The virtual shadow cast by a raised object displayed on screen.|[shadowColor](apple:AppKit/NSColor/shadowColor)|
|Tertiary label color|The text of a label that carries less importance than a secondary label.|[tertiaryLabelColor](apple:AppKit/NSColor/tertiaryLabelColor)|
|Text background color|The backdrop color behind text.|[textBackgroundColor](apple:AppKit/NSColor/textBackgroundColor)|
|Text color|The text displayed within a document.|[textColor](apple:AppKit/NSColor/textColor)|
|Under page background color|The background visible behind a document's content.|[underPageBackgroundColor](apple:AppKit/NSColor/underPageBackgroundColor)|
|Unemphasized selected content background color|The background for selected content in a non-key window or view.|[unemphasizedSelectedContentBackgroundColor](apple:AppKit/NSColor/unemphasizedSelectedContentBackgroundColor)|
|Unemphasized selected text background color|The background for selected text in a non-key window or view.|[unemphasizedSelectedTextBackgroundColor](apple:AppKit/NSColor/unemphasizedSelectedTextBackgroundColor)|
|Unemphasized selected text color|The color of selected text in a non-key window or view.|[unemphasizedSelectedTextColor](apple:AppKit/NSColor/unemphasizedSelectedTextColor)|
|Window background color|The background of a window.|[windowBackgroundColor](apple:AppKit/NSColor/windowBackgroundColor)|
|Window frame text color|The text displayed in the window's title bar area.|[windowFrameTextColor](apple:AppKit/NSColor/windowFrameTextColor)|

##### App accent colors
Beginning with macOS 11, developers can define an *accent color* to customize the appearance of different app components, including buttons, selection indicators, and sidebar icons. The operating system applies this accent color only when the current setting in General > Accent color is set to *multicolor*.

Should users select an accent color value other than *multicolor*, the system will apply that chosen color to relevant elements throughout your application, overriding your defined accent color. An exception exists for a sidebar icon that utilizes a fixed color you specify; because this fixed color conveys meaning, the system will not override it when users modify their accent color preferences. For detailed instructions, consult **Sidebars**.
