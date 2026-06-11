# Settings — full guidelines
If required, you may implement a dedicated custom settings area within your application or game to provide general configuration options that influence the overall experience, such as interface styling or save behavior. For settings relevant only to a particular task, you can present these options directly within that task, preventing users from needing to navigate away from the current experience to customize it.

### Best practices
- **Aim to provide default settings that give the best experience to the largest number of people.** For instance, instead of requiring players to select performance options after launch, you may automatically optimize the game for the device it is running on (developer guidance can be found at [Improving your game’s graphics performance and settings](apple:Metal/improving-your-games-graphics-performance-and-settings)). By establishing suitable defaults, users may not need to make any adjustments before they can begin enjoying your application or game.
- **Minimize the number of settings you offer.** While users value having control over an application or game, excessive settings can make the experience feel less intuitive and complicate the process of locating a specific option.
- **Make settings available in ways people expect.** For example, when a physical keyboard is connected, users often rely on the standard Command-Comma (,) shortcut to access application settings, whereas in a game context, players frequently use the Esc (Escape) key.
- **Avoid using settings to request setup information that can be obtained through alternative means.** For example, a game should automatically detect a connected controller or accessory rather than requiring the player to identify it; similarly, an application can automatically detect whether users are currently utilizing Dark Mode.
- **Respect people’s systemwide settings and avoid including redundant versions of them in your custom settings area.** Users anticipate managing global options—such as accessibility features, scrolling behavior, and authentication methods—within the system-provided Settings app, and they expect all applications and games to honor those choices. Including custom versions of these global options in your settings risks confusing users, as it suggests that systemwide choices may not apply to your app or game, and that changing a custom setting might affect other applications as well.

### General settings
**Place general, rarely modified configurations within your dedicated custom settings section.** Since users must pause their current activity to access an application's or game's settings, include options that do not require frequent adjustment. For instance, an application might provide controls for window arrangement; a game could allow players to define save mechanics or key bindings; both types of software might offer account management options.

### Task-specific options
**When possible, allow users to modify task-specific options without requiring them to navigate to the settings menu.** For instance, if adjustments involve filtering a list, reordering items, or toggling the visibility of view components, these controls should be available on the screens they affect, ensuring discoverability and convenience. Placing such context-dependent options in a separate settings area breaks the user's flow, necessitating task suspension to make changes and often delaying the visual outcome until the task resumes.

> **Note**
> In gaming scenarios, players typically adjust their approach to a specific task as an intrinsic part of the gameplay experience, rather than through a dedicated settings option.

### System settings
Include only infrequently modified options within the system Settings application. If you choose to integrate your application or game settings into the system Settings, provide a button in your interface that allows users to open it directly.

## Platform guidance — macOS
When users select the Settings item in your application’s or game’s App menu, your dedicated settings window appears. Typically, this custom settings window includes a toolbar that allows users to switch between views, known as *panes*, each containing a specific group of settings.

- **Include a settings item in the **App menu**.** Avoid placing settings controls within a window’s toolbar, as this reduces the available screen real estate for frequently used essential commands. If you are providing options related to the document itself, place this item in your app’s **File menu**.
- **Dim a settings window’s minimize and maximize buttons.** Since users can quickly launch a custom settings window using the standard Command–Comma (,) keyboard shortcut, keeping it in the Dock is unnecessary. Furthermore, because a settings window adjusts to the size of its current pane, users do not need to expand the window to view all content.
- **In your settings window, use a noncustomizable toolbar that remains visible and always indicates the active toolbar button.** The settings window’s toolbar serves to identify customizable areas and aids navigation between them. Users depend on a stable settings interface to locate the controls they require.
- **Update the window’s title to reflect the currently visible pane.** If your settings window does not utilize multiple panes, use the title *App Name* Settings.
- **Restore the most recently viewed pane.** Since users frequently adjust related settings, it is helpful for the settings window to open directly to the last pane they were using.
