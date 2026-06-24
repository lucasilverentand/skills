# Labels
A label is static text that users can read and often copy, but they cannot modify

## Platform guidance — watchOS
The date and time text components (shown on the left) display either the current date, the present time, or both combined. You have the ability to customize a date text component using different formats, calendars, and time zones. Conversely, a countdown timer text component (shown on the right) displays an exact count-up or countdown. These timer components can also be configured to present their count value in multiple formats.

When utilizing the system-provided date and timer text components, watchOS automatically adjusts how the label is presented to fit the available screen real estate. Furthermore, the system handles content updates without requiring any additional input from your application.

We recommend considering the use of date and timer components within complications. For design advice, consult **Complications**; for developer instructions, refer to [Text](apple:SwiftUI/Text).
