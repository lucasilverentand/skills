---
name: macos
description: "Apple Human Interface Guidelines for macOS — UI components, controls, navigation, and platform conventions for Mac. Use when designing for Mac, building a macOS UI, or auditing macOS components. Pair with `foundations` for shared principles and `services` for framework integrations. User says: \"design Mac UI\", \"macOS component\", \"audit my macOS app\"."
allowed-tools: Read Grep Glob
---

# macOS Design
Platform-specific HIG for macOS. Components, controls, navigation patterns, and conventions unique to Mac. Pair with `foundations` for cross-platform principles and `services` for framework integrations.

## How to use
1. **Match the user's UI element to a topic** — most map directly to component or pattern names.
2. **Read only the matched references**. Multi-file topics (`×N`) live in `references/<topic>/`.
3. **Pull in `foundations`** for shared principles (color, typography, layout, accessibility, shared UI like rating indicators).
4. **Pull in `services`** when integrating Apple frameworks (Pay, HealthKit, Siri, sensors, media playback).
5. **Stay on macOS.** For another Apple platform, point to the matching skill.

## Glossary
|Topic|Reference|Summary|
|---|---|---|
|`alerts`|`alerts.md`|Use alerts sparingly|
|`boxes`|`boxes.md`|box groups related information and components into a visually distinct unit|
|`buttons`|`buttons/` ×5|Style|
|`color-wells`|`color-wells.md`|color well enables users to modify the hue of text, shapes, guides, and other…|
|`column-views`|`column-views.md`|column view, also referred to as a *browser*, allows users to visualize and…|
|`combo-boxes`|`combo-boxes.md`|combo box integrates a text field and a pull-down button into a single control|
|`context-menus`|`context-menus.md`|context menu grants access to item-specific functionality without adding visual…|
|`designing-for-macos`|`designing-for-macos.md`|Macs are relied upon for demanding tasks—including deep productivity work,…|
|`dock-menus`|`dock-menus.md`|On macOS, a secondary click on an application or game icon in the Dock displays…|
|`drag-and-drop`|`drag-and-drop/` ×5|Depending on different factors, the drag and drop action may *move* the…|
|`edit-menus`|`edit-menus.md`|edit menu allows users to modify selected content within the current view,…|
|`entering-data`|`entering-data.md`|When collecting information from users, design processes that facilitate…|
|`file-management`|`file-management.md`|Users also anticipate being able to browse documents without first launching a…|
|`gauges`|`gauges.md`|gauge displays a precise numerical value constrained by a defined range|
|`going-full-screen`|`going-full-screen.md`|iPhone, iPad, and Mac devices support full-screen modes, allowing users to…|
|`image-views`|`image-views.md`|image view presents either a static image or an animated sequence against a…|
|`images`|`images.md`|To ensure optimal visual quality across all supported devices, familiarize…|
|`labels`|`labels.md`|label is static text that users can read and often copy, but they cannot modify|
|`lists-and-tables`|`lists-and-tables.md`|Tables and lists display information arranged across one or more columns of rows|
|`mac-catalyst`|`mac-catalyst/` ×3|Many iPad applications are excellent candidates for conversion into a Mac…|
|`multitasking`|`multitasking.md`|Multitasking enables users to rapidly transition between applications and…|
|`page-controls`|`page-controls.md`|page control presents a horizontal row of indicator images, with each image…|
|`panels`|`panels.md`|On macOS, a panel typically overlays other open windows, providing…|
|`path-controls`|`path-controls.md`|path control displays the file system location of a chosen file or directory|
|`pickers`|`pickers.md`|picker presents one or more scrollable lists containing unique values from…|
|`playing-audio`|`playing-audio.md`|Silence|
|`playing-haptics`|`playing-haptics.md`|Beyond inherent haptic capabilities, certain external input devices can also…|
|`playing-video`|`playing-video/` ×3|system-provided video players support different aspect ratio playback modes…|
|`pop-up-buttons`|`pop-up-buttons.md`|pop-up button presents a menu containing options that are mutually exclusive|
|`popovers`|`popovers.md`|popover functions as a temporary view that overlays other content upon…|
|`printing`|`printing.md`|Apps targeting iOS, iPadOS, macOS, or visionOS may incorporate the operating…|
|`progress-indicators`|`progress-indicators.md`|Progress indicators inform users that your application is actively working,…|
|`scroll-views`|`scroll-views.md`|scroll view enables users to examine content that exceeds the display…|
|`search-fields`|`search-fields.md`|search field allows users to locate specific content within a collection using…|
|`segmented-controls`|`segmented-controls.md`|segmented control presents as a linear arrangement of two or more segments,…|
|`settings`|`settings.md`|If required, you may implement a dedicated custom settings area within your…|
|`sheets`|`sheets.md`|sheet enables users to execute a focused task that is contextually linked to…|
|`sidebars`|`sidebars.md`|sidebar is a view element that appears on the leading edge of a screen,…|
|`sliders`|`sliders.md`|slider consists of a horizontal track and a control, known as the thumb, which…|
|`split-views`|`split-views.md`|split view manages the simultaneous presentation of multiple adjacent content…|
|`steppers`|`steppers.md`|stepper is a dual-segmented control used to increment or decrement an…|
|`tab-bars`|`tab-bars.md`|tab bar enables users to navigate between the application's highest-level…|
|`text-fields`|`text-fields.md`|text field is a rectangular region where users input or modify brief, specific…|
|`the-menu-bar`|`the-menu-bar/` ×13|Menu bar menus on iPad are comparable to those on Mac, appearing in the same…|
|`toggles`|`toggles.md`|Furthermore, all platforms support buttons that function as toggles if they…|
|`token-fields`|`token-fields.md`|token field is a specialized text input that transforms entered text into…|
|`toolbars`|`toolbars/` ×6|Toolbars perform actions on content within the view, facilitate movement…|
|`undo-and-redo`|`undo-and-redo.md`|Undo and redo provide users with simple mechanisms to reverse different actions|
|`windows`|`windows.md`|Conceptually, applications utilize two kinds of windows to display content:|
