---
name: managing-notifications
description: "Notifications serve to provide users with important, timely information, regardless of whether the device is currently in use or locked. Use when designing managing notifications for watchOS, auditing managing notifications against Apple's watchOS guidelines, or when the user says things like \"design managing notifications for Apple Watch\", \"managing notifications on watchOS\", \"how should managing notifications work on Apple Watch\"."
allowed-tools: Read Grep Glob
---

# Managing notifications
Notifications serve to provide users with important, timely information, regardless of whether the device is currently in use or locked

## When to use
- User asks about **managing notifications** on watchOS (e.g. `"how do I design managing notifications for Apple Watch"`).
- User is building an Apple Watch UI that needs managing notifications and wants to follow Apple's guidelines.
- User asks to audit or review managing notifications in a watchOS design.
- User mentions managing notifications in the context of an Apple Watch app, game, or interface.

## Quick principles
- **Build trust by accurately representing the urgency of each notification** — Since users have different ways to adjust their notification settings—including turning them off completely—it is crucial that you assign an interruption level…
- **Use the Time Sensitive interruption level only for notifications that are relevant in the moment** — To help users understand the advantages of allowing Time Sensitive alerts to override Focus or scheduled delivery, ensure the notification pertains to…
- **Never use the Time Sensitive interruption level for marketing notifications** — Even if users have agreed to receive promotional alerts from your application, these messages must never bypass a Focus mode or scheduled…
- **Obtain users' permission if you intend to send promotional or marketing notifications** — Before dispatching these alerts, you must secure explicit consent from the users
- **Ensure users can manage their notification preferences within your app** — Beyond requesting permission to send informational or marketing alerts, you are required to provide an in-app settings screen enabling users to modify…

## Full guidance
Read the referenced files for the complete Apple guidance on this topic:
- @references/guidelines.md
