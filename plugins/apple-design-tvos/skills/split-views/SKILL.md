---
name: split-views
description: "A split view manages the simultaneous presentation of multiple adjacent content panes. Each pane can host different components, such as tables, collections, images, or custom views. Use when designing split views for tvOS, auditing split views against Apple's tvOS guidelines, or when the user says things like \"design split views for Apple TV\", \"split views on tvOS\", \"how should split views work on Apple TV\"."
allowed-tools: Read Grep Glob
---

# Split views
A split view manages the simultaneous presentation of multiple adjacent content panes. Each pane can host different components, such as tables, collections, images, or custom views

## When to use
- User asks about **split views** on tvOS (e.g. `"how do I design split views for Apple TV"`).
- User is building an Apple TV UI that needs split views and wants to follow Apple's guidelines.
- User asks to audit or review split views in a tvOS design.
- User mentions split views in the context of an Apple TV app, game, or interface.

Typically, a split view is employed to display multiple levels of the application's hierarchy simultaneously and facilitate navigation between them. In this setup, selecting an item in the primary pane renders its contents within the secondary pane. Likewise, if items in the secondary pane contain further content, a tertiary pane may also be displayed.

It is common practice to utilize a split view for displaying [Sidebars](sidebars.md) used for navigation, where the leading pane lists top-level items or collections, and the secondary and optional tertiary panes present child collections and individual item details. Less frequently, a split view might be used to provide supplementary groups of functionality alongside the primary view—for instance, macOS Keynote uses split view panes to display the slide navigator, presenter notes, and the inspector pane surrounding the main slide canvas.

### Best practices
- **To support navigation, maintain a persistent visual indicator for the currently selected item in every pane that links to the detail view.** This selection state clarifies how content across different panes relates and assists users in maintaining their orientation within the app.
- **Consider enabling drag and drop functionality between panes.** Since a split view offers access to different levels of the application's hierarchy, users can efficiently transfer content between different sections of your app by dragging items into alternative panes. Refer to [Drag and drop](drag-and-drop.md) for implementation guidance.

## Platform guidance — tvOS
In tvOS, a split view is effective for content filtering. When users select a filter category in the primary pane, your application can render the resulting data in the secondary pane.

- **Select a split view configuration that maintains visual balance between the panes.** Although the default setup allocates one-third of the screen width to the primary pane and two-thirds to the secondary pane, you also have the option to define an equal half-and-half layout.
- **Use a single title above the split view to convey the overall context of the content.** Since users are already familiar with how a split view functions for navigation and filtering, titles describing the specific content of each individual pane are unnecessary.
- **Determine the title's alignment based on the nature of the content presented in the secondary pane.** Specifically, if the secondary pane displays a collection of items, consider centering the title within the window. Conversely, if the secondary pane presents one primary view of critical content, consider positioning the title above the main view to maximize screen real estate for that content.
