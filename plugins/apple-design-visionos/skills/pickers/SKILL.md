---
name: pickers
description: "A picker presents one or more scrollable lists containing unique values from which users can select. Use when designing pickers for visionOS, auditing pickers against Apple's visionOS guidelines, or when the user says things like \"design pickers for Apple Vision Pro\", \"pickers on visionOS\", \"how should pickers work on Apple Vision Pro\"."
allowed-tools: Read Grep Glob
---

# Pickers
A picker presents one or more scrollable lists containing unique values from which users can select

## When to use
- User asks about **pickers** on visionOS (e.g. `"how do I design pickers for Apple Vision Pro"`).
- User is building an Apple Vision Pro UI that needs pickers and wants to follow Apple's guidelines.
- User asks to audit or review pickers in a visionOS design.
- User mentions pickers in the context of an Apple Vision Pro app, game, or interface.

The system offers different picker styles, each supporting distinct types of selectable data and presenting a unique visual interface. The specific values displayed in a picker, along with their sequence, are contingent upon the device's language settings.

Pickers facilitate data entry by allowing users to select either a single or multiple values. Date pickers, in particular, provide alternative selection methods, such as picking a day via a calendar view or inputting dates and times using a numeric keypad.

### Best practices
- **Consider using a picker for medium or extended lists of options.** If the selection set is relatively small, consider employing a [Pull-down buttons](pull-down-buttons.md) instead of a picker. While pickers facilitate rapid scrolling through numerous items, they may impose excessive visual weight on a short list. Conversely, for extremely large datasets, refer to [Lists and tables](lists-and-tables.md). Lists and tables allow height adjustments, and tables can incorporate an index, enabling much faster targeting of specific sections.
- **Use values that are logically ordered and predictable.** Many picker values can remain hidden until user interaction. It is optimal when users can anticipate the hidden options, such as using an alphabetized list of countries, allowing them to navigate items efficiently.
- **Avoid requiring a view change to display the picker.** A picker functions best when presented in context, located near or beneath the field being edited. Typically, a picker manifests at the base of a window or within a popover.
- **Consider offering reduced granularity when selecting minutes in a date picker.** By default, the minute selection includes 60 values (ranging from 0 to 59). You have the option to increase the minute interval, provided that the new interval divides evenly into 60. For instance, you might choose quarter-hour increments (0, 15, 30, and 45).
