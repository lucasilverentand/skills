---
name: gestures
description: "A gesture is a physical motion that a user employs to directly influence an object within an application or game on their device. Use when designing gestures for visionOS, auditing gestures against Apple's visionOS guidelines, or when the user says things like \"design gestures for Apple Vision Pro\", \"gestures on visionOS\", \"how should gestures work on Apple Vision Pro\"."
allowed-tools: Read Grep Glob
---

# Gestures
A gesture is a physical motion that a user employs to directly influence an object within an application or game on their device

## When to use
- User asks about **gestures** on visionOS (e.g. `"how do I design gestures for Apple Vision Pro"`).
- User is building an Apple Vision Pro UI that needs gestures and wants to follow Apple's guidelines.
- User asks to audit or review gestures in a visionOS design.
- User mentions gestures in the context of an Apple Vision Pro app, game, or interface.

## Quick principles
- **Provide multiple methods for users to interact with your application** — Users often rely on alternative inputs—such as voice, keyboard, or Switch Control—to interact with their devices
- **Ensure gestures respond in a manner consistent with user expectations** — Users anticipate that most gestures will function similarly regardless of the current context
- **Ensure gestures are handled with maximum responsiveness** — Effective gestures improve the direct manipulation experience and offer immediate feedback
- **Clearly communicate when a gesture is unavailable** — If you fail to clearly explain why a gesture fails, users may mistakenly believe the app has frozen or that they are…
- **Implement custom gestures only when they are essential** — Custom gestures function optimally when they are designed for specialized, frequently performed tasks that existing interactions do not cover, such as in…
- **Ensure custom gestures are intuitive to learn** — Provide opportunities within the app for users to quickly grasp and perform custom gestures, and rigorously test your interactions in realistic usage…
- **Employ shortcut gestures to enhance standard gestures, not supersede them** — Although a custom gesture can provide quick access to parts of your application, users still require simple, familiar methods for navigation and…
- **Prevent conflicts with gestures that invoke system UI** — different platforms include established gestures for accessing system behaviors, such as edge swiping in watchOS or rolling the hand to access overlays…
- **Support standard gestures wherever possible** — For example, as soon as a user focuses on an object in your application or game, tap is the initial gesture they…
- **Offer both indirect and direct interactions when feasible** — Favor indirect gestures for UI elements and common components such as buttons
- **Do not mandate specific body movements or positions for input** — Not everyone can perform certain body movements or maintain particular positions at all times, due to factors like disability, spatial limitations, or…
- **Prioritize comfort** — Thoroughly test the ergonomics of all interactions that rely on custom gestures

## Full guidance
Read the referenced files for the complete Apple guidance on this topic:
- @references/guidelines-overview.md
- @references/guidelines-best-practices.md
- @references/guidelines-custom-gestures-overview.md
- @references/guidelines-custom-gestures-designing-custom-gestures-in-visionos.md
- @references/guidelines-custom-gestures-working-with-system-overlays-in-visionos.md
- @references/guidelines-specifications.md
