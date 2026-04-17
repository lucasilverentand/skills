---
name: action-button
description: "The Action button provides users with swift access to preferred features on compatible iPhone and Apple Watch models. Use when designing action button for watchOS, auditing action button against Apple's watchOS guidelines, or when the user says things like \"design action button for Apple Watch\", \"action button on watchOS\", \"how should action button work on Apple Watch\"."
allowed-tools: Read Grep Glob
---

# Action button
The Action button provides users with swift access to preferred features on compatible iPhone and Apple Watch models

## When to use
- User asks about **action button** on watchOS (e.g. `"how do I design action button for Apple Watch"`).
- User is building an Apple Watch UI that needs action button and wants to follow Apple's guidelines.
- User asks to audit or review action button in a watchOS design.
- User mentions action button in the context of an Apple Watch app, game, or interface.

On a supported device, users can employ the Action button to run [App Shortcuts](app-shortcuts.md) or access system-level functionality, such as enabling or disabling the flashlight. For Apple Watch Ultra, the Action button supports activity-specific actions, including workouts and dives.

Users select the function for the Action button during device setup; this choice can subsequently be adjusted in Settings. When an App Shortcut is assigned to the Action button, pressing it executes that shortcut, much like using voice commands with Siri or selecting it in Spotlight.

When designing your application or game, view the Action button as an alternative method for users to quickly reach a function they utilize routinely.

### Best practices
- **Support the Action button by including a selection of your app’s most critical functions.** For instance, if your cooking application features an egg timer, selecting "Start Egg Timer" as an action allows users to initiate this function when they press the Action button. Since the system already provides a way for users to launch your app, you do not need to offer an App Shortcut that simply opens the application. Your app icon, widgets, and Apple Watch complications already offer users alternative quick ways to access your app. For further information, refer to [App Shortcuts](app-shortcuts.md).
- **For every action you enable, provide a brief label that clearly describes its function.** Users view these labels when they go into Settings to customize the Action button's behavior. When creating these labels, ensure they follow [title-style capitalization](https://support.apple.com/guide/applestyleguide/c-apsgb744e4a3/web#apdca93e113f1d64), begin with a verb, use the present tense, and omit articles and prepositions. Keep these labels as concise as possible, limited to a maximum of three words. For example, use “Start Race” rather than phrases like “Started Race” or “Start the Race.”
- **It is preferable to allow the system to guide users on how to utilize the Action button with your app.** When you support the Action button, the system automatically assists users in configuring it to execute one of your app’s functions. Avoid creating content that repeats the instructions found in Settings for the Action button, or any other usage advice provided by the system.

## Platform guidance — watchOS
In watchOS, the initial press of the Action button can initiate actions such as dropping a waypoint, starting a dive, or beginning a specific workout. Furthermore, the Action button supports secondary functions beyond a single press, such as marking a segment or moving to the next phase during a multi-part workout.

- **Propose a secondary function that logically supports or progresses the primary action selected by the user.** Since users frequently operate the Action button without visual confirmation, any subsequent press must follow logically from the initial action and remain relevant to the current context. If your application supports workout or dive activities, design a simple, intuitive secondary function that is easily learned and recalled. Exercise caution before implementing more than one secondary function, as this can increase cognitive load and negatively impact perceived usability.
- **Utilize subsequent button presses to enable additional features rather than to halt or conclude a function.** If the user needs to terminate their primary task (as opposed to merely pausing the current operation), provide this option within the application's interface.
- **Pause the active function when users simultaneously press the Action button and side button.** An exception exists for diving applications where pausing a dive might be hazardous to the diver, potentially causing them to lose track of their depth or misunderstanding the duration underwater. Unless pausing the current activity creates a negative user experience, ensure you meet user expectations by allowing them to pause their activity when both buttons are pressed concurrently.
