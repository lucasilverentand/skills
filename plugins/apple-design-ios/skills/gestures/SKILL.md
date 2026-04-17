---
name: gestures
description: "A gesture is a physical motion that a user employs to directly influence an object within an application or game on their device. Use when designing gestures for iOS and iPadOS, auditing gestures against Apple's iOS and iPadOS guidelines, or when the user says things like \"design gestures for iPhone\", \"gestures on iOS and iPadOS\", \"how should gestures work on iPhone\"."
allowed-tools: Read Grep Glob
---

# Gestures
A gesture is a physical motion that a user employs to directly influence an object within an application or game on their device

## When to use
- User asks about **gestures** on iOS and iPadOS (e.g. `"how do I design gestures for iPhone"`).
- User is building an iPhone UI that needs gestures and wants to follow Apple's guidelines.
- User asks to audit or review gestures in an iOS and iPadOS design.
- User mentions gestures in the context of an iPhone app, game, or interface.

## Quick principles
- **Provide multiple methods for users to interact with your application** — Users often rely on alternative inputs—such as voice, keyboard, or Switch Control—to interact with their devices
- **Ensure gestures respond in a manner consistent with user expectations** — Users anticipate that most gestures will function similarly regardless of the current context
- **Ensure gestures are handled with maximum responsiveness** — Effective gestures improve the direct manipulation experience and offer immediate feedback
- **Clearly communicate when a gesture is unavailable** — If you fail to clearly explain why a gesture fails, users may mistakenly believe the app has frozen or that they are…
- **Implement custom gestures only when they are essential** — Custom gestures function optimally when they are designed for specialized, frequently performed tasks that existing interactions do not cover, such as in…
- **Ensure custom gestures are intuitive to learn** — Provide opportunities within the app for users to quickly grasp and perform custom gestures, and rigorously test your interactions in realistic usage…
- **Employ shortcut gestures to enhance standard gestures, not supersede them** — Although a custom gesture can provide quick access to parts of your application, users still require simple, familiar methods for navigation and…
- **Prevent conflicts with gestures that invoke system UI** — different platforms include established gestures for accessing system behaviors, such as edge swiping in watchOS or rolling the hand to access overlays…
- **Consider enabling the simultaneous recognition of multiple gestures if it improves the user experience** — While concurrent gestures are unlikely to be beneficial in non-game applications, a game may feature multiple on-screen controls—such as firing buttons and…

## Full guidance
Read the referenced files for the complete Apple guidance on this topic:
- @references/guidelines.md
