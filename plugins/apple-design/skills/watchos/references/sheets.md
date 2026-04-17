# Sheets
A sheet enables users to execute a focused task that is contextually linked to their current view

## Platform guidance — watchOS
In watchOS, a sheet manifests as a full-screen view sliding over the app's active content. While the sheet itself is semi-transparent to maintain context, the system applies a material effect to the background, blurring and desaturating the underlying content.

- **Use a sheet exclusively when your modal task necessitates custom content or title presentation.** If the goal is to convey crucial information or present options, consider employing [Alerts](alerts.md) or [Action sheets](action-sheets.md).
- **Keep sheet interactions brief and infrequent.** Employ a sheet solely as a temporary interruption to the ongoing workflow, dedicated only to facilitating a critical task. Do not use it for navigating through your app's content.
- **If you modify the default label, prioritize SF Symbols to represent the action.** Avoid labels that might suggest the sheet is part of a hierarchical navigation structure. Furthermore, if the top-leading corner text resembles a page or app title, users may not understand how to dismiss the sheet. Refer to **Standard icons** for guidance.
