---
name: multitasking
description: "Multitasking enables users to rapidly transition between applications and execute tasks within each. Use when designing multitasking for visionOS, auditing multitasking against Apple's visionOS guidelines, or when the user says things like \"design multitasking for Apple Vision Pro\", \"multitasking on visionOS\", \"how should multitasking work on Apple Vision Pro\"."
allowed-tools: Read Grep Glob
---

# Multitasking
Multitasking enables users to rapidly transition between applications and execute tasks within each

## When to use
- User asks about **multitasking** on visionOS (e.g. `"how do I design multitasking for Apple Vision Pro"`).
- User is building an Apple Vision Pro UI that needs multitasking and wants to follow Apple's guidelines.
- User asks to audit or review multitasking in a visionOS design.
- User mentions multitasking in the context of an Apple Vision Pro app, game, or interface.

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

## Platform guidance — visionOS
On Apple Vision Pro, users can run multiple applications concurrently within Shared Space, allowing them to view and switch between windows and volumes across the entire environment.

Only one window is active at any given time in Shared Space. When users shift focus from one window to another, the currently viewed window becomes active, while the previous window transitions into a more translucent state and appears to recede along the z-axis. Closing an application window in Shared Space moves the app into the background without terminating it.

> **Note**
> If an application is designated as the Now Playing app, closing its window automatically pauses audio playback; users can resume playback via Control Center without needing to reopen the window.

- **Do not disrupt the system's multitasking behavior.** When users move their gaze from one window to another, visionOS applies a feathered mask to the window they are looking away from to clearly indicate its changed state. To prevent interference with this visual feedback mechanism, refrain from altering the appearance of a window’s edges.
- **Do not halt video playback in a window when users look elsewhere.** In visionOS, consistent with macOS behavior, users expect that playback initiated in one window will continue while they are viewing or operating within a different window.
- **Be prepared for scenarios where your audio may duck.** Unless the app is currently functioning as the Now Playing app, its audio volume can decrease when users shift focus away from it to another application.
