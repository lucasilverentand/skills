---
name: split-views
description: "A split view manages the simultaneous presentation of multiple adjacent content panes. Each pane can host different components, such as tables, collections, images, or custom views. Use when designing split views for watchOS, auditing split views against Apple's watchOS guidelines, or when the user says things like \"design split views for Apple Watch\", \"split views on watchOS\", \"how should split views work on Apple Watch\"."
allowed-tools: Read Grep Glob
---

# Split views
A split view manages the simultaneous presentation of multiple adjacent content panes. Each pane can host different components, such as tables, collections, images, or custom views

## When to use
- User asks about **split views** on watchOS (e.g. `"how do I design split views for Apple Watch"`).
- User is building an Apple Watch UI that needs split views and wants to follow Apple's guidelines.
- User asks to audit or review split views in a watchOS design.
- User mentions split views in the context of an Apple Watch app, game, or interface.

Typically, a split view is employed to display multiple levels of the application's hierarchy simultaneously and facilitate navigation between them. In this setup, selecting an item in the primary pane renders its contents within the secondary pane. Likewise, if items in the secondary pane contain further content, a tertiary pane may also be displayed.

It is common practice to utilize a split view for displaying [Sidebars](sidebars.md) used for navigation, where the leading pane lists top-level items or collections, and the secondary and optional tertiary panes present child collections and individual item details. Less frequently, a split view might be used to provide supplementary groups of functionality alongside the primary view—for instance, macOS Keynote uses split view panes to display the slide navigator, presenter notes, and the inspector pane surrounding the main slide canvas.

### Best practices
- **To support navigation, maintain a persistent visual indicator for the currently selected item in every pane that links to the detail view.** This selection state clarifies how content across different panes relates and assists users in maintaining their orientation within the app.
- **Consider enabling drag and drop functionality between panes.** Since a split view offers access to different levels of the application's hierarchy, users can efficiently transfer content between different sections of your app by dragging items into alternative panes. Refer to [Drag and drop](drag-and-drop.md) for implementation guidance.

## Platform guidance — watchOS
In watchOS, the split view presents either the list or detail view as a full-screen experience.

- **Automatically display the most relevant detail view.** When users launch your application, ensure they are shown the most pertinent information. For example, display data relevant to their location, the current time, or their recent actions.
- **If your app displays multiple detail pages, place the detail views in a vertical [Tab views](tab-views.md).** Users can then cycle through the detail view's tabs using the Digital Crown. Additionally, watchOS displays a page indicator next to the Digital Crown that indicates both the total number of tabs and which tab is currently selected.
