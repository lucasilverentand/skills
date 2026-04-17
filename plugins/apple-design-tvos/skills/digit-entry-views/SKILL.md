---
name: digit-entry-views
description: "The digit entry view occupies the entire screen, prompting users to input a sequence of numbers (e.g., a PIN) using a dedicated numeric keyboard. Use when designing digit entry views for tvOS, auditing digit entry views against Apple's tvOS guidelines, or when the user says things like \"design digit entry views for Apple TV\", \"digit entry views on tvOS\", \"how should digit entry views work on Apple TV\"."
allowed-tools: Read Grep Glob
---

# Digit entry views
The digit entry view occupies the entire screen, prompting users to input a sequence of numbers (e.g., a PIN) using a dedicated numeric keyboard

## When to use
- User asks about **digit entry views** on tvOS (e.g. `"how do I design digit entry views for Apple TV"`).
- User is building an Apple TV UI that needs digit entry views and wants to follow Apple's guidelines.
- User asks to audit or review digit entry views in a tvOS design.
- User mentions digit entry views in the context of an Apple TV app, game, or interface.

An optional title and prompt can be displayed above the digit input line.

### Best practices
- **Use secure digit fields.** These fields mask entered digits with asterisks on screen. They must be utilized whenever your application requests sensitive information.
- **Clearly state the purpose of the digit entry view.** Provide a title and prompt that explains why the user needs to enter digits.
