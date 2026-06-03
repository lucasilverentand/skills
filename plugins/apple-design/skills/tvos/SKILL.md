---
name: tvos
description: "Apple Human Interface Guidelines for tvOS — UI components, controls, navigation, and platform conventions for Apple TV. Use when designing for Apple TV, building a tvOS UI, or auditing tvOS components. Pair with `foundations` for shared principles and `services` for framework integrations. User says: \"design Apple TV UI\", \"tvOS component\", \"audit my tvOS app\"."
allowed-tools: Read Grep Glob
---

# tvOS Design
Platform-specific HIG for tvOS. Components, controls, navigation patterns, and conventions unique to Apple TV. Pair with `foundations` for cross-platform principles and `services` for framework integrations.

## How to use
1. **Match the user's UI element to a topic** — most map directly to component or pattern names.
2. **Read only the matched references**. Directory topics live in `references/<topic>/`.
3. **Pull in `foundations`** for shared principles (color, typography, layout, accessibility, shared UI like rating indicators).
4. **Pull in `services`** when integrating Apple frameworks (Pay, HealthKit, Siri, sensors, media playback).
5. **Stay on tvOS.** For another Apple platform, point to the matching skill.

## Glossary
|Topic|Reference|Summary|
|---|---|---|
|`alerts`|`alerts.md`|Use alerts sparingly|
|`buttons`|`buttons.md`|Style|
|`context-menus`|`context-menus.md`|context menu grants access to item-specific functionality without adding visual…|
|`designing-for-tvos`|`designing-for-tvos.md`|tvOS provides vibrant content, deeply immersive experiences, and streamlined…|
|`drag-and-drop`|`drag-and-drop/`|Depending on different factors, the drag and drop action may *move* the…|
|`focus-and-selection`|`focus-and-selection.md`|Focus assists users in visually confirming the element they intend to interact…|
|`image-views`|`image-views.md`|image view presents either a static image or an animated sequence against a…|
|`images`|`images.md`|Different devices render visuals at varying resolutions|
|`lists-and-tables`|`lists-and-tables.md`|Tables and lists display information arranged across one or more columns of rows|
|`multitasking`|`multitasking.md`|Multitasking enables users to rapidly transition between applications and…|
|`page-controls`|`page-controls.md`|page control presents a horizontal row of indicator images, with each image…|
|`pickers`|`pickers.md`|picker presents one or more scrollable lists containing unique values from…|
|`playing-audio`|`playing-audio.md`|Silence|
|`playing-haptics`|`playing-haptics.md`|Haptic feedback can involve users' sense of touch, allowing you to integrate a…|
|`playing-video`|`playing-video/`|system-provided video players support different aspect ratio playback modes…|
|`progress-indicators`|`progress-indicators.md`|Progress indicators inform users that your application is actively working,…|
|`remotes`|`remotes.md`|Use standard gestures for common actions|
|`scroll-views`|`scroll-views.md`|scroll view enables users to examine content that exceeds the display…|
|`search-fields`|`search-fields.md`|search field allows users to locate specific content within a collection using…|
|`segmented-controls`|`segmented-controls.md`|segmented control presents as a linear arrangement of two or more segments,…|
|`sheets`|`sheets.md`|sheet enables users to execute a focused task that is contextually linked to…|
|`sidebars`|`sidebars.md`|sidebar is a view element that appears on the leading edge of a screen,…|
|`sliders`|`sliders.md`|slider consists of a horizontal track and a control, known as the thumb, which…|
|`split-views`|`split-views.md`|split view manages the simultaneous presentation of multiple adjacent content…|
|`tab-bars`|`tab-bars.md`|tab bar enables users to navigate between the application's highest-level…|
|`text-fields`|`text-fields.md`|text field is a rectangular region where users input or modify brief, specific…|
|`text-views`|`text-views.md`|TextView presents multi-line, styled text content that may or may not be…|
|`toolbars`|`toolbars/`|Toolbars perform actions on content within the view, facilitate movement…|
|`top-shelf`|`top-shelf/`|Top Shelf presents a unique chance to highlight new, featured, or recommended…|
|`windows`|`windows.md`|window displays the user interface views and components within your application…|
