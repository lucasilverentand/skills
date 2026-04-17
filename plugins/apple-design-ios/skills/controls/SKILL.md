---
name: controls
description: "A control enables users quick access to an app feature through Control Center, the Lock Screen, or the Action button. Use when designing controls for iOS and iPadOS, auditing controls against Apple's iOS and iPadOS guidelines, or when the user says things like \"design controls for iPhone\", \"controls on iOS and iPadOS\", \"how should controls work on iPhone\"."
allowed-tools: Read Grep Glob
---

# Controls
A control enables users quick access to an app feature through Control Center, the Lock Screen, or the Action button

## When to use
- User asks about **controls** on iOS and iPadOS (e.g. `"how do I design controls for iPhone"`).
- User is building an iPhone UI that needs controls and wants to follow Apple's guidelines.
- User asks to audit or review controls in an iOS and iPadOS design.
- User mentions controls in the context of an iPhone app, game, or interface.

## Quick principles
- **Offer controls for actions that provide the most benefit without requiring users to launch your application** — For instance, launching a Live Activity from a control facilitates a smooth experience, keeping users informed about progress without needing to navigate…
- **Update controls when a user interacts with them, when an action finishes, or remotely via a push notification** — Ensure the control's contents accurately reflect its current state and indicate if an action is ongoing
- **Select a descriptive symbol that conveys the control's behavior** — Since controls may not display their title and value depending on where they are placed, the symbol must communicate sufficient information about…
- **Use symbol animations to emphasize state changes** — For control toggles, animate the transition between both on and off states
- **Select a tint color that aligns with your app’s branding** — The system applies this tint color to the symbol of a control toggle when it is in its on state
- **Help users provide any additional information the system requires to execute an action** — A user might need to configure a control before performing a desired action—for example, selecting a specific light in a house to…
- **Provide hint text for the Action button** — When a user presses the Action button, the system displays hint text to clarify what occurs when they press and hold
- **If your control title or value is variable, include a placeholder** — Placeholder information informs users about the function of your control when its title and value are context-dependent
- **Hide sensitive information when the device is locked** — When the device is secured, consider having the system redact the title and value to conceal personal or security-related data
- **Require authentication for actions that impact security** — For example, require users to unlock their device before they can access controls related to locking or unlocking a house door or…
- **Maintain consistency between your app's interface and the camera experience** — Utilizing a shared UI capitalizes on user familiarity with your application
- **Include instructions on how to add this control** — Ensure users understand the process for implementing the control that initiates this camera experience

## Full guidance
Read the referenced files for the complete Apple guidance on this topic:
- @references/guidelines.md
