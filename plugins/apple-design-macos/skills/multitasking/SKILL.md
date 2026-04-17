---
name: multitasking
description: "Multitasking enables users to rapidly transition between applications and execute tasks within each. Use when designing multitasking for macOS, auditing multitasking against Apple's macOS guidelines, or when the user says things like \"design multitasking for Mac\", \"multitasking on macOS\", \"how should multitasking work on Mac\"."
allowed-tools: Read Grep Glob
---

# Multitasking
Multitasking enables users to rapidly transition between applications and execute tasks within each

## When to use
- User asks about **multitasking** on macOS (e.g. `"how do I design multitasking for Mac"`).
- User is building a Mac UI that needs multitasking and wants to follow Apple's guidelines.
- User asks to audit or review multitasking in a macOS design.
- User mentions multitasking in the context of a Mac app, game, or interface.

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

## Platform guidance — macOS
Multitasking is the default experience on Mac, as users typically run and switch between multiple applications. When several app windows are open, macOS applies drop shadows to simulate a layered appearance on the desktop and uses other visual effects to help users distinguish between different window states; refer to [macOS window states](windows.md#macOS-window-states) for guidance.
