---
name: windows
description: "A window displays the user interface views and components within your application or game. Use when designing windows for tvOS, auditing windows against Apple's tvOS guidelines, or when the user says things like \"design windows for Apple TV\", \"windows on tvOS\", \"how should windows work on Apple TV\"."
allowed-tools: Read Grep Glob
---

# Windows
A window displays the user interface views and components within your application or game

## When to use
- User asks about **windows** on tvOS (e.g. `"how do I design windows for Apple TV"`).
- User is building an Apple TV UI that needs windows and wants to follow Apple's guidelines.
- User asks to audit or review windows in a tvOS design.
- User mentions windows in the context of an Apple TV app, game, or interface.

On iPadOS, macOS, and visionOS, windows serve to establish the visual limits of app content, isolating it from other parts of the operating system. They also enable multitasking workflows both inside and between applications. Windows incorporate built-in system elements, such as frames and window controls, which allow users to open, shut, resize, and move them.

Conceptually, applications utilize two kinds of windows to display content:

- A *primary* window displays the main navigation and core content, along with related actions for an app.
- An *auxiliary* window presents a particular task or section within an app. Since it is dedicated to a single experience, an auxiliary window prevents navigation to other parts of the app and usually includes a button allowing users to dismiss it once the task is finished.

For advice on arranging content inside a window across any platform, refer to [Layout](layout.md); for guidance on arranging content in Apple Vision Pro space, consult [Spatial layout](spatial-layout.md). For developer resources, see [Windows](apple:SwiftUI/Windows).

### Best practices
- **Ensure your windows adapt fluidly to different sizes to support multiwindow and multitasking workflows.** Refer to [Layout](layout.md) and [Multitasking](multitasking.md) for detailed guidance.
- **Determine the appropriate time to open a new window.** Presenting content in a separate window is beneficial for preserving context or enabling multitasking. For instance, Mail generates a new window upon selecting Compose, allowing simultaneous visibility of the existing email and the new message. However, excessive use of new windows introduces visual clutter and complicates navigation. Unless contextually necessary for your application, refrain from making new window opening the default behavior.
- **Provide users with the option to view content in a new window.** Although it is recommended not to default to opening new windows unless it enhances the user experience, offering flexibility in how users view content is valuable. Allow users to initiate a new window via commands found in [Context menus](context-menus.md) or the [File menu](the-menu-bar.md#File-menu). Developers should consult [OpenWindowAction](apple:SwiftUI/OpenWindowAction) for implementation details.
- **Do not build custom window user interfaces.** System-managed windows possess a predictable appearance and behavior that users recognize. Avoid creating custom window frames or controls, and do not attempt to replicate the system's appearance. If these elements are not perfectly matched to the system's look and behavior, your application may appear flawed.

**Use the term *window* in all user-facing content.** The system consistently refers to application windows as *windows*, irrespective of their underlying type. Employing alternative terminology—such as *scene*, which describes the window's implementation—is likely to confuse users.
