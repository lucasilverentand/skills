---
name: pop-up-buttons
description: "A pop-up button presents a menu containing options that are mutually exclusive. Use when designing pop up buttons for macOS, auditing pop up buttons against Apple's macOS guidelines, or when the user says things like \"design pop up buttons for Mac\", \"pop up buttons on macOS\", \"how should pop up buttons work on Mac\"."
allowed-tools: Read Grep Glob
---

# Pop-up buttons
A pop-up button presents a menu containing options that are mutually exclusive

## When to use
- User asks about **pop up buttons** on macOS (e.g. `"how do I design pop up buttons for Mac"`).
- User is building a Mac UI that needs pop up buttons and wants to follow Apple's guidelines.
- User asks to audit or review pop up buttons in a macOS design.
- User mentions pop up buttons in the context of a Mac app, game, or interface.

Once an item is selected from the pop-up button’s menu, the menu dismisses, and the button updates its content to reflect the current choice.

### Best practices
**Employ a pop-up button to present a flat list where options or states are mutually exclusive.** A pop-up button assists users in making a selection that impacts their content or the surrounding view. However, if your requirements include any of the following, utilize a [pull-down button](pull-down-buttons.md) instead:

- Presenting a list of actions
- Allowing users to select multiple items
- Requiring a submenu
- **Ensure there is a helpful default selection.** While a pop-up button can dynamically update its display to reflect the current choice, if no selection has been made, it should display the default item you have designated. Whenever possible, make this default selection the option most likely to suit the majority of users.
- **Allow users to anticipate the pop-up button’s choices without opening it.** For instance, you can use a descriptive label or the button's own text to provide context regarding the options and their effect.
- **Consider using a pop-up button when screen real estate is constrained and you do not need to display all options constantly.** Pop-up buttons offer a space-efficient method for presenting a wide range of choices.
- **If needed, include a Custom option within the pop-up button’s menu to supply additional items useful in certain scenarios.** Including a Custom option helps prevent the interface from becoming cluttered with controls or items that users only need occasionally. You may also display explanatory text beneath the list to clarify how the options function.
