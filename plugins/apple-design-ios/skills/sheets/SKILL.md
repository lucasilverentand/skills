---
name: sheets
description: "A sheet enables users to execute a focused task that is contextually linked to their current view. Use when designing sheets for iOS and iPadOS, auditing sheets against Apple's iOS and iPadOS guidelines, or when the user says things like \"design sheets for iPhone\", \"sheets on iOS and iPadOS\", \"how should sheets work on iPhone\"."
allowed-tools: Read Grep Glob
---

# Sheets
A sheet enables users to execute a focused task that is contextually linked to their current view

## When to use
- User asks about **sheets** on iOS and iPadOS (e.g. `"how do I design sheets for iPhone"`).
- User is building an iPhone UI that needs sheets and wants to follow Apple's guidelines.
- User asks to audit or review sheets in an iOS and iPadOS design.
- User mentions sheets in the context of an iPhone app, game, or interface.

## Quick principles
- **For complex or prolonged user flows, consider alternatives to sheets** — For instance, iOS and iPadOS support a full-screen modal presentation style that is effective for displaying media (videos, photos, camera feeds) or…
- **Display only one sheet at a time from the main interface** — Users expect to return to the parent view or window when they dismiss a sheet
- **Use a nonmodal view when you want to present supplementary items that affect the main task in the parent view** — To allow users access to information and actions needed while they continue interacting with the primary window, consider using [Split views](split-views.md) in…
- **Provide an alternative to the Done button** — If you include a Done button, always pair it with either a Cancel button—to allow dismissal without confirming or saving changes—or a…
- **In an iPhone application, consider supporting the medium detent to enable progressive disclosure of the sheet's content** — For instance, a share sheet can display the most critical items within the medium detent, making them visible without requiring resizing
- **Include a grabber in resizable sheets** — A grabber informs users that the sheet can be dragged to resize it; they can also tap it to cycle through available…
- **Support swiping to dismiss a sheet** — Users expect vertical swiping to dismiss a sheet rather than needing to tap a dedicated dismiss button
- **Prefer using the page or form sheet presentation styles in an iPadOS application** — Each style utilizes a default size for the sheet, centering its content over a dimmed background view and ensuring a consistent user…

## Full guidance
Read the referenced files for the complete Apple guidance on this topic:
- @references/guidelines.md
