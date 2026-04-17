---
name: pickers
description: "A picker presents one or more scrollable lists containing unique values from which users can select. Use when designing pickers for iOS and iPadOS, auditing pickers against Apple's iOS and iPadOS guidelines, or when the user says things like \"design pickers for iPhone\", \"pickers on iOS and iPadOS\", \"how should pickers work on iPhone\"."
allowed-tools: Read Grep Glob
---

# Pickers
A picker presents one or more scrollable lists containing unique values from which users can select

## When to use
- User asks about **pickers** on iOS and iPadOS (e.g. `"how do I design pickers for iPhone"`).
- User is building an iPhone UI that needs pickers and wants to follow Apple's guidelines.
- User asks to audit or review pickers in an iOS and iPadOS design.
- User mentions pickers in the context of an iPhone app, game, or interface.

The system offers different picker styles, each supporting distinct types of selectable data and presenting a unique visual interface. The specific values displayed in a picker, along with their sequence, are contingent upon the device's language settings.

Pickers facilitate data entry by allowing users to select either a single or multiple values. Date pickers, in particular, provide alternative selection methods, such as picking a day via a calendar view or inputting dates and times using a numeric keypad.

### Best practices
- **Consider using a picker for medium or extended lists of options.** If the selection set is relatively small, consider employing a [Pull-down buttons](pull-down-buttons.md) instead of a picker. While pickers facilitate rapid scrolling through numerous items, they may impose excessive visual weight on a short list. Conversely, for extremely large datasets, refer to [Lists and tables](lists-and-tables.md). Lists and tables allow height adjustments, and tables can incorporate an index, enabling much faster targeting of specific sections.
- **Use values that are logically ordered and predictable.** Many picker values can remain hidden until user interaction. It is optimal when users can anticipate the hidden options, such as using an alphabetized list of countries, allowing them to navigate items efficiently.
- **Avoid requiring a view change to display the picker.** A picker functions best when presented in context, located near or beneath the field being edited. Typically, a picker manifests at the base of a window or within a popover.
- **Consider offering reduced granularity when selecting minutes in a date picker.** By default, the minute selection includes 60 values (ranging from 0 to 59). You have the option to increase the minute interval, provided that the new interval divides evenly into 60. For instance, you might choose quarter-hour increments (0, 15, 30, and 45).

## Platform guidance — iOS & iPadOS
A date picker serves as an efficient interface for selecting a specific date, time, or both, accommodating input via touch, keyboard, or pointing device. You may present a date picker using one of the following display styles:

- Compact — A control that displays editable date and time information within a modal view, accessed via a button.
- Inline — For time selection only, it uses a button displaying value wheels; for dates and times, it utilizes an inline calendar view.
- Wheels — A collection of scrolling wheels that also supports data input using integrated or external keyboards.
- Automatic — A style determined by the system based on the current platform and the date picker's operational mode.

A date picker operates in four distinct modes, each presenting a unique set of selectable values.

- Date — Displays years, months, and days of the month.
- Time — Displays hours, minutes, and (optionally) an AM/PM indicator.
- Date and time — Displays dates, hours, minutes, and (optionally) an AM/PM indicator.
- Countdown timer — Displays hours and minutes, up to a maximum duration of 23 hours and 59 minutes. This mode is unavailable when using the inline or compact styles.

The precise values displayed in a date picker, as well as their sequence, are dependent upon the device's geographical location.

Below are several examples illustrating different combinations of style and mode for date pickers.

**Use a compact date picker when screen real estate is limited.** The compact style features a button that displays the current value in your application's accent color. When this button is tapped, the date picker opens a modal view, granting access to both a familiar calendar-style editor and a time selector. Within this modal view, users can make multiple modifications to dates and times before confirming their choices by tapping outside the view.
