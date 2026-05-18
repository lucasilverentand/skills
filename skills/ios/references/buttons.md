# Buttons — full guidelines
- **Style.** This refers to the visual presentation, including dimensions, hue, and form.
- **Content.** This is what the button displays—a symbol (or icon), a text label, or both—to convey its purpose.
- **Role.** This is a system-defined function that establishes the button's semantic meaning and may influence its visual rendering.

Additionally, there are different components that resemble buttons but possess unique appearances and behaviors tailored for specific scenarios, such as [Toggles](toggles.md), **Pop-up buttons**, and [Segmented controls](segmented-controls.md).

### Best practices
When buttons are immediately recognizable and clearly understood, an application feels intuitive and professionally designed.

- **Make buttons easy for people to use.** Adequate spacing around a button is necessary so users can visually differentiate it from adjacent elements and content. This generous padding is also crucial for successful selection or activation, regardless of the input method employed. Generally, a button must possess a hit target area of at least 44x44 pt—or 60x60 pt in visionOS—to ensure effortless selection via fingertip, pointer, visual focus, or remote control.
- **Always include a press state for a custom button.** If a button lacks visual feedback indicating it has been pressed, users may perceive it as unresponsive and unsure if their input was registered.

### Style
System buttons offer different styles that allow for customization while providing inherent interaction states, accessibility support, and appearance adaptation. Different platforms define distinct styles to help you communicate the hierarchy of actions within your application.

- **In general, use a button that has a prominent visual style for the most likely action in a view.** To draw attention to a specific button, employ a prominent style so the system can apply an accent color to its background. Color-infused buttons are typically the most visually distinct, enabling users to quickly identify the actions they are most likely to select. Limit the number of prominent buttons to one or two per view. Presenting too many visually dominant buttons increases cognitive load, forcing users to spend extra time evaluating options before committing to a choice.
- **Use style — not size — to visually distinguish the preferred choice among multiple options.** When you present two or more choices using buttons of identical size, you signal that these options belong to a unified set. Conversely, placing two buttons of differing sizes close together can result in an interface that appears inconsistent and confusing. If you wish to emphasize the preferred or most probable option within a group, assign it a more prominent button style while using a less noticeable style for the rest.
- **Avoid applying a similar color to button labels and content layer backgrounds.** If your application already features bright, colorful content in the content layer, it is advisable to use the default monochromatic appearance for button labels. For further details, consult **Liquid Glass color**.

### Content
**Ensure that each button clearly communicates its purpose.** Depending on the platform, a button may contain an icon, a text label, or both to assist users in understanding its function.

> **Note**
> In macOS and visionOS, the system displays a tooltip after users hover over a button for a period. A tooltip presents a concise phrase explaining the button's action; please refer to **Offering help** for guidance.

- **Try to associate familiar actions with familiar icons.** For instance, users can predict that a button containing the `square.and.arrow.up` symbol will facilitate share-related activities. If you decide to use an icon, consider leveraging either existing or customized **SF Symbols**. For a compilation of symbols representing common actions, consult **Standard icons**.
- **Consider using text when a short label communicates more clearly than an icon.** If you use text, compose a few words that succinctly describe the button's function. Following [title-style capitalization](https://help.apple.com/applestyleguide/#/apsgb744e4a3?sub=apdca93e113f1d64), consider starting the label with a verb to effectively convey the button's action—for example, a button enabling users to add items to their shopping cart might use the label “Add to Cart.”

### Role
A system button must be assigned one of the following roles:

- **Normal.** Serves as a standard, non-specific action button.
- **Primary.** Indicates the default selection—the action users are most likely to take.
- **Cancel.** Aborts the current operation or flow.
- **Destructive.** Executes an action that may result in data loss or permanent change.

A button's assigned role influences its visual presentation. For instance, a primary button adopts the application’s accent color, while a destructive button uses the system's designated red color.

- **Assign the primary role to the action users are most likely to select.** When a primary button responds to the Return key, it provides quick confirmation for the user. Furthermore, if the button exists within a temporary context—such as a [Sheets](sheets.md) view, an editable screen, or an [Alerts](alerts.md)—designating it as primary allows the view to automatically dismiss upon pressing Return.
- **Do not assign the primary role to a button that performs a destructive action, even if it is the most probable choice.** Due to its high visual visibility, users sometimes select a primary button without fully reading its function. To prevent accidental data loss, reserve the primary role for non-destructive actions.

## Platform guidance — iOS & iPadOS
**Configure a button to display an activity indicator when you need to provide feedback about an action that doesn’t instantly complete.** Integrating an activity indicator into a button allows you to conserve screen real estate while effectively communicating why the action is delayed. To enhance clarity regarding the ongoing process, you also have the option to set an alternative label alongside the activity indicator. For instance, if the button initially reads "Checkout," it could transition to "Checking out…" while the indicator is active. When a delay occurs following the user's tap or click of your configured button, the system displays the activity indicator adjacent to either the original or alternative label, concurrently obscuring any button image.
