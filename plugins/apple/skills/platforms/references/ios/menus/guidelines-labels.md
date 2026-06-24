# Labels
A menu item's label should describe its function and may include a symbol if it aids clarity. Within an application, a menu item can also display the corresponding keyboard command, if one exists; however, in a game, displaying a keyboard command is uncommon because games usually accommodate input from different devices and may offer unique mappings for different keys.

> **Note**
> Depending on the menu's arrangement, an app running on iOS, iPadOS, or visionOS might feature several unlabeled menu items that rely solely on symbols or icons for identification. For specific guidance, refer to [visionOS](#visionOS) and [iOS, iPadOS](#iOS-iPadOS).

- **Ensure that each menu item has a label that is both clear and concise.** Generally, if a menu item triggers an action, label it using a verb or verb phrase that describes that action (e.g., View, Close, Select). For guidance on labeling items that toggle interface visibility or display a currently selected state, consult [Toggled items](#Toggled-items). As with all your copy, let your app's or game's communication style dictate the tone of these menu-item labels.
- **To maintain consistency with platform experiences, use title-style capitalization.** While a game might employ a different writing convention, generally favor title-style capitalization. This style capitalizes every word except articles, coordinating conjunctions, and short prepositions, and it also capitalizes the final word in the label, regardless of its grammatical role. For a complete guide on this English capitalization style, see [title-style capitalization](https://support.apple.com/guide/applestyleguide/c-apsgb744e4a3/web#apdca93e113f1d64).

**Omit articles such as *a*, *an*, and *the* from menu-item labels to conserve space.** In English, articles invariably lengthen labels but rarely improve comprehension. For instance, changing a label from View Settings to View the Settings does not add any extra clarity.

- **Indicate when a menu item is unavailable.** An unavailable menu item often appears dimmed and will not respond to user interaction. If all items within a menu are unavailable, the menu itself must remain accessible so users can open it and review its contents.
- **Append an ellipsis (…) to a menu item’s label when the action requires further information before completion.** The ellipsis signals that users must input data or make additional choices, typically within a subsequent view.
