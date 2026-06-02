# Toggles
A toggle enables users to select between two opposing states, such as on or off, using a distinct visual appearance for each state

## Platform guidance — iOS & iPadOS
- **Use the switch toggle style exclusively within a list row.** In this scenario, providing a label is unnecessary because the surrounding content in the row establishes the context for the switch's controlled state.
- **Change the default color of a switch only if required.** While the standard green hue is effective in most implementations, you may choose to utilize your application's accent color. If you change the color, ensure it maintains sufficient contrast with its inactive appearance to remain clearly perceptible.
- **Outside of a list, employ a button that functions as a toggle, rather than a switch.** For instance, the Phone application utilizes a filter button toggle to allow users to refine their recent calls. The app achieves this by applying a blue highlight when the toggle is active and removing it when inactive.
- **Avoid providing a label that describes the button's function.** The combination of your custom interface icon and the varied background appearances you provide allows users to understand the button's action. For developer guidance, refer to [changesSelectionAsPrimaryAction](apple:UIKit/UIButton/changesSelectionAsPrimaryAction).
