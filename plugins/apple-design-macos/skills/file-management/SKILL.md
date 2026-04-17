---
name: file-management
description: "Certain applications are designed to support documents and files that users expect to manage across the entire system. Use when designing file management for macOS, auditing file management against Apple's macOS guidelines, or when the user says things like \"design file management for Mac\", \"file management on macOS\", \"how should file management work on Mac\"."
allowed-tools: Read Grep Glob
---

# File management
Certain applications are designed to support documents and files that users expect to manage across the entire system

## When to use
- User asks about **file management** on macOS (e.g. `"how do I design file management for Mac"`).
- User is building a Mac UI that needs file management and wants to follow Apple's guidelines.
- User asks to audit or review file management in a macOS design.
- User mentions file management in the context of a Mac app, game, or interface.

## Quick principles
- **Utilize application menus and keyboard shortcuts to provide users with efficient methods for creating and accessing documents** — In both iPadOS and macOS, users anticipate using standard menu commands to generate new or locate existing documents
- **Should your application require a custom file browser, ensure it aligns with users' knowledge of the platform’s file system** — Users familiar with the Finder and Files apps already possess an understanding of their device's fundamental file structure
- **Implement a Quick Look viewer to allow users to preview a file even if your app does not natively support it** — If your application allows users to attach or interact with files that it cannot handle, providing a Quick Look viewer lets them…
- **Evaluate implementing a Quick Look generator if your app generates proprietary file types** — A Quick Look generator allows other applications—such as Finder, Files, and Spotlight—to display previews of your documents, thereby improving their discoverability
- **Ensure your custom file selection interface is intuitive** — For instance, users may benefit from an "open recent" option alongside the basic "open" action
- **Include a save interface enabling users to modify a file's name, format, or location** — By default, a new document is titled "Untitled" until the user assigns a custom name
- **Evaluate extending the capabilities of the Save dialog** — If it aligns with your application's functionality, you may incorporate a custom accessory view into the Save dialog containing helpful settings or…
- **Help users prevent data loss if they disable autosaving** — Users can deactivate autosaving by toggling the “Ask to keep changes when closing documents” setting in Desktop & Dock preferences
- **When autosaving is disabled, ensure users are aware when a document has unsaved changes** — To signify unsaved modifications, display a dot on the document window's close button and adjacent to the document’s name in your application’s…

## Full guidance
Read the referenced files for the complete Apple guidance on this topic:
- @references/guidelines.md
