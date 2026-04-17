---
name: image-wells
description: "An image well serves as an editable version of an image view. Use when designing image wells for watchOS, auditing image wells against Apple's watchOS guidelines, or when the user says things like \"design image wells for Apple Watch\", \"image wells on watchOS\", \"how should image wells work on Apple Watch\"."
allowed-tools: Read Grep Glob
---

# Image wells
An image well serves as an editable version of an image view

## When to use
- User asks about **image wells** on watchOS (e.g. `"how do I design image wells for Apple Watch"`).
- User is building an Apple Watch UI that needs image wells and wants to follow Apple's guidelines.
- User asks to audit or review image wells in a watchOS design.
- User mentions image wells in the context of an Apple Watch app, game, or interface.

Once an image well has been selected, users are able to copy or paste its content, or delete it. Additionally, a user can drag a new image into an image well without needing to select the existing content first.

### Best practices
- **Revert to a default image when necessary.** If the image well requires an image, it must redisplay the default image if its content is cleared.
- **If your image well supports copy and paste, ensure the standard menu options for copying and pasting are available.** Users generally expect to interact with an image well using these menu items or standard keyboard shortcuts. For instructions, see [Edit menu](the-menu-bar.md#Edit-menu).

For related information, consult [Image views](image-views.md).
