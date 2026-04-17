---
name: playing-haptics
description: "Haptic feedback can involve users' sense of touch, allowing you to integrate a feeling of the physical world into your application or game. Use when designing playing haptics for macOS, auditing playing haptics against Apple's macOS guidelines, or when the user says things like \"design playing haptics for Mac\", \"playing haptics on macOS\", \"how should playing haptics work on Mac\"."
allowed-tools: Read Grep Glob
---

# Playing haptics
Haptic feedback can involve users' sense of touch, allowing you to integrate a feeling of the physical world into your application or game

## When to use
- User asks about **playing haptics** on macOS (e.g. `"how do I design playing haptics for Mac"`).
- User is building a Mac UI that needs playing haptics and wants to follow Apple's guidelines.
- User asks to audit or review playing haptics in a macOS design.
- User mentions playing haptics in the context of a Mac app, game, or interface.

## Quick principles
- **Use system-provided haptic patterns according to their documented meanings** — Users recognize standard haptics because the operating system deploys them consistently when interacting with default controls
- **Use haptics consistently throughout your app or game** — It is crucial to establish a clear, causal link between each haptic event and the action that triggers it, allowing users to…
- **Prefer using haptics to complement other feedback in your app or game** — When visual, auditory, and tactile cues are synchronized—mirroring how physical reality operates—the user experience becomes more natural and cohesive
- **Avoid overusing haptics** — A haptic can feel perfectly timed when used sparingly, but overuse leads to user fatigue
- **In most apps, prefer playing short haptics that complement discrete events** — While long-running haptics can enhance a gameplay flow, they risk diluting feedback meaning and distracting users in an application environment
- **Make haptics optional** — Allow users to mute or disable haptic feedback, ensuring they can still enjoy your app or game without them
- **Be aware that playing haptics might impact other user experiences** — Since haptics generate physical vibrations detectable by users, ensure these vibrations do not interfere with device features such as the camera, gyroscope…

## Full guidance
Read the referenced files for the complete Apple guidance on this topic:
- @references/guidelines.md
