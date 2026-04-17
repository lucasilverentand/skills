# Windows — full guidelines
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

## Platform guidance — macOS
macOS users commonly run multiple applications concurrently, often managing several windows from different apps on a single desktop and frequently switching between them by moving, resizing, minimizing, or displaying windows according to their workflow.

To learn how to configure a window for displaying your game in macOS, refer to [Managing your game window for Metal in macOS](apple:Metal/managing-your-game-window-for-metal-in-macos).

##### macOS window anatomy
A macOS window is structured into a frame and a main body area. Users can reposition the window by dragging its frame, and resizing is often accomplished by manipulating its edges.

The window's *frame* resides above the body area and may contain window controls along with a [Toolbars](toolbars.md). Additionally, in uncommon scenarios, the window may feature a bottom bar—a component of the frame displayed beneath the body content.

##### macOS window states
A macOS window can exist in one of three states:

- **Main.** The primary window that users view is an application's main window. Each app may have only one main window.
- **Key.** Also referred to as the *active window*, the key window receives user input. Only one key window may be visible at any given time. While the main window of the foreground app is usually the key window, another window—such as a panel overlaid on the main window—might hold the key state instead. Users typically click a window to make it key; when users select an app's Dock icon to bring all its windows forward, only the most recently accessed window becomes key.
- **Inactive.** A window that is not currently in the foreground is considered inactive.

The system uses distinct visual cues to differentiate between main, key, and inactive windows, aiding users in identifying the focused window. For instance, the key window utilizes color within the title bar options for closing, minimizing, and zooming; inactive windows and main windows that are not key use gray in these options. Furthermore, inactive windows do not employ [Materials](materials.md) (an effect that integrates color from the content beneath it), causing them to appear subdued and visually further away than the main and key windows.

> **Note**
> Certain windows—typically panels like Colors or Fonts—only transition into the key window state when users click on the window's title bar or a component requiring keyboard input, such as a text field.

- **Ensure custom windows adhere to the system's defined appearances.** Users depend on these visual differences to identify which window is in focus and which will accept their input. When utilizing system-provided components, a window's background and button appearances update automatically as its state changes; however, if custom implementations are used, this synchronization must be handled by your code.
- **Avoid placing critical information or actions in a bottom bar, as users frequently rearrange windows in ways that obscure their lower edge.** If a bottom bar must be included, restrict its use to displaying a small amount of information directly related to the window's content or a selected item within it. For example, Finder uses a bottom bar (called the status bar) to show the total count of items in a window, the number of selected items, and available disk space. Since a bottom bar is limited in size, if more information needs to be displayed, consider using an inspector, which usually presents details on the trailing side of a split view.
