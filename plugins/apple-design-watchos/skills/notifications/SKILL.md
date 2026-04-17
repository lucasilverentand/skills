---
name: notifications
description: "A notification delivers valuable, time-sensitive information that users can comprehend instantly. Use when designing notifications for watchOS, auditing notifications against Apple's watchOS guidelines, or when the user says things like \"design notifications for Apple Watch\", \"notifications on watchOS\", \"how should notifications work on Apple Watch\"."
allowed-tools: Read Grep Glob
---

# Notifications
A notification delivers valuable, time-sensitive information that users can comprehend instantly

## When to use
- User asks about **notifications** on watchOS (e.g. `"how do I design notifications for Apple Watch"`).
- User is building an Apple Watch UI that needs notifications and wants to follow Apple's guidelines.
- User asks to audit or review notifications in a watchOS design.
- User mentions notifications in the context of an Apple Watch app, game, or interface.

## Quick principles
- **Provide notifications that are both concise and informative** — Since users enable notifications to receive rapid updates, the content must be valuable and delivered succinctly
- **Do not send redundant notifications regarding the same event, even if a user has not responded** — Users check notifications when they are ready
- **Refrain from including instructions that require specific in-app actions** — If the task is simple enough to be completed without opening your app, consider using [Notification actions](#Notification-actions)
- **Use an alert component rather than a notification when displaying error messages** — To prevent user confusion, it is important to use the correct component type, as users are familiar with both alerts and notifications
- **Manage foreground notification delivery gracefully** — Although your app's notifications are suppressed while the app is active, it still receives the information
- **Do not include sensitive, private, or confidential data within a notification** — Because you cannot predict the user's context upon receiving an alert, it is crucial to omit private information that could be visible…
- **Create a short title if it provides context for the notification content** — Keep titles brief so users can quickly grasp the message, especially on Apple Watch where screen real estate is limited
- **Write succinct, easy-to-read notification content** — Use complete sentences, sentence case, and appropriate punctuation
- **Provide generically descriptive text to display when notification previews aren’t available** — If users hide notification previews in Settings, the system displays only your app icon and the default title *Notification*
- **Avoid including your app name or icon** — The system automatically displays a large version of your app icon at the beginning of every notification
- **Consider providing a sound to supplement your notifications** — Sound can effectively differentiate your app's alerts and capture attention when users are not actively viewing the device
- **Ensure the actions offered are valuable and relevant to the notification's context** — Prioritize actions that enable users to complete common, time-saving tasks without needing to enter your app

## Full guidance
Read the referenced files for the complete Apple guidance on this topic:
- @references/anatomy.md
- @references/best-practices.md
- @references/content.md
- @references/notification-actions.md
- @references/badging.md
- @references/platform-guidance-watchos.md
