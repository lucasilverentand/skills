---
name: labels
description: "A label is static text that users can read and often copy, but they cannot modify. Use when designing labels for watchOS, auditing labels against Apple's watchOS guidelines, or when the user says things like \"design labels for Apple Watch\", \"labels on watchOS\", \"how should labels work on Apple Watch\"."
allowed-tools: Read Grep Glob
---

# Labels
A label is static text that users can read and often copy, but they cannot modify

## When to use
- User asks about **labels** on watchOS (e.g. `"how do I design labels for Apple Watch"`).
- User is building an Apple Watch UI that needs labels and wants to follow Apple's guidelines.
- User asks to audit or review labels in a watchOS design.
- User mentions labels in the context of an Apple Watch app, game, or interface.

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

## Platform guidance — watchOS
The date and time text components (shown on the left) display either the current date, the present time, or both combined. You have the ability to customize a date text component using different formats, calendars, and time zones. Conversely, a countdown timer text component (shown on the right) displays an exact count-up or countdown. These timer components can also be configured to present their count value in multiple formats.

When utilizing the system-provided date and timer text components, watchOS automatically adjusts how the label is presented to fit the available screen real estate. Furthermore, the system handles content updates without requiring any additional input from your application.

We recommend considering the use of date and timer components within complications. For design advice, consult [Complications](components/system-experiences/complications.md); for developer instructions, refer to [Text](apple:SwiftUI/Text).
