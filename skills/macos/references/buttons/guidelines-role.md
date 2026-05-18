# Role
A system button must be assigned one of the following roles:

- **Normal.** Serves as a standard, non-specific action button.
- **Primary.** Indicates the default selection—the action users are most likely to take.
- **Cancel.** Aborts the current operation or flow.
- **Destructive.** Executes an action that may result in data loss or permanent change.

A button's assigned role influences its visual presentation. For instance, a primary button adopts the application’s accent color, while a destructive button uses the system's designated red color.

- **Assign the primary role to the action users are most likely to select.** When a primary button responds to the Return key, it provides quick confirmation for the user. Furthermore, if the button exists within a temporary context—such as a **Sheets** view, an editable screen, or an **Alerts**—designating it as primary allows the view to automatically dismiss upon pressing Return.
- **Do not assign the primary role to a button that performs a destructive action, even if it is the most probable choice.** Due to its high visual visibility, users sometimes select a primary button without fully reading its function. To prevent accidental data loss, reserve the primary role for non-destructive actions.

## Platform guidance — macOS

##### Push buttons
The standard button type in macOS is referred to as a *push button*. Push buttons can be configured to display text, symbols, icons, images, or a combination thereof. They can function as the default button within a view and support tinting.

- **Use a flexible-height push button only when you need to display tall or variable height content.** Flexible-height buttons maintain the same configuration options as standard push buttons, including consistent corner radius and content padding, ensuring visual continuity with other interface controls. If the button requires two lines of text or a tall icon, utilize a flexible-height button; otherwise, use the standard push button. For developer reference, consult [NSButton.BezelStyle.flexiblePush](apple:AppKit/NSButton/BezelStyle-swift.enum/flexiblePush).
- **Append a trailing ellipsis to the title when a push button opens another window, view, or app.** Across the system, an ellipsis in a control title indicates that additional user input is possible. For instance, the Edit buttons found within Safari Settings' AutoFill pane display ellipses because they launch views allowing users to modify autofill values.
- **Consider supporting spring loading.** On systems equipped with a Magic Trackpad, *spring loading* allows users to activate a button by dragging selected items over it and performing a force click (pressing with greater pressure) without dropping the selections. Following the force click, users retain the ability to continue dragging items for potential subsequent actions.

##### Square buttons
A *square button*, also referred to as a *gradient button*, triggers an action affecting a view, such as adding or deleting rows in a table.

These square buttons utilize symbols or icons rather than text, and they can be configured to function as push buttons, toggles, or pop-up controls. They must appear near their associated view—typically inside or underneath it—to clearly indicate which view the buttons control.

- **Implement square buttons within a view, not in the window frame.** Square buttons are unsuitable for inclusion in toolbars or status bars. If a button is required within a **toolbar**, utilize a dedicated toolbar item instead.
- **Prioritize using a symbol within the square button.** **SF Symbols** offers numerous symbols that automatically adopt suitable coloring in their default state and when responding to user input.
- **Do not use labels to introduce square buttons.** Since these buttons are intrinsically linked to a specific view, their function is usually apparent without requiring descriptive text.

For guidance intended for developers, refer to [NSButton.BezelStyle.smallSquare](apple:AppKit/NSButton/BezelStyle-swift.enum/smallSquare).

##### Help buttons
A *help button* appears inside a view and launches the application's dedicated help documentation.

Help buttons are uniformly sized, circular controls featuring a question mark. For guidance on developing help documentation, refer to **Offering help**.

- **Utilize the system's built-in help button to display your application's help content.** Users are accustomed to the standard help button appearance and understand that selecting it accesses help material.
- **When possible, present the help topic relevant to the current context.** For instance, if the Mail settings Rules pane contains the help button, it should open the Mail User Guide to a topic explaining how those settings are modified. If no specific help topic applies directly to the current context, open the top level of your app’s documentation when a user selects the help button.
- **Include only one help button per window.** Having multiple help buttons in the same context makes it difficult for users to predict which one will be selected.
- **Place help buttons where users naturally look.** Refer to the following locations for guidance:

|View style|Help button location|
|---|---|
|Dialog with dismissal buttons (like OK and Cancel)|Lower corner, opposite to the dismissal buttons and vertically aligned with them|
|Dialog without dismissal buttons|Lower-left or lower-right corner|
|Settings window or pane|Lower-left or lower-right corner|

- **Place a help button within the view, not in the window frame.** For example, do not place it in a toolbar or status bar.
- **Do not include text introducing the help button.** Users understand the function of a help button, so additional descriptive text is unnecessary.

##### Image buttons
An *image button* is a view element that displays an image, symbol, or icon. This component can be configured to function as a push button, toggle, or pop-up button.

- **Place the image button within a view, not in the window frame.** For instance, do not place it inside a toolbar or status bar. If you require an image to serve as a button within a toolbar, utilize a dedicated toolbar item instead. Consult **Toolbars** for more information.
- **Ensure approximately 10 pixels of spacing between the image edges and the button boundaries.** An image button's clickable area is defined by its edges, even if those edges are not visually present. Incorporating this padding guarantees that a click registers accurately, even if it falls outside the image itself. Generally, refrain from including system-provided borders on an image button; refer to [isBordered](apple:AppKit/NSButton/isBordered) for developer advice.
- **If you include a label, position it beneath the image button.** See **Labels** for related guidance.
