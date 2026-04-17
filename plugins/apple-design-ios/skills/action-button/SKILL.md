---
name: action-button
description: "The Action button provides users with swift access to preferred features on compatible iPhone and Apple Watch models. Use when designing action button for iOS and iPadOS, auditing action button against Apple's iOS and iPadOS guidelines, or when the user says things like \"design action button for iPhone\", \"action button on iOS and iPadOS\", \"how should action button work on iPhone\"."
allowed-tools: Read Grep Glob
---

# Action button
The Action button provides users with swift access to preferred features on compatible iPhone and Apple Watch models

## When to use
- User asks about **action button** on iOS and iPadOS (e.g. `"how do I design action button for iPhone"`).
- User is building an iPhone UI that needs action button and wants to follow Apple's guidelines.
- User asks to audit or review action button in an iOS and iPadOS design.
- User mentions action button in the context of an iPhone app, game, or interface.

On a supported device, users can employ the Action button to run [App Shortcuts](app-shortcuts.md) or access system-level functionality, such as enabling or disabling the flashlight. For Apple Watch Ultra, the Action button supports activity-specific actions, including workouts and dives.

Users select the function for the Action button during device setup; this choice can subsequently be adjusted in Settings. When an App Shortcut is assigned to the Action button, pressing it executes that shortcut, much like using voice commands with Siri or selecting it in Spotlight.

When designing your application or game, view the Action button as an alternative method for users to quickly reach a function they utilize routinely.

### Best practices
- **Support the Action button by including a selection of your app’s most critical functions.** For instance, if your cooking application features an egg timer, selecting "Start Egg Timer" as an action allows users to initiate this function when they press the Action button. Since the system already provides a way for users to launch your app, you do not need to offer an App Shortcut that simply opens the application. Your app icon, widgets, and Apple Watch complications already offer users alternative quick ways to access your app. For further information, refer to [App Shortcuts](app-shortcuts.md).
- **For every action you enable, provide a brief label that clearly describes its function.** Users view these labels when they go into Settings to customize the Action button's behavior. When creating these labels, ensure they follow [title-style capitalization](https://support.apple.com/guide/applestyleguide/c-apsgb744e4a3/web#apdca93e113f1d64), begin with a verb, use the present tense, and omit articles and prepositions. Keep these labels as concise as possible, limited to a maximum of three words. For example, use “Start Race” rather than phrases like “Started Race” or “Start the Race.”
- **It is preferable to allow the system to guide users on how to utilize the Action button with your app.** When you support the Action button, the system automatically assists users in configuring it to execute one of your app’s functions. Avoid creating content that repeats the instructions found in Settings for the Action button, or any other usage advice provided by the system.

## Platform guidance — iOS & iPadOS
**Allow users to execute your actions without requiring them to exit their current workflow.** If feasible, leverage lightweight multitasking features such as [Live Activities](live-activities.md) and custom snippets to deliver functionality without launching your application. For instance, when a user initiates the “Set Timer” action, it should prompt them to define the duration and subsequently launch a Live Activity displaying the countdown, rather than launching the full Clock application.
