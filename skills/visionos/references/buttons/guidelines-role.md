# Role
A system button must be assigned one of the following roles:

- **Normal.** Serves as a standard, non-specific action button.
- **Primary.** Indicates the default selection—the action users are most likely to take.
- **Cancel.** Aborts the current operation or flow.
- **Destructive.** Executes an action that may result in data loss or permanent change.

A button's assigned role influences its visual presentation. For instance, a primary button adopts the application’s accent color, while a destructive button uses the system's designated red color.

- **Assign the primary role to the action users are most likely to select.** When a primary button responds to the Return key, it provides quick confirmation for the user. Furthermore, if the button exists within a temporary context—such as a **Sheets** view, an editable screen, or an **Alerts**—designating it as primary allows the view to automatically dismiss upon pressing Return.
- **Do not assign the primary role to a button that performs a destructive action, even if it is the most probable choice.** Due to its high visual visibility, users sometimes select a primary button without fully reading its function. To prevent accidental data loss, reserve the primary role for non-destructive actions.

## Platform guidance — visionOS
A visionOS button typically includes a visible background to aid visibility and provides sound feedback upon interaction.

There are three standard shapes for buttons in visionOS. Typically, an icon-only button utilizes a [circle](apple:SwiftUI/ButtonBorderShape/circle) shape; a text-only button uses either a [roundedRectangle](apple:SwiftUI/ButtonBorderShape/roundedRectangle) or [capsule](apple:SwiftUI/ButtonBorderShape/capsule) shape; and a button combining both an icon and text uses the capsule shape.

visionOS buttons employ distinct visual styles to communicate four different interaction states.

> **Note**
> In visionOS, buttons do not support custom hover effects.

In addition to the four states mentioned above, a button may display a tooltip when viewed for a short duration. Generally, buttons that include text do not require a tooltip because the descriptive label conveys their function.

In visionOS, buttons can be implemented in the following sizes:

|Shape|Mini (28 pt)|Small (32 pt)|Regular (44 pt)|Large (52 pt)|Extra large (64 pt)|
|---|---|---|---|---|---|
|Circular||||||
|Capsule (text only)||||||
|Capsule (text and icon)||||||
|Rounded rectangle||||||

**Prefer buttons that possess a discernible background shape and fill.** It is generally easier for users to locate a button when it is enclosed in a shape with a contrasting background fill. The exception applies to buttons within a toolbar, context menu, alert, or **Ornaments** where the surrounding component's shape and material ensure comfortable visibility. The following guidelines assist in ensuring a button renders appropriately across different contexts:

- When a button overlays glass **visionOS**, use the [thin](apple:SwiftUI/Material/thin) material for its background.
- When a button floats in space, use the **visionOS** material for its background.
- **Avoid creating a custom button that features a white background fill with black text or icons.** This specific visual style is reserved by the system to indicate a toggled state.
- **In general, favor circular or capsule-shaped buttons.** Users naturally focus on the corners of a shape, making it difficult to maintain visual attention on the center. The more rounded a button is, the easier it is for users to maintain steady focus on it. If you must display a button alone, choose the capsule shape.
- **Provide adequate spacing around a button to ensure easy viewing.** Aim to position buttons so their centers are always separated by at least 60 pts. If your buttons measure 60 pts or larger, add 4 pts of padding around them to prevent hover effects from overlapping. Furthermore, it is usually best practice to avoid arranging small or mini buttons in a vertical stack or horizontal row.
- **Select the appropriate shape when displaying text-labeled buttons in a stack or row.** Specifically, use the rounded-rectangle shape for vertical stacks of buttons and the capsule shape for horizontal rows.
- **Utilize standard controls to leverage the audible feedback sounds users are already familiar with.** Audible feedback is particularly crucial in visionOS, as the system does not provide haptics.
