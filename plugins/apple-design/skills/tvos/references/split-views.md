# Split views
A split view manages the simultaneous presentation of multiple adjacent content panes. Each pane can host different components, such as tables, collections, images, or custom views

## Platform guidance — tvOS
In tvOS, a split view is effective for content filtering. When users select a filter category in the primary pane, your application can render the resulting data in the secondary pane.

- **Select a split view configuration that maintains visual balance between the panes.** Although the default setup allocates one-third of the screen width to the primary pane and two-thirds to the secondary pane, you also have the option to define an equal half-and-half layout.
- **Use a single title above the split view to convey the overall context of the content.** Since users are already familiar with how a split view functions for navigation and filtering, titles describing the specific content of each individual pane are unnecessary.
- **Determine the title's alignment based on the nature of the content presented in the secondary pane.** Specifically, if the secondary pane displays a collection of items, consider centering the title within the window. Conversely, if the secondary pane presents one primary view of critical content, consider positioning the title above the main view to maximize screen real estate for that content.
