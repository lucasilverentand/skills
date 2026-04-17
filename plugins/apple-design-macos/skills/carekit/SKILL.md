---
name: carekit
description: "CareKit applications allow users to manage different care plans, including those for chronic conditions like diabetes, recovery from surgery or injury, or pursuing overall health and wellness objec…. Use when designing carekit for macOS, auditing carekit against Apple's macOS guidelines, or when the user says things like \"design carekit for Mac\", \"carekit on macOS\", \"how should carekit work on Mac\"."
allowed-tools: Read Grep Glob
---

# CareKit
CareKit applications allow users to manage different care plans, including those for chronic conditions like diabetes, recovery from surgery or injury, or pursuing overall health and wellness objectives

## When to use
- User asks about **carekit** on macOS (e.g. `"how do I design carekit for Mac"`).
- User is building a Mac UI that needs carekit and wants to follow Apple's guidelines.
- User asks to audit or review carekit in a macOS design.
- User mentions carekit in the context of a Mac app, game, or interface.

## Quick principles
- **Provide a comprehensive privacy policy** — When submitting the app, you are required to supply a URL leading to a clearly defined privacy policy
- **Request access to health data only when you need it** — It is logical to request weight information when a user logs their weight, for instance, rather than immediately upon app launch
- **Clarify your app’s intent by adding descriptive messages to the standard permission screen** — Users anticipate encountering the system-provided permission prompt when asked for health data approval
- **Manage health data sharing solely through the system’s privacy settings** — Users expect to globally control their health information access within Settings > Privacy
- **Use the simple style for a one-step task** — The default simple view includes a header area containing a title, subtitle, and button
- **Use the instructions style when you need to append informative text to a simple task** — For instance, if a single-step medication task requires supplementary details—such as "Take on an empty stomach" or "Take at bedtime"—the instructions style…
- **Use the log style to facilitate event logging** — For example, you might use this task style to provide a button allowing users to record symptoms like nausea
- **Use the checklist style to display a sequence of actions or steps in a multi-step task** — For example, if a patient must take medication three times daily, you could list these three scheduled instances in a checklist
- **Use the grid style to present a multi-step task using a compact arrangement of buttons** — Similar to the checklist style, the grid supports multi-step tasks but displays steps more compactly
- **Consider using color to reinforce the meaning of task items** — Color is an effective method for allowing users to grasp information quickly
- **Combine accuracy with simplicity when describing a task and its steps** — For example, use the medication's marketing name rather than its chemical description
- **Consider supplementing multi-step or complex tasks with videos or images** — Visually demonstrating a task can help users prevent errors

## Full guidance
Read the referenced files for the complete Apple guidance on this topic:
- @references/overview.md
- @references/data-and-privacy.md
- @references/carekit-views-overview.md
- @references/carekit-views-tasks.md
- @references/carekit-views-charts.md
- @references/carekit-views-contact-views.md
- @references/notifications.md
- @references/symbols-and-branding.md
