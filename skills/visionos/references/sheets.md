# Sheets
A sheet enables users to execute a focused task that is contextually linked to their current view

## Platform guidance — visionOS
When a sheet is displayed within a visionOS application, it overlays its parent window, causing it to dim and becoming the primary focus of user interaction.

- **Do not allow a sheet to appear emerging from the bottom edge of a window.** To optimize visibility for users, it is recommended that you center the sheet within their **Field of view**.
- **Initialize a sheet at a default size that allows users to maintain context.** Avoid presenting a sheet that obscures the majority or entirety of its window, though allowing users to adjust the size is an option.
