---
name: split-views
description: "A split view manages the simultaneous presentation of multiple adjacent content panes. Each pane can host different components, such as tables, collections, images, or custom views. Use when designing split views for visionOS, auditing split views against Apple's visionOS guidelines, or when the user says things like \"design split views for Apple Vision Pro\", \"split views on visionOS\", \"how should split views work on Apple Vision Pro\"."
allowed-tools: Read Grep Glob
---

# Split views
A split view manages the simultaneous presentation of multiple adjacent content panes. Each pane can host different components, such as tables, collections, images, or custom views

## When to use
- User asks about **split views** on visionOS (e.g. `"how do I design split views for Apple Vision Pro"`).
- User is building an Apple Vision Pro UI that needs split views and wants to follow Apple's guidelines.
- User asks to audit or review split views in a visionOS design.
- User mentions split views in the context of an Apple Vision Pro app, game, or interface.

Typically, a split view is employed to display multiple levels of the application's hierarchy simultaneously and facilitate navigation between them. In this setup, selecting an item in the primary pane renders its contents within the secondary pane. Likewise, if items in the secondary pane contain further content, a tertiary pane may also be displayed.

It is common practice to utilize a split view for displaying [Sidebars](sidebars.md) used for navigation, where the leading pane lists top-level items or collections, and the secondary and optional tertiary panes present child collections and individual item details. Less frequently, a split view might be used to provide supplementary groups of functionality alongside the primary view—for instance, macOS Keynote uses split view panes to display the slide navigator, presenter notes, and the inspector pane surrounding the main slide canvas.

### Best practices
- **To support navigation, maintain a persistent visual indicator for the currently selected item in every pane that links to the detail view.** This selection state clarifies how content across different panes relates and assists users in maintaining their orientation within the app.
- **Consider enabling drag and drop functionality between panes.** Since a split view offers access to different levels of the application's hierarchy, users can efficiently transfer content between different sections of your app by dragging items into alternative panes. Refer to [Drag and drop](drag-and-drop.md) for implementation guidance.

## Platform guidance — visionOS
**When presenting supplementary details, favor a split view over opening a new window.** A split view provides users with effortless access to additional information without disrupting their current context, whereas a new window risks confusing users attempting to navigate or relocate content. Additionally, utilizing multiple windows requires meticulous management of view relationships within your application or game. If you only need to request a small amount of information or present a simple task that must be completed before the user returns to their primary activity, use [Sheets](sheets.md).
