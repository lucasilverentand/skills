---
name: windows
description: "A window displays the user interface views and components within your application or game. Use when designing windows for macOS, auditing windows against Apple's macOS guidelines, or when the user says things like \"design windows for Mac\", \"windows on macOS\", \"how should windows work on Mac\"."
allowed-tools: Read Grep Glob
---

# Windows
A window displays the user interface views and components within your application or game

## When to use
- User asks about **windows** on macOS (e.g. `"how do I design windows for Mac"`).
- User is building a Mac UI that needs windows and wants to follow Apple's guidelines.
- User asks to audit or review windows in a macOS design.
- User mentions windows in the context of a Mac app, game, or interface.

## Quick principles
- **Ensure your windows adapt fluidly to different sizes to support multiwindow and multitasking workflows** — Refer to [Layout](layout.md) and [Multitasking](multitasking.md) for detailed guidance
- **Determine the appropriate time to open a new window** — Presenting content in a separate window is beneficial for preserving context or enabling multitasking
- **Provide users with the option to view content in a new window** — Although it is recommended not to default to opening new windows unless it enhances the user experience, offering flexibility in how users…
- **Do not build custom window user interfaces** — System-managed windows possess a predictable appearance and behavior that users recognize
- **Main** — The primary window that users view is an application's main window
- **Key** — Also referred to as the *active window*, the key window receives user input
- **Inactive** — A window that is not currently in the foreground is considered inactive
- **Ensure custom windows adhere to the system's defined appearances** — Users depend on these visual differences to identify which window is in focus and which will accept their input
- **Avoid placing critical information or actions in a bottom bar, as users frequently rearrange windows in ways that obscure their lower edge** — If a bottom bar must be included, restrict its use to displaying a small amount of information directly related to the window's…

## Full guidance
Read the referenced files for the complete Apple guidance on this topic:
- @references/guidelines.md
