# Multitasking
Multitasking enables users to rapidly transition between applications and execute tasks within each

## Platform guidance — visionOS
On Apple Vision Pro, users can run multiple applications concurrently within Shared Space, allowing them to view and switch between windows and volumes across the entire environment.

Only one window is active at any given time in Shared Space. When users shift focus from one window to another, the currently viewed window becomes active, while the previous window transitions into a more translucent state and appears to recede along the z-axis. Closing an application window in Shared Space moves the app into the background without terminating it.

> **Note**
> If an application is designated as the Now Playing app, closing its window automatically pauses audio playback; users can resume playback via Control Center without needing to reopen the window.

- **Do not disrupt the system's multitasking behavior.** When users move their gaze from one window to another, visionOS applies a feathered mask to the window they are looking away from to clearly indicate its changed state. To prevent interference with this visual feedback mechanism, refrain from altering the appearance of a window’s edges.
- **Do not halt video playback in a window when users look elsewhere.** In visionOS, consistent with macOS behavior, users expect that playback initiated in one window will continue while they are viewing or operating within a different window.
- **Be prepared for scenarios where your audio may duck.** Unless the app is currently functioning as the Now Playing app, its audio volume can decrease when users shift focus away from it to another application.
