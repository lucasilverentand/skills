---
name: file-management
description: "Certain applications are designed to support documents and files that users expect to manage across the entire system. Use when designing file management for iOS and iPadOS, auditing file management against Apple's iOS and iPadOS guidelines, or when the user says things like \"design file management for iPhone\", \"file management on iOS and iPadOS\", \"how should file management work on iPhone\"."
allowed-tools: Read Grep Glob
---

# File management
Certain applications are designed to support documents and files that users expect to manage across the entire system

## When to use
- User asks about **file management** on iOS and iPadOS (e.g. `"how do I design file management for iPhone"`).
- User is building an iPhone UI that needs file management and wants to follow Apple's guidelines.
- User asks to audit or review file management in an iOS and iPadOS design.
- User mentions file management in the context of an iPhone app, game, or interface.

## Quick principles
- **Utilize application menus and keyboard shortcuts to provide users with efficient methods for creating and accessing documents** — In both iPadOS and macOS, users anticipate using standard menu commands to generate new or locate existing documents
- **Should your application require a custom file browser, ensure it aligns with users' knowledge of the platform’s file system** — Users familiar with the Finder and Files apps already possess an understanding of their device's fundamental file structure
- **Implement a Quick Look viewer to allow users to preview a file even if your app does not natively support it** — If your application allows users to attach or interact with files that it cannot handle, providing a Quick Look viewer lets them…
- **Evaluate implementing a Quick Look generator if your app generates proprietary file types** — A Quick Look generator allows other applications—such as Finder, Files, and Spotlight—to display previews of your documents, thereby improving their discoverability
- **Assign your application’s most critical functions to the title card buttons** — The primary button should typically initiate a new document, and the secondary button can offer supplementary choices
- **Ensure the background is visually distinct from both the accessories and the title card** — You may utilize a solid color, a gradient, or a pattern
- **Be thoughtful about accessory placement** — For example, you can position accessories both in front of and behind the title card to achieve a sense of depth, but…
- **Use animation judiciously** — Excessive motion on the display can confuse or disorient users
- **When users utilize your file provider extension to open or import files, display only those documents relevant to the current context** — For instance, if a PDF editor loads your extension, restrict listings to PDF files for opening or importing
- **Ensure users select a destination when exporting or moving files** — Unless your application stores all documents in one directory, allow users to navigate to a precise destination within your established directory hierarchy
- **Do not include a custom top toolbar** — Since your extension loads within a modal view that already contains a toolbar, adding a second one causes confusion and consumes valuable…

## Full guidance
Read the referenced files for the complete Apple guidance on this topic:
- @references/guidelines.md
