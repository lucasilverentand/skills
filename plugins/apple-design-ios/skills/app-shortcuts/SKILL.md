---
name: app-shortcuts
description: "An App Shortcut provides users with access to your application's primary functions or content across the entire operating system. Use when designing app shortcuts for iOS and iPadOS, auditing app shortcuts against Apple's iOS and iPadOS guidelines, or when the user says things like \"design app shortcuts for iPhone\", \"app shortcuts on iOS and iPadOS\", \"how should app shortcuts work on iPhone\"."
allowed-tools: Read Grep Glob
---

# App Shortcuts
An App Shortcut provides users with access to your application's primary functions or content across the entire operating system

## When to use
- User asks about **app shortcuts** on iOS and iPadOS (e.g. `"how do I design app shortcuts for iPhone"`).
- User is building an iPhone UI that needs app shortcuts and wants to follow Apple's guidelines.
- User asks to audit or review app shortcuts in an iOS and iPadOS design.
- User mentions app shortcuts in the context of an iPhone app, game, or interface.

## Quick principles
- **Offer App Shortcuts for your app’s most common and important tasks** — The most effective shortcuts are those that allow users to complete straightforward actions without leaving their current context
- **Add flexibility by letting people choose from a set of options** — If appropriate, an App Shortcut may include a single optional parameter
- **Ask for clarification in response to a request that’s missing optional information** — If a user says, "Start meditation" without specifying the type (morning, daily, or sleep), you can follow up by suggesting a recently…
- **Keep voice interactions simple** — If your phrase sounds overly complex when spoken aloud, it is likely difficult for users to remember or articulate correctly
- **Make App Shortcuts discoverable in your app** — Users are most likely to remember and utilize App Shortcuts for tasks they perform frequently, provided they know the shortcut exists
- **Ensure sufficient detail is provided for interaction on audio-only devices** — Users may receive responses on audio-only hardware, like AirPods and HomePod, where visual content might not always be available
- **Provide brief, memorable activation phrases and natural variants** — Since an App Shortcut phrase (or a defined variant) is how users invoke an App Shortcut via Siri, brevity is crucial for…
- **When referring to individual shortcuts (not App Shortcuts or the Shortcuts app), use lowercase** — For example, *Run a shortcut by asking Siri or tapping a suggestion on the Lock Screen.*
- **Order shortcuts based on importance** — The sequence you select determines how App Shortcuts initially appear in both Spotlight and the Shortcuts app, so it is beneficial to…
- **Offer an App Shortcut that starts a Live Activity** — Live Activities allow users to monitor an event or track the progress of a task in glanceable locations across their devices

## Full guidance
Read the referenced files for the complete Apple guidance on this topic:
- @references/guidelines.md
