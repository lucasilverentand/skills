---
name: buttons
description: "A button triggers an immediate action. Use when designing buttons for watchOS, auditing buttons against Apple's watchOS guidelines, or when the user says things like \"design buttons for Apple Watch\", \"buttons on watchOS\", \"how should buttons work on Apple Watch\"."
allowed-tools: Read Grep Glob
---

# Buttons
A button triggers an immediate action

## When to use
- User asks about **buttons** on watchOS (e.g. `"how do I design buttons for Apple Watch"`).
- User is building an Apple Watch UI that needs buttons and wants to follow Apple's guidelines.
- User asks to audit or review buttons in a watchOS design.
- User mentions buttons in the context of an Apple Watch app, game, or interface.

## Quick principles
- **Style** — This refers to the visual presentation, including dimensions, hue, and form
- **Content** — This is what the button displays—a symbol (or icon), a text label, or both—to convey its purpose
- **Role** — This is a system-defined function that establishes the button's semantic meaning and may influence its visual rendering
- **Make buttons easy for people to use** — Adequate spacing around a button is necessary so users can visually differentiate it from adjacent elements and content
- **Always include a press state for a custom button** — If a button lacks visual feedback indicating it has been pressed, users may perceive it as unresponsive and unsure if their input…
- **In general, use a button that has a prominent visual style for the most likely action in a view** — To draw attention to a specific button, employ a prominent style so the system can apply an accent color to its background
- **Use style — not size — to visually distinguish the preferred choice among multiple options** — When you present two or more choices using buttons of identical size, you signal that these options belong to a unified set
- **Avoid applying a similar color to button labels and content layer backgrounds** — If your application already features bright, colorful content in the content layer, it is advisable to use the default monochromatic appearance for…
- **Ensure that each button clearly communicates its purpose** — Depending on the platform, a button may contain an icon, a text label, or both to assist users in understanding its function
- **Try to associate familiar actions with familiar icons** — For instance, users can predict that a button containing the `square.and.arrow.up` symbol will facilitate share-related activities
- **Consider using text when a short label communicates more clearly than an icon** — If you use text, compose a few words that succinctly describe the button's function
- **Normal** — Serves as a standard, non-specific action button

## Full guidance
Read the referenced files for the complete Apple guidance on this topic:
- @references/guidelines.md
