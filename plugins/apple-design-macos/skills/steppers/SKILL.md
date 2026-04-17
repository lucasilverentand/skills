---
name: steppers
description: "A stepper is a dual-segmented control used to increment or decrement an incremental value. Use when designing steppers for macOS, auditing steppers against Apple's macOS guidelines, or when the user says things like \"design steppers for Mac\", \"steppers on macOS\", \"how should steppers work on Mac\"."
allowed-tools: Read Grep Glob
---

# Steppers
A stepper is a dual-segmented control used to increment or decrement an incremental value

## When to use
- User asks about **steppers** on macOS (e.g. `"how do I design steppers for Mac"`).
- User is building a Mac UI that needs steppers and wants to follow Apple's guidelines.
- User asks to audit or review steppers in a macOS design.
- User mentions steppers in the context of a Mac app, game, or interface.

Because the stepper itself does not display a value, it must be positioned alongside a field that indicates the current setting.

### Best practices
- **Ensure the value a stepper modifies is clearly understood.** Since a stepper does not display any values on its own, users must be aware of which specific value they are adjusting while interacting with it.
- **Consider pairing a stepper with a text field when wide value ranges are anticipated.** Steppers are effective alone for making minor adjustments that require only a few taps or clicks. Conversely, users value the ability to input precise values via a field, particularly when the required inputs can fluctuate significantly. For instance, on a printing interface, providing both a stepper and a text field assists in setting the desired number of copies.

## Platform guidance — macOS
**For large value ranges, consider supporting Shift-click to change the value quickly.** If your application benefits from users making larger adjustments to a stepper's value, it is beneficial to allow Shift-clicking the stepper. This allows users to change the value by an amount exceeding the default increment (for instance, changing it by ten times the default step).
