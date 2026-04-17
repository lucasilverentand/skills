# Split views
A split view manages the simultaneous presentation of multiple adjacent content panes. Each pane can host different components, such as tables, collections, images, or custom views

## Platform guidance — watchOS
In watchOS, the split view presents either the list or detail view as a full-screen experience.

- **Automatically display the most relevant detail view.** When users launch your application, ensure they are shown the most pertinent information. For example, display data relevant to their location, the current time, or their recent actions.
- **If your app displays multiple detail pages, place the detail views in a vertical [Tab views](tab-views.md).** Users can then cycle through the detail view's tabs using the Digital Crown. Additionally, watchOS displays a page indicator next to the Digital Crown that indicates both the total number of tabs and which tab is currently selected.
