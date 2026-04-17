---
name: split-views
description: "A split view manages the simultaneous presentation of multiple adjacent content panes. Each pane can host different components, such as tables, collections, images, or custom views. Use when designing split views for iOS and iPadOS, auditing split views against Apple's iOS and iPadOS guidelines, or when the user says things like \"design split views for iPhone\", \"split views on iOS and iPadOS\", \"how should split views work on iPhone\"."
allowed-tools: Read Grep Glob
---

# Split views
A split view manages the simultaneous presentation of multiple adjacent content panes. Each pane can host different components, such as tables, collections, images, or custom views

## When to use
- User asks about **split views** on iOS and iPadOS (e.g. `"how do I design split views for iPhone"`).
- User is building an iPhone UI that needs split views and wants to follow Apple's guidelines.
- User asks to audit or review split views in an iOS and iPadOS design.
- User mentions split views in the context of an iPhone app, game, or interface.

Typically, a split view is employed to display multiple levels of the application's hierarchy simultaneously and facilitate navigation between them. In this setup, selecting an item in the primary pane renders its contents within the secondary pane. Likewise, if items in the secondary pane contain further content, a tertiary pane may also be displayed.

It is common practice to utilize a split view for displaying [Sidebars](sidebars.md) used for navigation, where the leading pane lists top-level items or collections, and the secondary and optional tertiary panes present child collections and individual item details. Less frequently, a split view might be used to provide supplementary groups of functionality alongside the primary view—for instance, macOS Keynote uses split view panes to display the slide navigator, presenter notes, and the inspector pane surrounding the main slide canvas.

### Best practices
- **To support navigation, maintain a persistent visual indicator for the currently selected item in every pane that links to the detail view.** This selection state clarifies how content across different panes relates and assists users in maintaining their orientation within the app.
- **Consider enabling drag and drop functionality between panes.** Since a split view offers access to different levels of the application's hierarchy, users can efficiently transfer content between different sections of your app by dragging items into alternative panes. Refer to [Drag and drop](drag-and-drop.md) for implementation guidance.

## Platform guidance — iOS & iPadOS

### iOS
**Utilize split view in a standard environment, not a compact one.** A split view demands horizontal space to properly display multiple panes. In constrained environments, such as an iPhone held in portrait orientation, displaying numerous panes becomes challenging without causing content to wrap or truncate, thereby reducing legibility and hindering interaction.

### iPadOS
In iPadOS, a split view may consist of two vertical panes, as seen in Mail, or three vertical panes, such as in Keynote.

**Account for narrow, compact, and intermediate window widths.** Given that iPad windows are fluidly resizable, it is crucial to consider how the split view layout behaves across different widths. Specifically, guarantee that users can navigate between all panes in a coherent manner. For design advice, refer to [Layout](layout.md). For developer implementation details, consult [NavigationSplitView](apple:SwiftUI/NavigationSplitView) and [UISplitViewController](apple:UIKit/UISplitViewController).
