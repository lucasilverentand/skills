---
name: labels
description: "A label is static text that users can read and often copy, but they cannot modify. Use when designing labels for macOS, auditing labels against Apple's macOS guidelines, or when the user says things like \"design labels for Mac\", \"labels on macOS\", \"how should labels work on Mac\"."
allowed-tools: Read Grep Glob
---

# Labels
A label is static text that users can read and often copy, but they cannot modify

## When to use
- User asks about **labels** on macOS (e.g. `"how do I design labels for Mac"`).
- User is building a Mac UI that needs labels and wants to follow Apple's guidelines.
- User asks to audit or review labels in a macOS design.
- User mentions labels in the context of a Mac app, game, or interface.

Labels are used throughout the interface—in buttons, menu items, and views—to help users understand the current context and what actions are available.

The term *label* refers to non-editable text appearing across many contexts. For instance:

- In a button, the label typically conveys the function of that button (e.g., Edit, Cancel, or Send).
- In many lists, a label describes each entry and may be accompanied by an image or symbol.
- In a view, a label can offer extra context by introducing a control or describing a common task the user performs within that view.

> **Developer note**
> To display uneditable text, SwiftUI defines two components: [Label](apple:SwiftUI/Label) and [Text](apple:SwiftUI/Text).

The guidance below offers assistance on how to use a label for displaying text. Additionally, documentation specific to certain components—such as [action buttons](buttons.md), [menus](menus.md), and [lists and tables](lists-and-tables.md)—includes further recommendations regarding text implementation.

### Best practices
- **Use a label to display small amounts of text that users should not modify.** If you require users to edit a limited amount of text, utilize a [text field](text-fields.md). For displaying large amounts of text, with optional editing capabilities, use a [text view](text-views.md).
- **Prefer system fonts.** A label can display both plain and styled text, and it defaults to supporting Dynamic Type (where supported). If you modify the label's style or implement custom fonts, ensure the text remains easily readable.
- **Use system-provided label colors to convey relative importance.** The operating system defines four label colors whose appearance varies, assisting you in assigning different visual weights to the text. For further guidance, refer to [Color](color.md).

|System color|Example usage|iOS, iPadOS, tvOS, visionOS|macOS|
|---|---|---|---|
|Label|Primary information|[label](apple:UIKit/UIColor/label)|[labelColor](apple:AppKit/NSColor/labelColor)|
|Secondary label|A subheading or supplemental text|[secondaryLabel](apple:UIKit/UIColor/secondaryLabel)|[secondaryLabelColor](apple:AppKit/NSColor/secondaryLabelColor)|
|Tertiary label|Text describing unavailable items or behavior|[tertiaryLabel](apple:UIKit/UIColor/tertiaryLabel)|[tertiaryLabelColor](apple:AppKit/NSColor/tertiaryLabelColor)|
|Quaternary label|Watermark text|[quaternaryLabel](apple:UIKit/UIColor/quaternaryLabel)|[quaternaryLabelColor](apple:AppKit/NSColor/quaternaryLabelColor)|

**Make useful label text selectable.** If a label contains information that is important to the user—such as an IP address, location, or error message—consider enabling selection and copying so users can paste it elsewhere.

## Platform guidance — macOS
> **Developer note**
To show text that cannot be modified within a label, utilize the `isEditable` property found on `NSTextField`.
