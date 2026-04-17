---
name: photo-editing
description: "Photo-editing extensions enable users to modify photos and videos within the Photos app by applying filters or performing other alterations. Use when designing photo editing for tvOS, auditing photo editing against Apple's tvOS guidelines, or when the user says things like \"design photo editing for Apple TV\", \"photo editing on tvOS\", \"how should photo editing work on Apple TV\"."
allowed-tools: Read Grep Glob
---

# Photo editing
Photo-editing extensions enable users to modify photos and videos within the Photos app by applying filters or performing other alterations

## When to use
- User asks about **photo editing** on tvOS (e.g. `"how do I design photo editing for Apple TV"`).
- User is building an Apple TV UI that needs photo editing and wants to follow Apple's guidelines.
- User asks to audit or review photo editing in a tvOS design.
- User mentions photo editing in the context of an Apple TV app, game, or interface.

All edits are committed in the Photos app as new files, thereby guaranteeing the preservation of the original versions.

To utilize a photo editing extension, the photograph must first be in edit mode. While in this mode, tapping the extension icon located in the toolbar displays a menu listing all available editing extensions. Selecting an option launches the extension's interface within a modal view that includes its own top toolbar. Dismissing this view either confirms and saves the modification or cancels it, returning to the Photos app.

### Best practices
- **Confirm cancellation of edits.** If a user selects the Cancel button, do not automatically discard their work. Instead, prompt them to confirm they wish to cancel and clearly state that all current edits will be lost upon confirmation. This confirmation step is unnecessary if no changes have been applied yet.
- **Do not supply a custom top toolbar.** Since your extension operates within a modal view that already contains a toolbar, introducing a second one causes confusion and unnecessarily consumes screen real estate.
- **Allow users to preview edits.** Users must be able to view the outcome of their work before they close your extension and return to the Photos application, as approving an edit without seeing it is difficult.
- **Use your app icon for the photo editing extension icon.** This practice builds user confidence that the extension is officially provided by your application.
