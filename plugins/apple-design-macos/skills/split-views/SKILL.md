---
name: split-views
description: "A split view manages the simultaneous presentation of multiple adjacent content panes. Each pane can host different components, such as tables, collections, images, or custom views. Use when designing split views for macOS, auditing split views against Apple's macOS guidelines, or when the user says things like \"design split views for Mac\", \"split views on macOS\", \"how should split views work on Mac\"."
allowed-tools: Read Grep Glob
---

# Split views
A split view manages the simultaneous presentation of multiple adjacent content panes. Each pane can host different components, such as tables, collections, images, or custom views

## When to use
- User asks about **split views** on macOS (e.g. `"how do I design split views for Mac"`).
- User is building a Mac UI that needs split views and wants to follow Apple's guidelines.
- User asks to audit or review split views in a macOS design.
- User mentions split views in the context of a Mac app, game, or interface.

Typically, a split view is employed to display multiple levels of the application's hierarchy simultaneously and facilitate navigation between them. In this setup, selecting an item in the primary pane renders its contents within the secondary pane. Likewise, if items in the secondary pane contain further content, a tertiary pane may also be displayed.

It is common practice to utilize a split view for displaying [Sidebars](sidebars.md) used for navigation, where the leading pane lists top-level items or collections, and the secondary and optional tertiary panes present child collections and individual item details. Less frequently, a split view might be used to provide supplementary groups of functionality alongside the primary view—for instance, macOS Keynote uses split view panes to display the slide navigator, presenter notes, and the inspector pane surrounding the main slide canvas.

### Best practices
- **To support navigation, maintain a persistent visual indicator for the currently selected item in every pane that links to the detail view.** This selection state clarifies how content across different panes relates and assists users in maintaining their orientation within the app.
- **Consider enabling drag and drop functionality between panes.** Since a split view offers access to different levels of the application's hierarchy, users can efficiently transfer content between different sections of your app by dragging items into alternative panes. Refer to [Drag and drop](drag-and-drop.md) for implementation guidance.

## Platform guidance — macOS
In macOS, users can arrange the panes within a split view either vertically, horizontally, or in both orientations. A split view includes dividers between panes that allow for resizing via dragging. For detailed developer guidance, refer to [VSplitView](apple:SwiftUI/VSplitView) and [HSplitView](apple:SwiftUI/HSplitView).

- **Establish sensible minimum and maximum sizes for panes.** If users can adjust the pane dimensions in your application's split view, ensure that you utilize sizes which maintain the visibility of the divider. If a pane becomes excessively small, the divider may appear to vanish, leading to usability issues.
- **Evaluate allowing users to conceal a pane when appropriate.** For instance, if your application incorporates an editing interface, consider enabling users to hide other panes to minimize distractions or dedicate more screen real estate to the editing task—as demonstrated in Keynote, users can hide the navigator and presenter notes panes while they edit slide content.
- **Offer several methods to restore hidden panes.** For example, you could implement a toolbar button or a menu command, including an associated keyboard shortcut, that users can employ to bring back a hidden pane.
- **Default to the thin divider appearance.** The thin divider measures one point in width, which maximizes content display area while remaining easily operable. Only use a thicker divider style if there is a specific requirement. For example, if both sides of the divider display table rows that utilize strong linear elements making a thin divider difficult to discern, a thicker style might be beneficial. See [NSSplitView.DividerStyle](apple:AppKit/NSSplitView/DividerStyle-swift.enum) for developer guidance.
