---
name: feedback
description: "Feedback informs users about the current state, guides them on subsequent actions, clarifies outcomes from their inputs, and helps prevent errors. Use when designing feedback for watchOS, auditing feedback against Apple's watchOS guidelines, or when the user says things like \"design feedback for Apple Watch\", \"feedback on watchOS\", \"how should feedback work on Apple Watch\"."
allowed-tools: Read Grep Glob
---

# Feedback
Feedback informs users about the current state, guides them on subsequent actions, clarifies outcomes from their inputs, and helps prevent errors

## When to use
- User asks about **feedback** on watchOS (e.g. `"how do I design feedback for Apple Watch"`).
- User is building an Apple Watch UI that needs feedback and wants to follow Apple's guidelines.
- User asks to audit or review feedback in a watchOS design.
- User mentions feedback in the context of an Apple Watch app, game, or interface.

Offering clear and consistent feedback during interaction within your application or game enhances the feeling of intuitiveness and promotes deeper engagement. Feedback serves different purposes, including:

- Indicating the present status of an element or process.
- Communicating whether a critical task or action succeeded or failed.
- Alerting users to an action that carries potential negative outcomes.
- Providing a chance to rectify an error or difficult situation.

The most impactful feedback delivery scales appropriately with the importance of the information being conveyed. For instance, status updates are often best presented passively, allowing users to review them when necessary. Conversely, a warning regarding potential data loss requires an interruption to give the user a chance to avert the issue.

### Best practices
- **Ensure all feedback is accessible.** When you employ multiple methods to provide feedback, you increase the likelihood that more users receive it and allow them to consume the information in a way that suits their needs. For instance, if you use color, text, sound, and haptics, users can receive the feedback regardless of whether they have silenced their device, are looking away from the screen, or utilizing VoiceOver. (Refer to [Playing haptics](playing-haptics.md) for guidance on implementing haptic feedback.)
- **Consider integrating status feedback into your interface.** When status information is displayed close to the elements it pertains to, users receive crucial details without needing to perform an action or break their current workflow. For example, in iOS and iPadOS Mail, the toolbar of the mailbox screen displays the count of unread messages and the most recent update status, making the information readily available yet unobtrusive.
- **Use alerts to deliver critical — and ideally actionable — information.** Since alerts inherently interrupt the user's current context, you must match the interruption level to the information's importance. Alerts lose their effectiveness if they are used too frequently or for non-essential matters. For guidance, see [Alerts](alerts.md).
- **Warn users when they initiate a task that could cause unexpected and irreversible data loss.** Conversely, do not issue warnings when data loss is the anticipated outcome of their action. For example, the Finder does not warn users every time they discard a file because deleting it is the expected result.
- **When appropriate, confirm that a significant action or task has been completed.** For example, users appreciate confirmation when an Apple Pay transaction successfully completes. Generally, this type of confirmation should be reserved for activities that are sufficiently important—because users typically assume their action will succeed, they only need notification when it fails.
- **Show users when a command cannot be executed and assist them in understanding why.** For example, if a user requests directions without specifying a destination, Maps informs them that it cannot provide routes to and from the same location.

## Platform guidance — watchOS
**Do not display an indeterminate progress indicator, such as a loading spinner, within a watchOS application.** Such animated indicators imply sustained user attention is required, degrading the experience. Instead, ensure users are notified once the process has successfully finished.
