---
name: healthkit
description: "HealthKit functions as the primary repository for health and fitness data across iOS, iPadOS, and watchOS. Use when designing healthkit for tvOS, auditing healthkit against Apple's tvOS guidelines, or when the user says things like \"design healthkit for Apple TV\", \"healthkit on tvOS\", \"how should healthkit work on Apple TV\"."
allowed-tools: Read Grep Glob
---

# HealthKit
HealthKit functions as the primary repository for health and fitness data across iOS, iPadOS, and watchOS

## When to use
- User asks about **healthkit** on tvOS (e.g. `"how do I design healthkit for Apple TV"`).
- User is building an Apple TV UI that needs healthkit and wants to follow Apple's guidelines.
- User asks to audit or review healthkit in a tvOS design.
- User mentions healthkit in the context of an Apple TV app, game, or interface.

## Quick principles
- **Provide a coherent privacy policy** — During the app submission phase, you must supply a URL pointing to a clearly defined privacy policy that users can view when…
- **Request access to health data only when you need it** — It is logical to ask for weight information, for instance, when users are logging their weights, but not immediately upon app launch
- **Clarify your app’s intent by adding descriptive messages to the standard permission screen** — Users expect to encounter the system-provided permission prompt when health data access is requested
- **Manage health data sharing solely through the system’s privacy settings** — Users expect to manage access to their health information globally within Settings > Privacy
- **Use Activity rings exclusively for Move, Exercise, and Stand data** — Activity rings consistently represent progress in these specific areas
- **Use Activity rings to display the progress of a single individual** — Never use Activity rings to represent data for more than one person; ensure clarity regarding whose progress is being shown by including…
- **Do not use Activity rings as ornamentation** — Activity rings serve to convey information; they are not merely decorative elements
- **Do not use Activity rings for branding** — Use Activity rings strictly to display Activity progress within your application
- **Maintain Activity ring and background colors** — For a consistent user experience, the visual appearance of Activity rings must remain constant regardless of where they appear
- **Maintain Activity ring margins** — An Activity ring element requires a minimum outer margin equal to the distance between rings
- **Differentiate other ring-like elements from Activity rings** — Mixing different ring styles can result in a visually confusing interface
- **Provide app-specific information only within Activity notifications** — The system already delivers updates regarding Move, Exercise, and Stand progress

## Full guidance
Read the referenced files for the complete Apple guidance on this topic:
- @references/guidelines-overview.md
- @references/guidelines-privacy-protection.md
- @references/guidelines-activity-rings.md
- @references/guidelines-apple-health-icon.md
- @references/guidelines-editorial-guidelines.md
