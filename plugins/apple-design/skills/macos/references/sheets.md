# Sheets
A sheet enables users to execute a focused task that is contextually linked to their current view

## Platform guidance — macOS
In macOS, a sheet functions as a card-like view with rounded corners that overlays its parent window. While the sheet is visible, the parent window becomes dimmed, indicating that interaction with it is suspended until the sheet is dismissed. However, users often expect to continue interacting with other application windows even while a sheet is open.

- **Present a sheet in a reasonable default size.** Since users typically do not anticipate resizing sheets, it is crucial to select an initial dimension appropriate for the content. Nevertheless, if the application requires expansion for optimal viewing—such as in certain use cases—supporting resizing is beneficial.
- **Let people interact with other app windows without first dismissing a sheet.** When a sheet appears, bring its parent window to the foreground. If that parent is a document window, also advance any associated modeless document panels. Ensure users can bring other windows within your application forward even before they have dismissed the sheet.
- **Use a panel instead of a sheet if people need to repeatedly provide input and observe results.** For instance, a find and replace panel might allow users to initiate replacements individually, enabling them to verify the outcome of each search. For further guidance, consult [Panels](panels.md).
