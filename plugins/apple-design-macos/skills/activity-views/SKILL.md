---
name: activity-views
description: "An activity view, often referred to as a *share sheet*, presents different tasks users can perform within the current context. Use when designing activity views for macOS, auditing activity views against Apple's macOS guidelines, or when the user says things like \"design activity views for Mac\", \"activity views on macOS\", \"how should activity views work on Mac\"."
allowed-tools: Read Grep Glob
---

# Activity views
An activity view, often referred to as a *share sheet*, presents different tasks users can perform within the current context

## When to use
- User asks about **activity views** on macOS (e.g. `"how do I design activity views for Mac"`).
- User is building a Mac UI that needs activity views and wants to follow Apple's guidelines.
- User asks to audit or review activity views in a macOS design.
- User mentions activity views in the context of a Mac app, game, or interface.

## Quick principles
- **Avoid creating duplicate versions of common actions already available in the activity view** — Supplying a redundant action, such as another Print option, is confusing and unnecessary since users won't know how to differentiate it from…
- **Consider using a symbol to represent your custom activity** — [SF Symbols](sf-symbols.md) offers a wide range of configurable symbols that can be used to convey concepts and items within an activity view
- **Write a succinct, descriptive title for each custom action you provide** — If a title exceeds the available space, the system may truncate or wrap it
- **Make sure activities are appropriate for the current context** — While you cannot change the order of system-provided tasks in an activity view, you retain the ability to exclude tasks irrelevant to…
- **Use the Share button to display an activity view** — Users expect that system-provided activities are accessed via the Share button
- **If necessary, create a custom interface that feels familiar to users** — For a share extension, prioritize the system-provided composition view because it offers a consistent sharing experience that users are already accustomed to
- **Streamline and limit interaction** — Users appreciate extensions that allow them to complete a task in minimal steps
- **Avoid placing a modal view above your extension** — By default, the system displays an extension within a modal view
- **If necessary, provide an image that communicates the purpose of your extension** — A share extension automatically utilizes your app icon, which helps assure users that your application provided the extension
- **Use your main app to denote the progress of a lengthy operation** — An activity view is dismissed immediately once users finish the task within your share or action extension

## Full guidance
Read the referenced files for the complete Apple guidance on this topic:
- @references/guidelines.md
