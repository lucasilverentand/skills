---
name: multitasking
description: "Multitasking enables users to rapidly transition between applications and execute tasks within each. Use when designing multitasking for iOS and iPadOS, auditing multitasking against Apple's iOS and iPadOS guidelines, or when the user says things like \"design multitasking for iPhone\", \"multitasking on iOS and iPadOS\", \"how should multitasking work on iPhone\"."
allowed-tools: Read Grep Glob
---

# Multitasking
Multitasking enables users to rapidly transition between applications and execute tasks within each

## When to use
- User asks about **multitasking** on iOS and iPadOS (e.g. `"how do I design multitasking for iPhone"`).
- User is building an iPhone UI that needs multitasking and wants to follow Apple's guidelines.
- User asks to audit or review multitasking in an iOS and iPadOS design.
- User mentions multitasking in the context of an iPhone app, game, or interface.

Users anticipate multitasking capabilities on their devices, and the absence of this feature may lead them to believe there is a defect in your application. Consequently, every app must function seamlessly within a multitasking environment, barring rare exceptions such as certain games or Apple Vision Pro apps operating in Full Space.

Beyond simple app switching, the multitasking experience varies depending on the device; consult [Platform considerations](#Platform-considerations) for details.

### Best practices
A seamless multitasking experience allows users to complete tasks across different applications by managing content within multiple simultaneous contexts. Since you cannot predict when users will initiate multitasking, your application or game must always be ready to save and restore their current context.

- **Pause activities that require users' attention or active involvement when they navigate away.** If your app is a game or media application, for instance, ensure that users do not miss anything when they switch away. When they return, they should be able to continue as if no interruption occurred.
- **Respond gracefully to audio interruptions.** Audio from another application or the system itself may occasionally interrupt your app's sound. For example, an incoming phone call or a music playlist started via Siri might interrupt your app's audio. When these situations arise, users expect your application to handle them as follows:
- Pause playback indefinitely for primary audio interruptions, such as those involving music, podcasts, or audiobooks.
- Temporarily decrease the volume or suspend playback for shorter interruptions, such as GPS navigation alerts, and then restore the original volume or playback upon the interruption's conclusion.

For further details, consult [Playing audio](playing-audio.md).

- **Allow users to finish tasks initiated in the background.** When a user starts a task—such as downloading assets or processing a video file—they expect it to complete even if they switch away from your app. If your application is performing a task that does not require further input, complete it in the background before suspending.
- **Use notifications judiciously.** Your app has the ability to send notifications while suspended or running in the background. If users start a critical or time-sensitive task within your app and then leave it, they may appreciate receiving a notification upon completion so they can return to the app for the next step. Conversely, users generally do not need immediate notification when a routine or secondary task finishes. In this case, avoid sending an unnecessary alert; instead, allow users to check on the task when they return to your app. For guidance, see [Managing notifications](managing-notifications.md).

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

To ensure your app functions correctly when opened in a windowed state, it must adapt smoothly to different screen dimensions. For guidance, consult [Layout](layout.md) and [Windows](windows.md); for developer instructions, see [Multitasking on iPad, Mac, and Apple Vision Pro](apple:UIKit/multitasking-on-ipad-mac-and-apple-vision-pro). To learn more about how users employ iPad multitasking features, visit [Use multitasking on your iPad](https://support.apple.com/en-us/HT207582).
