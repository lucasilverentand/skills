---
name: windows
description: "A window displays the user interface views and components within your application or game. Use when designing windows for iOS and iPadOS, auditing windows against Apple's iOS and iPadOS guidelines, or when the user says things like \"design windows for iPhone\", \"windows on iOS and iPadOS\", \"how should windows work on iPhone\"."
allowed-tools: Read Grep Glob
---

# Windows
A window displays the user interface views and components within your application or game

## When to use
- User asks about **windows** on iOS and iPadOS (e.g. `"how do I design windows for iPhone"`).
- User is building an iPhone UI that needs windows and wants to follow Apple's guidelines.
- User asks to audit or review windows in an iOS and iPadOS design.
- User mentions windows in the context of an iPhone app, game, or interface.

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

## Platform guidance — iOS & iPadOS
The application can appear in one of two modes, depending on the user's selection within Multitasking & Gestures settings.

- **Full screen.** The application fills the entire display, and users switch between it—or between different windows of the same app—using the application switcher.
- **Windowed.** Users have full control over resizing the application windows. Multiple windows can be visible simultaneously, and users can arrange or bring them to the foreground. The system retains the window's size and placement even after the app has been closed.
- **Ensure that window controls do not obscure toolbar elements.** When operating in windowed mode, app windows include window controls along the leading edge of the toolbar. If your application features buttons at this leading edge, they may become hidden when window controls appear. To prevent this issue, move these buttons inward rather than placing them directly on the leading edge where window controls reside.
- **Consider allowing users to open content in a new window via a gesture.** For instance, a user might use the pinch gesture to expand a Notes item into its own window. For developer guidance, refer to [collectionView(_:sceneActivationConfigurationForItemAt:point:)](apple:UIKit/UICollectionViewDelegate/collectionView(_:sceneActivationConfigurationForItemAt:point:)) (to handle the transition from a collection view item) or [UIWindowScene.ActivationInteraction](apple:UIKit/UIWindowScene/ActivationInteraction) (for transitions originating from any other view item).

> **Tip**
> If your application only needs to allow users to view a single file, you can present it without creating a dedicated window, provided that your app still supports multiple windows. For developer guidance on this approach, see [QLPreviewSceneActivationConfiguration](apple:QuickLook/QLPreviewSceneActivationConfiguration).
