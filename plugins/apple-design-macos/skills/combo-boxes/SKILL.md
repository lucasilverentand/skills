---
name: combo-boxes
description: "A combo box integrates a text field and a pull-down button into a single control. Use when designing combo boxes for macOS, auditing combo boxes against Apple's macOS guidelines, or when the user says things like \"design combo boxes for Mac\", \"combo boxes on macOS\", \"how should combo boxes work on Mac\"."
allowed-tools: Read Grep Glob
---

# Combo boxes
A combo box integrates a text field and a pull-down button into a single control

## When to use
- User asks about **combo boxes** on macOS (e.g. `"how do I design combo boxes for Mac"`).
- User is building a Mac UI that needs combo boxes and wants to follow Apple's guidelines.
- User asks to audit or review combo boxes in a macOS design.
- User mentions combo boxes in the context of a Mac app, game, or interface.

Users can either enter a custom value into the field or click the button to select from a list of predefined options. Any custom values entered by users are not automatically added to the choice list.

### Best practices
- **Include a meaningful default value from the list.** Although the field may be left blank, it is optimal if the default selection corresponds to one of the hidden options. The initial value does not need to be the first item in the list.
- **Provide an introductory label to inform users about the expected content.** Generally, labels should employ title-style capitalization and conclude with a colon. For related information, consult [Labels](labels.md).
- **Offer relevant choices.** Users appreciate the option to enter a custom value, as well as the convenience of selecting from a list containing the most probable choices.
- **Ensure list items do not exceed the text field width.** If an item is too wide, the text field may truncate it, which hinders readability for users.

For guidance, see [Text fields](text-fields.md) and [Pull-down buttons](pull-down-buttons.md).
