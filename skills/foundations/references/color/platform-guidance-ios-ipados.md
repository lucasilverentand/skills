# Platform guidance — iOS & iPadOS
iOS provides two categories of dynamic background colors—*system* and *grouped*. Both sets include primary, secondary, and tertiary variants designed to establish information hierarchy. Generally, when implementing a grouped table view, utilize the background colors found in `[systemGroupedBackground](apple:UIKit/UIColor/systemGroupedBackground)`, `[secondarySystemGroupedBackground](apple:UIKit/UIColor/secondarySystemGroupedBackground)`, and `[tertiarySystemGroupedBackground](apple:UIKit/UIColor/tertiarySystemGroupedBackground)`. If not using a grouped table view, use the standard system background colors: `[systemBackground](apple:UIKit/UIColor/systemBackground)`, `[secondarySystemBackground](apple:UIKit/UIColor/secondarySystemBackground)`, and `[tertiarySystemBackground](apple:UIKit/UIColor/tertiarySystemBackground)`.

For both background color sets, the variants are typically used to denote hierarchy as follows:

- Primary indicates the overall view.
- Secondary is used for content or elements grouped within the main view.
- Tertiary is reserved for grouping content or elements nested inside secondary elements.

For foreground content, iOS defines the following dynamic colors:

|Color|Use for…|UIKit API|
|---|---|---|
|Label|A text label displaying primary content.|[label](apple:UIKit/UIColor/label)|
|Secondary label|A text label displaying secondary content.|[secondaryLabel](apple:UIKit/UIColor/secondaryLabel)|
|Tertiary label|A text label displaying tertiary content.|[tertiaryLabel](apple:UIKit/UIColor/tertiaryLabel)|
|Quaternary label|A text label displaying quaternary content.|[quaternaryLabel](apple:UIKit/UIColor/quaternaryLabel)|
|Placeholder text|Text used as a placeholder in controls or text views.|[placeholderText](apple:UIKit/UIColor/placeholderText)|
|Separator|A separator that permits underlying content visibility.|[separator](apple:UIKit/UIColor/separator)|
|Opaque separator|A separator that prevents any underlying content visibility.|[opaqueSeparator](apple:UIKit/UIColor/opaqueSeparator)|
|Link|Text that functions as a hyperlink.|[link](apple:UIKit/UIColor/link)|
