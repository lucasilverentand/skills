# Pickers
A picker presents one or more scrollable lists containing unique values from which users can select

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
