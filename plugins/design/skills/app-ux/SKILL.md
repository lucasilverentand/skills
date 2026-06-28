---
name: app-ux
description: Designs, reviews, and implements app UX architecture for mobile, tablet, desktop, native, hybrid, cross-platform, and web/PWA apps. Use when shaping information architecture, navigation models, route contracts, URLs, deep links, state restoration, adaptive layouts, windows, sidebars, inspectors, toolbars, menus, command palettes, task flows, permission flows, accessibility, widgets, shortcuts, App Intents, App Actions, or system entry points. Trigger when the user asks for app UX, mobile UX, desktop app UX, app navigation, tabs vs sidebars, back behavior, deep links, route design, PWA navigation, app review, or a framework-agnostic plan before choosing SwiftUI, UIKit, AppKit, Jetpack Compose, React Native, Flutter, Kotlin Multiplatform, Electron, Tauri, Capacitor, native web views, or a PWA stack.
---

# App UX
Use this skill to design an app as a system of user goals, domain objects, destinations, routes, state, navigation surfaces, windows, task surfaces, and platform entry points. Keep UX architecture separate from the UI framework: the framework renders views, while the architecture defines the user's mental map and recovery paths.

## Usage Modes
- **Advisory conversation**: Use when the user wants app UX structure, critique, route/link decisions, navigation trade-offs, desktop/window behavior, or cross-platform IA. Ask only questions that change the information architecture, safety model, or implementation path.
- **Autonomous build or review**: Use when creating, modifying, or reviewing app UI. Infer the current navigation graph, route model, platform targets, windows, input modes, and sensitive flows from the repo before changing code.
- **Implementation handoff**: Use this skill for product structure and route/state contracts, then use platform or framework skills for SwiftUI, UIKit, AppKit, Android, Expo, Flutter, Electron, Tauri, web, or design-system-specific implementation details.

## Core Workflow
1. Identify the app type, user goals, durable domain objects, primary tasks, target platforms, input modes, window sizes, external entry points, and sensitive data.
2. Read `references/architecture-baseline.md` before modeling goals, domain objects, task flows, information architecture, and destination types.
3. Read `references/navigation-model.md` before choosing primary navigation, stack behavior, back behavior, modals, sheets, search, or command entry.
4. Read `references/routes-and-deep-links.md` when routes, URLs, deep links, external entry points, routing authority, or app-type navigation patterns matter.
5. Read `references/state-and-lifecycle.md` when state ownership, restoration, authentication handoff, lifecycle behavior, or unavailable routes matter.
6. Read `references/desktop-and-cross-platform.md` when the target includes desktop, tablet, large windows, multi-window behavior, sidebars, inspectors, menus, command palettes, document windows, keyboard shortcuts, pointer input, or cross-platform adaptation.
7. Read `references/interaction-quality.md` when evaluating layout, visual hierarchy, forms, loading, offline behavior, recovery, accessibility, privacy, permissions, widgets, shortcuts, AI actions, or system intents.
8. Read `references/patterns-checklists-and-sources.md` before final handoff or review. Use its examples, route worksheet, and checklist to catch missing destination, state, permission, fallback, and accessibility decisions.
9. Convert the resulting architecture into the target framework using the existing app router, window model, platform conventions, and design system.

## Reference Routing
|Need|Read|
|---|---|
|App UX baseline, window-first design, cross-surface UX, relationship model, information architecture, destination types|`references/architecture-baseline.md`|
|Navigation surfaces, primary nav rules, back behavior, modals, sheets, search, commands|`references/navigation-model.md`|
|Route vs URL vs deep link decisions, route contract template, good/bad URL design, native/hybrid/PWA routing authority, deep-link handling, app-type navigation patterns|`references/routes-and-deep-links.md`|
|State ownership, restoration rules, authentication handoff, lifecycle behavior, empty states, unavailable routes|`references/state-and-lifecycle.md`|
|Desktop, tablet, and large-window structure; sidebars, inspectors, split views, menus, command palettes, toolbars, multi-window behavior, pointer and keyboard input|`references/desktop-and-cross-platform.md`|
|Adaptive layout, visual hierarchy, task flows, forms, loading, offline, errors, accessibility, inclusive interaction, privacy, permissions, AI, shortcuts, widgets, system intents|`references/interaction-quality.md`|
|Good/bad examples, final UX architecture checklist, route specification worksheet, one-page decision summary, consulted sources, vocabulary|`references/patterns-checklists-and-sources.md`|

## Design Rules
- Start from user goals and domain objects, not screens, component libraries, router APIs, or visual trends.
- Treat the app window as the layout input. Define compact, medium, and expanded behavior before implementation starts.
- Keep primary destinations stable, labeled, user-recognizable, and tied to durable goals rather than campaigns or internal priorities.
- On desktop and large tablet, expose structure through sidebars, split views, toolbars, menus, inspectors, keyboard shortcuts, and command search when they match the user's work rhythm.
- Route every durable place, object detail, or recoverable task. Do not create routes for toasts, menus, tooltips, keyboard state, or temporary animation state.
- URL only destinations that should survive outside the current runtime: shareable content, web fallbacks, notification targets, search results, or restorable cross-device entry points.
- Preserve history-aware back behavior after organic navigation; use hierarchy as the fallback for cold starts, deep links, and restored destinations.
- Keep sensitive route data out of URLs, analytics, logs, screenshots, and notifications. Resolve sensitive links only after authentication and permission checks.
- Design signed-out, unauthorized, deleted, expired, offline, loading, and unavailable states for every externally addressable destination.
- Use AI, widgets, shortcuts, App Intents, and App Actions as route-aware entry points, not replacements for explicit information architecture.
- Use native and platform-aligned components for expected behaviors such as tabs, back, close, sheets, pickers, text selection, sharing, and permissions.

## Expected Outputs
For advisory work, return the app type, primary user goals, durable objects, recommended navigation model, route/link decisions, major trade-offs, and remaining questions that materially affect the architecture.

For design, review, or implementation work, produce or build:

1. User goals, domain objects, and primary task model.
2. Information architecture and top-level navigation model.
3. Destination classification: places, object details, tasks, and temporary UI.
4. Route map with internal route contracts and external URL/deep-link decisions.
5. Compact, medium, expanded, desktop, and multi-window presentation behavior.
6. State ownership for destination identity, durable view state, recoverable task state, and ephemeral UI state.
7. Back behavior, restoration, authentication handoff, permissions, and unavailable-route fallbacks.
8. Layout, form, loading, offline, error, accessibility, privacy, and recovery requirements.
9. System-surface plan for notifications, widgets, shortcuts, search, AI actions, App Intents, or App Actions when relevant.
10. Review checklist results before handoff or code completion.
