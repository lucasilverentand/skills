---
name: settings
description: "Users anticipate that applications and games will function correctly, but they also value the ability to tailor the experience to their preferences. Use when designing settings for macOS, auditing settings against Apple's macOS guidelines, or when the user says things like \"design settings for Mac\", \"settings on macOS\", \"how should settings work on Mac\"."
allowed-tools: Read Grep Glob
---

# Settings
Users anticipate that applications and games will function correctly, but they also value the ability to tailor the experience to their preferences

## When to use
- User asks about **settings** on macOS (e.g. `"how do I design settings for Mac"`).
- User is building a Mac UI that needs settings and wants to follow Apple's guidelines.
- User asks to audit or review settings in a macOS design.
- User mentions settings in the context of a Mac app, game, or interface.

## Quick principles
- **Aim to provide default settings that give the best experience to the largest number of people** — For instance, instead of requiring players to select performance options after launch, you may automatically optimize the game for the device it…
- **Minimize the number of settings you offer** — While users value having control over an application or game, excessive settings can make the experience feel less intuitive and complicate the…
- **Make settings available in ways people expect** — For example, when a physical keyboard is connected, users often rely on the standard Command-Comma (,) shortcut to access application settings, whereas…
- **Avoid using settings to request setup information that can be obtained through alternative means** — For example, a game should automatically detect a connected controller or accessory rather than requiring the player to identify it; similarly, an…
- **Respect people’s systemwide settings and avoid including redundant versions of them in your custom settings area** — Users anticipate managing global options—such as accessibility features, scrolling behavior, and authentication methods—within the system-provided Settings app, and they expect all applications…
- **Place general, rarely modified configurations within your dedicated custom settings section** — Since users must pause their current activity to access an application's or game's settings, include options that do not require frequent adjustment
- **When possible, allow users to modify task-specific options without requiring them to navigate to the settings menu** — For instance, if adjustments involve filtering a list, reordering items, or toggling the visibility of view components, these controls should be available…
- **Include a settings item in the [App menu](the-menu-bar.md#App-menu)** — Avoid placing settings controls within a window’s toolbar, as this reduces the available screen real estate for frequently used essential commands
- **Dim a settings window’s minimize and maximize buttons** — Since users can quickly launch a custom settings window using the standard Command–Comma (,) keyboard shortcut, keeping it in the Dock is…
- **In your settings window, use a noncustomizable toolbar that remains visible and always indicates the active toolbar button** — The settings window’s toolbar serves to identify customizable areas and aids navigation between them
- **Update the window’s title to reflect the currently visible pane** — If your settings window does not utilize multiple panes, use the title *App Name* Settings
- **Restore the most recently viewed pane** — Since users frequently adjust related settings, it is helpful for the settings window to open directly to the last pane they were…

## Full guidance
Read the referenced files for the complete Apple guidance on this topic:
- @references/guidelines.md
