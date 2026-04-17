---
name: digit-entry-views
description: "The digit entry view occupies the entire screen, prompting users to input a sequence of numbers (e.g., a PIN) using a dedicated numeric keyboard. Use when designing digit entry views for iOS and iPadOS, auditing digit entry views against Apple's iOS and iPadOS guidelines, or when the user says things like \"design digit entry views for iPhone\", \"digit entry views on iOS and iPadOS\", \"how should digit entry views work on iPhone\"."
allowed-tools: Read Grep Glob
---

# Digit entry views
The digit entry view occupies the entire screen, prompting users to input a sequence of numbers (e.g., a PIN) using a dedicated numeric keyboard

## When to use
- User asks about **digit entry views** on iOS and iPadOS (e.g. `"how do I design digit entry views for iPhone"`).
- User is building an iPhone UI that needs digit entry views and wants to follow Apple's guidelines.
- User asks to audit or review digit entry views in an iOS and iPadOS design.
- User mentions digit entry views in the context of an iPhone app, game, or interface.

An optional title and prompt can be displayed above the digit input line.

### Best practices
- **Use secure digit fields.** These fields mask entered digits with asterisks on screen. They must be utilized whenever your application requests sensitive information.
- **Clearly state the purpose of the digit entry view.** Provide a title and prompt that explains why the user needs to enter digits.
