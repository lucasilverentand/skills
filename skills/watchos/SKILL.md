---
name: watchos
description: "Apple Human Interface Guidelines for watchOS — UI components, controls, navigation, and platform conventions for Apple Watch. Use when designing for Apple Watch, building a watchOS UI, or auditing watchOS components. Pair with `foundations` for shared principles and `services` for framework integrations. User says: \"design Apple Watch UI\", \"watchOS component\", \"audit my watchOS app\"."
allowed-tools: Read Grep Glob
---

# watchOS Design
Platform-specific HIG for watchOS. Components, controls, navigation patterns, and conventions unique to Apple Watch. Pair with `foundations` for cross-platform principles and `services` for framework integrations.

## How to use
1. **Match the user's UI element to a topic** — most map directly to component or pattern names.
2. **Read only the matched references**. Multi-file topics (`×N`) live in `references/<topic>/`.
3. **Pull in `foundations`** for shared principles (color, typography, layout, accessibility, shared UI like rating indicators).
4. **Pull in `services`** when integrating Apple frameworks (Pay, HealthKit, Siri, sensors, media playback).
5. **Stay on watchOS.** For another Apple platform, point to the matching skill.

## Glossary
|Topic|Reference|Summary|
|---|---|---|
|`action-button`|`action-button.md`|Action button provides users with swift access to preferred features on…|
|`action-sheets`|`action-sheets.md`|action sheet serves as a modal view that displays options pertaining to an…|
|`activity-rings`|`activity-rings.md`|Activity rings visually represent an individual's daily advancement toward…|
|`alerts`|`alerts.md`|Use alerts sparingly|
|`always-on`|`always-on.md`|On devices equipped with Always On display, the system can keep an app's…|
|`buttons`|`buttons.md`|Style|
|`collaboration-and-sharing`|`collaboration-and-sharing.md`|Effective collaboration and sharing experiences are straightforward and highly…|
|`complications`|`complications/` ×8|While most watch faces can accommodate at least one complication, some support…|
|`context-menus`|`context-menus.md`|context menu grants access to item-specific functionality without adding visual…|
|`designing-for-watchos`|`designing-for-watchos.md`|When a user glances at their Apple Watch, they understand it provides quick…|
|`digital-crown`|`digital-crown.md`|Digital Crown functions as a crucial hardware input mechanism for Apple Vision…|
|`drag-and-drop`|`drag-and-drop/` ×4|Depending on different factors, the drag and drop action may *move* the…|
|`image-views`|`image-views.md`|image view presents either a static image or an animated sequence against a…|
|`images`|`images.md`|To ensure optimal visual quality across all supported devices, familiarize…|
|`labels`|`labels.md`|label is static text that users can read and often copy, but they cannot modify|
|`lists-and-tables`|`lists-and-tables.md`|Tables and lists display information arranged across one or more columns of rows|
|`multitasking`|`multitasking.md`|Multitasking enables users to rapidly transition between applications and…|
|`page-controls`|`page-controls.md`|page control presents a horizontal row of indicator images, with each image…|
|`pickers`|`pickers.md`|picker presents one or more scrollable lists containing unique values from…|
|`playing-audio`|`playing-audio/` ×3|Silence|
|`playing-haptics`|`playing-haptics.md`|Beyond inherent haptic capabilities, certain external input devices can also…|
|`playing-video`|`playing-video/` ×3|system-provided video players support different aspect ratio playback modes…|
|`progress-indicators`|`progress-indicators.md`|Progress indicators inform users that your application is actively working,…|
|`scroll-views`|`scroll-views.md`|Support default scrolling gestures and keyboard shortcuts|
|`search-fields`|`search-fields.md`|search field allows users to locate specific content within a collection using…|
|`segmented-controls`|`segmented-controls.md`|segmented control presents as a linear arrangement of two or more segments,…|
|`settings`|`settings.md`|Users anticipate that applications and games will function correctly, but they…|
|`sheets`|`sheets.md`|sheet enables users to execute a focused task that is contextually linked to…|
|`sidebars`|`sidebars.md`|sidebar is a view element that appears on the leading edge of a screen,…|
|`sliders`|`sliders.md`|slider consists of a horizontal track and a control, known as the thumb, which…|
|`split-views`|`split-views.md`|split view manages the simultaneous presentation of multiple adjacent content…|
|`tab-bars`|`tab-bars.md`|tab bar enables users to navigate between the application's highest-level…|
|`tab-views`|`tab-views.md`|tab view displays several distinct content areas within a single frame,…|
|`text-fields`|`text-fields.md`|text field is a rectangular region where users input or modify brief, specific…|
|`toolbars`|`toolbars/` ×6|Toolbars perform actions on content within the view, facilitate movement…|
|`watch-faces`|`watch-faces.md`|watch face serves as the primary view selected by users within watchOS|
|`windows`|`windows.md`|window displays the user interface views and components within your application…|
|`workouts`|`workouts.md`|high-quality fitness or workout experience motivates users to engage with their…|
