---
name: modality
description: "Modality is a design method where content appears in a standalone, dedicated mode. This prevents interaction with the underlying view and requires an explicit action to dismiss it. Use when designing modality for iOS and iPadOS, auditing modality against Apple's iOS and iPadOS guidelines, or when the user says things like \"design modality for iPhone\", \"modality on iOS and iPadOS\", \"how should modality work on iPhone\"."
allowed-tools: Read Grep Glob
---

# Modality
Modality is a design method where content appears in a standalone, dedicated mode. This prevents interaction with the underlying view and requires an explicit action to dismiss it

## When to use
- User asks about **modality** on iOS and iPadOS (e.g. `"how do I design modality for iPhone"`).
- User is building an iPhone UI that needs modality and wants to follow Apple's guidelines.
- User asks to audit or review modality in an iOS and iPadOS design.
- User mentions modality in the context of an iPhone app, game, or interface.

Presenting content modally allows you to:

- Guarantee users receive critical information and take necessary action.
- Offer choices allowing users to confirm or adjust their most recent operation.
- Enable users to complete a specific, focused task without losing context of what they were doing previously.
- Deliver an immersive experience or aid concentration on a complex task.

Depending on the platform, you may employ different components to achieve these modal experiences. For instance, all platforms can use an *alert*, which is a modal view used to deliver important information regarding your application or game. Furthermore, each platform defines different types of modal views for presenting context-specific options, such as *activity views*, *sheets*, *confirmation dialogs*, or *action sheets*. To assist users in completing a distinct task, iOS, iPadOS, and macOS applications typically utilize sheets or popovers, though iPadOS, macOS, and visionOS apps might also employ a separate window.

To offer a temporary experience, such as viewing media, or to assist users in completing a distinct, multi-step task like content editing, applications can provide a full-screen modal experience. Conversely, apps may also offer nonmodal types of full-screen experiences; refer to [Going full screen](going-full-screen.md) for guidance. visionOS applications can offer a variety of immersive experiences; consult [Immersive experiences](immersive-experiences.md) for guidance.

### Best practices
- **Present content modally only when there’s a clear benefit.** Since a modal experience interrupts the user's current workflow and requires an action to close, use modality exclusively when it aids focus or facilitates critical choices regarding the content or device.
- **Aim to keep modal tasks simple, short, and streamlined.** If a task presented modally is overly complex, users may lose track of the activity they suspended upon entering the view, particularly if the modal obscures their previous context.
- **Take care to avoid creating a modal experience that feels like an app within your app.** Specifically, presenting a hierarchy of views inside a modal task can confuse users about how to navigate back. If subviews are necessary for the task, ensure there is a single path through the hierarchy and avoid including buttons that might be mistaken for the dismissal control.
- **Consider using a full-screen modal style for in-depth content or a complex task.** A modal presentation that occupies the entire window or device display minimizes distractions, making it ideal for tasks like viewing media (videos, photos, camera feeds) or completing a multi-step process such as document markup or photo editing. When a visionOS application runs alongside others in Shared Space, the full-screen modal fills a window; transitioning to Full Space allows this presentation to become more immersive.
- **Always give people an obvious way to dismiss a modal view.** Generally, it is best practice to adhere to established platform conventions. For instance, iOS, iPadOS, and watchOS apps typically expect a top toolbar button or a swipe gesture to dismiss; conversely, macOS and tvOS apps usually require a button within the main content area.
- **When necessary, help people avoid data loss by getting confirmation before closing a modal view.** Regardless of whether the user dismisses the view via gesture or button, if exiting the view risks losing content they generated, you must explain this situation and provide a resolution path. For example, in iOS, presenting an action sheet that includes a save option may be appropriate.
- **Make it easy to identify a modal view’s task.** Because entering a modal shifts the user away from their previous context, they may not return immediately. By providing a title that names the modal task—or supplementary text describing or guiding the task—you help users maintain their place within the application.
- **Let people dismiss a modal view before presenting another one.** Allowing multiple modal views to be simultaneously visible tends to introduce visual clutter and can make the app feel disorganized. Since users must recall their context before a modal appears, presenting multiple views increases cognitive load, especially if one modal obscures another. Although an alert can appear over all other content, including modals, never display more than one alert at a time.
