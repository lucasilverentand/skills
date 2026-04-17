---
name: gestures
description: "A gesture is a physical motion that a user employs to directly influence an object within an application or game on their device. Use when designing gestures for watchOS, auditing gestures against Apple's watchOS guidelines, or when the user says things like \"design gestures for Apple Watch\", \"gestures on watchOS\", \"how should gestures work on Apple Watch\"."
allowed-tools: Read Grep Glob
---

# Gestures
A gesture is a physical motion that a user employs to directly influence an object within an application or game on their device

## When to use
- User asks about **gestures** on watchOS (e.g. `"how do I design gestures for Apple Watch"`).
- User is building an Apple Watch UI that needs gestures and wants to follow Apple's guidelines.
- User asks to audit or review gestures in a watchOS design.
- User mentions gestures in the context of an Apple Watch app, game, or interface.

## Quick principles
- **Provide multiple methods for users to interact with your application** — Users often rely on alternative inputs—such as voice, keyboard, or Switch Control—to interact with their devices
- **Ensure gestures respond in a manner consistent with user expectations** — Users anticipate that most gestures will function similarly regardless of the current context
- **Ensure gestures are handled with maximum responsiveness** — Effective gestures improve the direct manipulation experience and offer immediate feedback
- **Clearly communicate when a gesture is unavailable** — If you fail to clearly explain why a gesture fails, users may mistakenly believe the app has frozen or that they are…
- **Implement custom gestures only when they are essential** — Custom gestures function optimally when they are designed for specialized, frequently performed tasks that existing interactions do not cover, such as in…
- **Ensure custom gestures are intuitive to learn** — Provide opportunities within the app for users to quickly grasp and perform custom gestures, and rigorously test your interactions in realistic usage…
- **Employ shortcut gestures to enhance standard gestures, not supersede them** — Although a custom gesture can provide quick access to parts of your application, users still require simple, familiar methods for navigation and…
- **Prevent conflicts with gestures that invoke system UI** — different platforms include established gestures for accessing system behaviors, such as edge swiping in watchOS or rolling the hand to access overlays…
- **Avoid setting a primary action in views that contain lists, scroll views, or vertical tabs** — This setup contradicts the standard navigation patterns users anticipate when performing a double-tap
- **Select the button that users most frequently utilize as the primary action in a view** — Double-tapping is beneficial in a static (non-scrolling) view if it executes the action that users perform most often

## Full guidance
Read the referenced files for the complete Apple guidance on this topic:
- @references/guidelines.md
