---
name: toggles
description: "A toggle enables users to select between two opposing states, such as on or off, using a distinct visual appearance for each state. Use when designing toggles for iOS and iPadOS, auditing toggles against Apple's iOS and iPadOS guidelines, or when the user says things like \"design toggles for iPhone\", \"toggles on iOS and iPadOS\", \"how should toggles work on iPhone\"."
allowed-tools: Read Grep Glob
---

# Toggles
A toggle enables users to select between two opposing states, such as on or off, using a distinct visual appearance for each state

## When to use
- User asks about **toggles** on iOS and iPadOS (e.g. `"how do I design toggles for iPhone"`).
- User is building an iPhone UI that needs toggles and wants to follow Apple's guidelines.
- User asks to audit or review toggles in an iOS and iPadOS design.
- User mentions toggles in the context of an iPhone app, game, or interface.

Toggles can utilize different styles, including switches and checkboxes. Since different platforms may implement these styles uniquely, consult [Platform considerations](#Platform-considerations) for specific guidance.

Furthermore, all platforms support buttons that function as toggles if they visually represent distinct states. Developers seeking implementation details should refer to [ToggleStyle](apple:SwiftUI/ToggleStyle).

### Best practices
- **Use a toggle when users need to select between two mutually exclusive values that control the state of content or a view.** Since a toggle always allows users to manage a specific state, if the action involves choosing from a list of options, use a different component, such as [Pop-up buttons](pop-up-buttons.md).
- **Clearly indicate the setting, view, or content that the toggle controls.** Generally, the surrounding context provides sufficient information for users to understand what they are activating or deactivating. In certain scenarios, particularly within macOS applications, you may also provide a label describing the toggle's controlled state. If you employ a button that functions as a toggle, typically use an interface icon to convey its purpose and update its appearance—often by altering the background—to reflect the current state.
- **Ensure that the visual distinctions between a toggle's states are immediately apparent.** For instance, you could add or remove a color fill, display or conceal the background shape, or modify internal details like a checkmark or dot to indicate whether the toggle is active or inactive. Do not rely exclusively on color differences to communicate state, as not all users perceive color equally.

## Platform guidance — iOS & iPadOS
- **Use the switch toggle style exclusively within a list row.** In this scenario, providing a label is unnecessary because the surrounding content in the row establishes the context for the switch's controlled state.
- **Change the default color of a switch only if required.** While the standard green hue is effective in most implementations, you may choose to utilize your application's accent color. If you change the color, ensure it maintains sufficient contrast with its inactive appearance to remain clearly perceptible.
- **Outside of a list, employ a button that functions as a toggle, rather than a switch.** For instance, the Phone application utilizes a filter button toggle to allow users to refine their recent calls. The app achieves this by applying a blue highlight when the toggle is active and removing it when inactive.
- **Avoid providing a label that describes the button's function.** The combination of your custom interface icon and the varied background appearances you provide allows users to understand the button's action. For developer guidance, refer to [changesSelectionAsPrimaryAction](apple:UIKit/UIButton/changesSelectionAsPrimaryAction).
