---
name: virtual-keyboards
description: "On devices lacking a physical keyboard, the operating system provides several virtual keyboard options for data input. Use when designing virtual keyboards for iOS and iPadOS, auditing virtual keyboards against Apple's iOS and iPadOS guidelines, or when the user says things like \"design virtual keyboards for iPhone\", \"virtual keyboards on iOS and iPadOS\", \"how should virtual keyboards work on iPhone\"."
allowed-tools: Read Grep Glob
---

# Virtual keyboards
On devices lacking a physical keyboard, the operating system provides several virtual keyboard options for data input

## When to use
- User asks about **virtual keyboards** on iOS and iPadOS (e.g. `"how do I design virtual keyboards for iPhone"`).
- User is building an iPhone UI that needs virtual keyboards and wants to follow Apple's guidelines.
- User asks to audit or review virtual keyboards in an iOS and iPadOS design.
- User mentions virtual keyboards in the context of an iPhone app, game, or interface.

## Quick principles
- **Select a keyboard that aligns with the content users are editing** — For instance, if you provide numbers and punctuation keyboards, you can assist users who need to enter numeric data
- **Consider customizing the Return key type if it improves clarity during text entry** — The Return key's behavior is determined by the chosen keyboard type, but you have the option to modify it if appropriate for…
- **Ensure your custom input view is appropriate for the context of your application** — Beyond making data entry straightforward and intuitive, users must understand why your custom input view is beneficial
- **Reproduce the standard keyboard sound when users are typing** — Since the keyboard sound offers predictable feedback when a user taps a key on the system keyboard, they will likely anticipate hearing…
- **Ensure there is an obvious and simple method for users to switch between keyboards** — Users are accustomed to the Globe key on the standard keyboard—which serves as the dedicated Emoji key when multiple keyboards are available—and…
- **Do not replicate features already provided by the system keyboard** — On certain devices, the Emoji/Globe key and Dictation key automatically appear below the keyboard, even when custom keyboards are in use
- **Consider including a tutorial for the keyboard within your application** — Since users are accustomed to the standard keyboard, mastering a new input method requires time
- **Use the keyboard layout guide to make the keyboard feel like an integrated part of your interface** — Utilizing this layout guide also assists in keeping essential parts of your interface visible while the virtual keyboard is displayed
- **Place custom controls above the keyboard thoughtfully** — Certain applications utilize an input accessory view, which holds custom controls positioned above the keyboard to provide app-specific functionality pertaining to the…

## Full guidance
Read the referenced files for the complete Apple guidance on this topic:
- @references/guidelines.md
