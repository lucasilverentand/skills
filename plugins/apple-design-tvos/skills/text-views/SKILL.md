---
name: text-views
description: "A `TextView` presents multi-line, styled text content that may or may not be editable. Use when designing text views for tvOS, auditing text views against Apple's tvOS guidelines, or when the user says things like \"design text views for Apple TV\", \"text views on tvOS\", \"how should text views work on Apple TV\"."
allowed-tools: Read Grep Glob
---

# Text views
A `TextView` presents multi-line, styled text content that may or may not be editable

## When to use
- User asks about **text views** on tvOS (e.g. `"how do I design text views for Apple TV"`).
- User is building an Apple TV UI that needs text views and wants to follow Apple's guidelines.
- User asks to audit or review text views in a tvOS design.
- User mentions text views in the context of an Apple TV app, game, or interface.

These views can accommodate any height and support scrolling when the content extends beyond the view boundaries. By default, the text aligns to the leading edge and utilizes the system label color. On iOS, iPadOS, and visionOS, if a `TextView` is editable, selecting it causes the keyboard to appear.

### Best practices
- **Use a text view when you need to display text that’s long, editable, or in a special format.** Text views provide the most options for displaying specialized content and accepting text input, differing from [Text fields](text-fields.md) and [Labels](labels.md). If you only need to display a small amount of text, it is simpler to use a label or — if editing is required — a text field.
- **Keep text legible.** Although you may use multiple fonts, colors, and alignments creatively, maintaining the readability of your content is essential. It is recommended to adopt Dynamic Type so that text remains visually consistent when users change the device's font size. Ensure you test your content with accessibility options enabled, such as bold text. For further information, consult [Accessibility](accessibility.md) and [Typography](typography.md).
- **Make useful text selectable.** If a text view contains important information like an error message, serial number, or IP address, allow users to select and copy it for pasting elsewhere.

## Platform guidance — tvOS
Text views should be used to display content within tvOS. Given that text input on tvOS is intentionally minimal, editable text must instead utilize [Text fields](text-fields.md).
