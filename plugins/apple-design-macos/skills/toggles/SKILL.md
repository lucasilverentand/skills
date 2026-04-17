---
name: toggles
description: "A toggle enables users to select between two opposing states, such as on or off, using a distinct visual appearance for each state. Use when designing toggles for macOS, auditing toggles against Apple's macOS guidelines, or when the user says things like \"design toggles for Mac\", \"toggles on macOS\", \"how should toggles work on Mac\"."
allowed-tools: Read Grep Glob
---

# Toggles
A toggle enables users to select between two opposing states, such as on or off, using a distinct visual appearance for each state

## When to use
- User asks about **toggles** on macOS (e.g. `"how do I design toggles for Mac"`).
- User is building a Mac UI that needs toggles and wants to follow Apple's guidelines.
- User asks to audit or review toggles in a macOS design.
- User mentions toggles in the context of a Mac app, game, or interface.

## Quick principles
- **Use a toggle when users need to select between two mutually exclusive values that control the state of content or a view** — Since a toggle always allows users to manage a specific state, if the action involves choosing from a list of options, use…
- **Clearly indicate the setting, view, or content that the toggle controls** — Generally, the surrounding context provides sufficient information for users to understand what they are activating or deactivating
- **Ensure that the visual distinctions between a toggle's states are immediately apparent** — For instance, you could add or remove a color fill, display or conceal the background shape, or modify internal details like a…
- **Place switches, checkboxes, and radio buttons within the window's main body, not its frame** — Specifically, these controls must be avoided in a toolbar or status bar
- **Prioritize a switch for settings that require emphasis** — Because a switch carries more visual weight than a checkbox, it is better suited when controlling functionality that exceeds the scope of…
- **When within a grouped form, consider utilizing a mini switch to manage the setting on a single row** — The height of a mini switch aligns with that of buttons and other controls, ensuring rows maintain consistent vertical sizing
- **Generally, do not substitute a checkbox with a switch** — If your interface currently employs checkboxes, it is usually recommended to maintain their usage
- **Use checkboxes instead of switches when you must convey a hierarchy of settings** — The visual consistency of checkboxes aids in alignment and communicates grouping
- **Consider radio buttons if you need to present a selection from more than two options that are mutually exclusive** — When users must select an option beyond a simple "on" or "off," employing multiple radio buttons helps clarify each choice with its…
- **If the relationship between a group of checkboxes is ambiguous, consider using a label to introduce them** — Describe the collection of options and align the label's baseline with the initial checkbox in the group
- **Ensure the checkbox's visual appearance accurately reflects its current state** — A checkbox can be on, off, or mixed
- **Prefer a set of radio buttons to present mutually exclusive options** — If users must select multiple choices from a group, use checkboxes

## Full guidance
Read the referenced files for the complete Apple guidance on this topic:
- @references/guidelines.md
