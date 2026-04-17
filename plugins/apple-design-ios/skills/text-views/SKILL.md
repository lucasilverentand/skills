---
name: text-views
description: "A `TextView` presents multi-line, styled text content that may or may not be editable. Use when designing text views for iOS and iPadOS, auditing text views against Apple's iOS and iPadOS guidelines, or when the user says things like \"design text views for iPhone\", \"text views on iOS and iPadOS\", \"how should text views work on iPhone\"."
allowed-tools: Read Grep Glob
---

# Text views
A `TextView` presents multi-line, styled text content that may or may not be editable

## When to use
- User asks about **text views** on iOS and iPadOS (e.g. `"how do I design text views for iPhone"`).
- User is building an iPhone UI that needs text views and wants to follow Apple's guidelines.
- User asks to audit or review text views in an iOS and iPadOS design.
- User mentions text views in the context of an iPhone app, game, or interface.

These views can accommodate any height and support scrolling when the content extends beyond the view boundaries. By default, the text aligns to the leading edge and utilizes the system label color. On iOS, iPadOS, and visionOS, if a `TextView` is editable, selecting it causes the keyboard to appear.

### Best practices
- **Use a text view when you need to display text that’s long, editable, or in a special format.** Text views provide the most options for displaying specialized content and accepting text input, differing from [Text fields](text-fields.md) and [Labels](labels.md). If you only need to display a small amount of text, it is simpler to use a label or — if editing is required — a text field.
- **Keep text legible.** Although you may use multiple fonts, colors, and alignments creatively, maintaining the readability of your content is essential. It is recommended to adopt Dynamic Type so that text remains visually consistent when users change the device's font size. Ensure you test your content with accessibility options enabled, such as bold text. For further information, consult [Accessibility](accessibility.md) and [Typography](typography.md).
- **Make useful text selectable.** If a text view contains important information like an error message, serial number, or IP address, allow users to select and copy it for pasting elsewhere.

## Platform guidance — iOS & iPadOS
**Display the correct keyboard type.** different keyboards are available, each suited for a specific input method. To optimize data entry, the keyboard presented while editing a text view must correspond to the content type. For detailed information, consult [Virtual keyboards](virtual-keyboards.md).
