---
name: digit-entry-views
description: "The digit entry view occupies the entire screen, prompting users to input a sequence of numbers (e.g., a PIN) using a dedicated numeric keyboard. Use when designing digit entry views for macOS, auditing digit entry views against Apple's macOS guidelines, or when the user says things like \"design digit entry views for Mac\", \"digit entry views on macOS\", \"how should digit entry views work on Mac\"."
allowed-tools: Read Grep Glob
---

# Digit entry views
The digit entry view occupies the entire screen, prompting users to input a sequence of numbers (e.g., a PIN) using a dedicated numeric keyboard

## When to use
- User asks about **digit entry views** on macOS (e.g. `"how do I design digit entry views for Mac"`).
- User is building a Mac UI that needs digit entry views and wants to follow Apple's guidelines.
- User asks to audit or review digit entry views in a macOS design.
- User mentions digit entry views in the context of a Mac app, game, or interface.

An optional title and prompt can be displayed above the digit input line.

### Best practices
- **Use secure digit fields.** These fields mask entered digits with asterisks on screen. They must be utilized whenever your application requests sensitive information.
- **Clearly state the purpose of the digit entry view.** Provide a title and prompt that explains why the user needs to enter digits.
