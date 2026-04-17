# Tasks
A care plan generally outlines prescribed actions individuals must perform, such as exercising, taking medication, consuming specific foods, or reporting symptoms. CareKit UI provides several task view styles to present these prescribed actions. Typically, you configure a task view by supplying the necessary information, often sourced from an on-device CareKit Store database. Occasionally, you may also include custom UI components.

A task can contain the following data types:

|Information|Required|Description|Example value|
|---|---|---|---|
|Title|Yes|A short phrase or word introducing the task.|*Ibuprofen*|
|Schedule|Yes|The frequency required for completing the task.|*Four times a day*|
|Instructions|No|Detailed warnings, recommendations, and instructions.|*Take 1 tablet every 4–6 hours (not to exceed 4 tablets daily).*|
|Group ID|No|An identifier used to logically group similar tasks within your application.|A category like *medication* or *exercise*.|

In CareKit 2.0, CareKit UI supports five task view styles: simple, instructions, log, checklist, and grid. Each style is engineered to support a specific use case.

- **Use the simple style for a one-step task.** The default simple view includes a header area containing a title, subtitle, and button. You supply the title and subtitle, and optionally provide a custom image for the completion button. If no image is provided, CareKit indicates task completion by filling the button and displaying a checkmark. Since the default simple-style view lacks a content stack, consider an alternative task style if additional content needs to be displayed.
- **Use the instructions style when you need to append informative text to a simple task.** For instance, if a single-step medication task requires supplementary details—such as "Take on an empty stomach" or "Take at bedtime"—the instructions style can be used to present this information.
- **Use the log style to facilitate event logging.** For example, you might use this task style to provide a button allowing users to record symptoms like nausea. The log-style task automatically includes a timestamp each time the patient records an event.
- **Use the checklist style to display a sequence of actions or steps in a multi-step task.** For example, if a patient must take medication three times daily, you could list these three scheduled instances in a checklist. Each item can include descriptive text and a button allowing users to mark it as complete. By default, the checklist task can also display instructional text beneath the list.
- **Use the grid style to present a multi-step task using a compact arrangement of buttons.** Similar to the checklist style, the grid supports multi-step tasks but displays steps more compactly. You can supply a brief title for each button (if a detailed description is needed, the checklist style may be preferable). By default, the grid-style task can also include instructional text below the button grid. Unlike other styles, the grid style provides access to its underlying collection view, allowing you to display custom UI elements within the grid layout.
- **Consider using color to reinforce the meaning of task items.** Color is an effective method for allowing users to grasp information quickly. For example, you could assign one color to medications and another to physical activities. Always ensure that color is not the sole means of conveying information. Refer to **Color** for guidance.
- **Combine accuracy with simplicity when describing a task and its steps.** For example, use the medication's marketing name rather than its chemical description. Additionally, minimize word count when context clarifies meaning; for instance, a daily medication task generally implies the timing of specific medications, making the word *take* potentially redundant.
- **Consider supplementing multi-step or complex tasks with videos or images.** Visually demonstrating a task can help users prevent errors.
