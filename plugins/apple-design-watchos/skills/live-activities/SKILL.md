---
name: live-activities
description: "Live Activities allow users to monitor the status of an activity, event, or task at a glance. Use when designing live activities for watchOS, auditing live activities against Apple's watchOS guidelines, or when the user says things like \"design live activities for Apple Watch\", \"live activities on watchOS\", \"how should live activities work on Apple Watch\"."
allowed-tools: Read Grep Glob
---

# Live Activities
Live Activities allow users to monitor the status of an activity, event, or task at a glance

## When to use
- User asks about **live activities** on watchOS (e.g. `"how do I design live activities for Apple Watch"`).
- User is building an Apple Watch UI that needs live activities and wants to follow Apple's guidelines.
- User asks to audit or review live activities in a watchOS design.
- User mentions live activities in the context of an Apple Watch app, game, or interface.

## Quick principles
- **Offer Live Activities for tasks and events that have a defined beginning and end** — These activities are most effective when tracking short-to-medium duration events that do not exceed eight hours
- **Focus on important information that people need to see at a glance** — Your Live Activity does not need to present all details
- **Avoid displaying sensitive information** — Given that Live Activities are highly visible and may be viewed by casual observers (such as on the Lock Screen or in…
- **Create a Live Activity that matches your app’s visual aesthetic and personality in both dark and light appearances** — This consistency helps users quickly identify your Live Activity and maintains a visual connection to your application
- **If you include a logo mark, display it without a container** — This allows the logo to integrate seamlessly into your Live Activity layout
- **Don’t add elements to your app that draw attention to the Dynamic Island** — Your Live Activity appears in the Dynamic Island when your app is backgrounded, while other content may appear there when your app…
- **Ensure text is easy to read** — Utilize large, bolded typography—a medium weight or heavier is recommended
- **Accommodate different screen sizes and display modes** — Live Activities must scale to fit diverse device screens
- **Optimize element dimensions and positioning for efficient spatial utilization** — Design a layout that occupies only the necessary space required to clearly present its content
- **Employ established layouts for custom views and designs** — Templates, including default system margins and recommended text sizes, are available in [Apple Design Resources](https://developer.apple.com/design/resources/)
- **Maintain uniform margins and concentric placement** — Ensure that even, matching margins exist between rounded shapes and the Live Activity edges, including corners, to guarantee a harmonious fit
- **When segmenting a body of content, enclose it within an inset container shape or utilize a defined dividing line** — Do not allow content to extend fully to the edge of the Dynamic Island

## Full guidance
Read the referenced files for the complete Apple guidance on this topic:
- @references/overview.md
- @references/anatomy.md
- @references/best-practices-overview.md
- @references/best-practices-creating-live-activity-layouts.md
- @references/best-practices-choosing-colors.md
- @references/best-practices-adding-transitions-and-animating-content-updates.md
- @references/best-practices-offering-interactivity.md
- @references/best-practices-starting-updating-and-ending-a-live-activity.md
- @references/presentation.md
- @references/carplay.md
- @references/platform-guidance-watchos.md
- @references/specifications.md
