---
name: alerts
description: "An alert provides users with critical, immediate information. Use when designing alerts for macOS, auditing alerts against Apple's macOS guidelines, or when the user says things like \"design alerts for Mac\", \"alerts on macOS\", \"how should alerts work on Mac\"."
allowed-tools: Read Grep Glob
---

# Alerts
An alert provides users with critical, immediate information

## When to use
- User asks about **alerts** on macOS (e.g. `"how do I design alerts for Mac"`).
- User is building a Mac UI that needs alerts and wants to follow Apple's guidelines.
- User asks to audit or review alerts in a macOS design.
- User mentions alerts in the context of a Mac app, game, or interface.

## Quick principles
- **Use alerts sparingly** — Alerts convey critical information but cause interruptions to the user's current task
- **Avoid using an alert merely to provide information** — Users dislike interruptions caused by alerts that are informative but not actionable
- **Avoid displaying alerts for common, undoable actions, even if they are destructive** — For example, you do not need to alert users about data loss every time they delete an email or file because the…
- **Avoid showing an alert when your app starts** — If important or new information must be conveyed upon opening the application, design a method that makes this information easily discoverable
- **Maintain a direct and neutral, yet approachable tone in all alert copy** — Since alerts frequently communicate serious issues or problems, avoid language that is vague, accusatory, or minimizes the severity of the situation
- **Craft a title that precisely and succinctly conveys the situation** — You must enable users to quickly grasp the context, so be thorough and specific without being overly wordy
- **Include informative text only if it adds value** — If supplementary information is necessary, keep it as brief as possible
- **Do not explain the alert buttons** — If your alert text and button labels are clear, there is no need to describe the function of the buttons
- **If supported, include a text field only when user input is required to resolve the issue** — For instance, you might need to present a secure text field for receiving a password
- **Titles must be brief and logical** — Aim for a one- or two-word title that communicates the outcome of selecting the button
- **Avoid using OK as the default button title unless the alert is purely informational** — The term "OK" can be ambiguous, even when used in alerts requiring confirmation
- **Placement must be intuitive** — Generally, position the button that users are most likely to select on the trailing side in a horizontal arrangement or at the…

## Full guidance
Read the referenced files for the complete Apple guidance on this topic:
- @references/guidelines.md
