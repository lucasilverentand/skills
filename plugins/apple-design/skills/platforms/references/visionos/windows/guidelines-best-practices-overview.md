# Best practices — overview
- **Ensure your windows adapt fluidly to different sizes to support multiwindow and multitasking workflows.** Refer to **Layout** and **Multitasking** for detailed guidance.
- **Determine the appropriate time to open a new window.** Presenting content in a separate window is beneficial for preserving context or enabling multitasking. For instance, Mail generates a new window upon selecting Compose, allowing simultaneous visibility of the existing email and the new message. However, excessive use of new windows introduces visual clutter and complicates navigation. Unless contextually necessary for your application, refrain from making new window opening the default behavior.
- **Provide users with the option to view content in a new window.** Although it is recommended not to default to opening new windows unless it enhances the user experience, offering flexibility in how users view content is valuable. Allow users to initiate a new window via commands found in **Context menus** or the **File menu**. Developers should consult [OpenWindowAction](apple:SwiftUI/OpenWindowAction) for implementation details.
- **Do not build custom window user interfaces.** System-managed windows possess a predictable appearance and behavior that users recognize. Avoid creating custom window frames or controls, and do not attempt to replicate the system's appearance. If these elements are not perfectly matched to the system's look and behavior, your application may appear flawed.

**Use the term *window* in all user-facing content.** The system consistently refers to application windows as *windows*, irrespective of their underlying type. Employing alternative terminology—such as *scene*, which describes the window's implementation—is likely to confuse users.

## Platform guidance — visionOS
visionOS supports two primary display modes: default and volumetric. Both the standard window (referred to as a `window`) and the volumetric display (a `volume`) are capable of rendering both 2D and 3D content. Users may view multiple windows or volumes simultaneously, whether operating in Shared Space or Full Space.

> **Note**
visionOS also defines the `plain` window style, which is similar to the default style but omits the glass background on the upright plane. For developer guidance, refer to [PlainWindowStyle](apple:SwiftUI/PlainWindowStyle).

The system establishes the initial placement for the first window or volume opened within your application or game. In both Shared Space and Full Space, users have the ability to move these windows and volumes to new locations.
