---
name: rating-indicators
description: "A rating indicator conveys a ranking level using a sequence of horizontally arranged graphical symbols, which default to stars. Use when designing rating indicators for visionOS, auditing rating indicators against Apple's visionOS guidelines, or when the user says things like \"design rating indicators for Apple Vision Pro\", \"rating indicators on visionOS\", \"how should rating indicators work on Apple Vision Pro\"."
allowed-tools: Read Grep Glob
---

# Rating indicators
A rating indicator conveys a ranking level using a sequence of horizontally arranged graphical symbols, which default to stars

## When to use
- User asks about **rating indicators** on visionOS (e.g. `"how do I design rating indicators for Apple Vision Pro"`).
- User is building an Apple Vision Pro UI that needs rating indicators and wants to follow Apple's guidelines.
- User asks to audit or review rating indicators in a visionOS design.
- User mentions rating indicators in the context of an Apple Vision Pro app, game, or interface.

The indicator does not render partial symbols; rather, it rounds the value to display only complete symbols. Furthermore, all symbols within the indicator must maintain uniform spacing and should not scale or compress to fit the component's width.

### Best practices
- **Facilitate rank modification.** When displaying a list of ranked items, users should be able to adjust the individual item ranks inline without requiring navigation to a separate editing view.
- **If you replace the star with a custom symbol, ensure its purpose is clear.** The star is a highly recognizable ranking motif, and users may not associate other symbols with the concept of a rating scale.
