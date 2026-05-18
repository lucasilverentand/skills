# Multitasking
Multitasking enables users to rapidly transition between applications and execute tasks within each

## Platform guidance — iOS & iPadOS

### iOS
On the iPhone, multitasking enables users to utilize FaceTime or view a video in Picture in Picture while concurrently operating another application.

### iPadOS
On iPad, users can simultaneously view and interact with multiple application windows from different apps. A single app may also support several open windows, allowing users to view and interact with more than one window within that same app at once.

Users can operate the iPad using either full-screen or windowed application modes. When in full screen, apps utilize the entire display, and users switch between individual app windows via the app switcher.

When operating in windowed mode, app windows are adjustable in size, and users can arrange them to meet their needs, mimicking macOS behavior. The system offers window controls for common tiling arrangements, entering full screen, minimizing, and closing windows. The system indicates the currently active window by coloring its controls and casting a drop shadow onto windows behind it. For detailed guidance, refer to [iPadOS](windows.md#iPadOS).

Furthermore, videos and FaceTime calls can display in a Picture in Picture overlay above other content, regardless of whether the apps are running full screen or windowed.

> **Note**
> Apps do not control multitasking configurations, nor are they notified of the choices users make regarding these configurations.

To ensure your app functions correctly when opened in a windowed state, it must adapt smoothly to different screen dimensions. For guidance, consult **Layout** and [Windows](windows.md); for developer instructions, see [Multitasking on iPad, Mac, and Apple Vision Pro](apple:UIKit/multitasking-on-ipad-mac-and-apple-vision-pro). To learn more about how users employ iPad multitasking features, visit [Use multitasking on your iPad](https://support.apple.com/en-us/HT207582).
